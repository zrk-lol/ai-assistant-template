import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { ask } from "./assistant.js";

const env = z.object({
  AI_API_KEY: z.string().default("").pipe(z.string().min(1, "AI_API_KEY is missing (see .env.example)")),
  AI_BASE_URL: z.string().url().default("https://api.groq.com/openai/v1"),
  AI_MODELS: z.string().default("llama-3.3-70b-versatile"),
  ALLOWED_ORIGINS: z.string().default(""),
  PORT: z.coerce.number().default(3001),
}).parse(process.env);

const body = z.object({
  question: z.string().min(1).max(500),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(800) })).max(10).default([]),
});

const app = new Hono();
app.use("/chat", cors({ origin: env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()).filter(Boolean) }));
app.post("/chat", async (c) => {
  const parsed = body.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
  const reply = await ask(parsed.data.question, parsed.data.history, { apiKey: env.AI_API_KEY, baseUrl: env.AI_BASE_URL, models: env.AI_MODELS.split(",").map((model) => model.trim()) });
  return reply ? c.json(reply) : c.json({ error: "The assistant is unavailable, please try again later." }, 503);
});

serve({ fetch: app.fetch, port: env.PORT }, () => console.log(`Assistant API on http://localhost:${env.PORT}/chat`));
