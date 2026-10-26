import { describe, expect, it } from "vitest";
import { ask, parseAnswer } from "./assistant.js";

describe("parseAnswer", () => {
  it("reads clean JSON, JSON inside text and plain text", () => {
    expect(parseAnswer('{"answer":"Hi"}')).toBe("Hi");
    expect(parseAnswer('Sure! {"answer":"Hello"} done')).toBe("Hello");
    expect(parseAnswer("<think>hmm</think>Plain answer")).toBe("Plain answer");
    expect(parseAnswer("")).toBeNull();
  });
});

describe("ask", () => {
  it("falls back to the next model and retries without JSON mode", async () => {
    const calls: string[] = [];
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      const sent = JSON.parse(String(init.body)) as { model: string; response_format?: unknown };
      calls.push(`${sent.model}:${sent.response_format ? "json" : "text"}`);
      if (sent.model === "down") return new Response("", { status: 503 });
      if (sent.response_format) return new Response("", { status: 400 });
      return Response.json({ choices: [{ message: { content: "Plain reply" } }] });
    }) as typeof fetch;
    const reply = await ask("hello", [], { apiKey: "k", baseUrl: "http://ai", models: ["down", "ok"], fetchImpl });
    expect(reply).toEqual({ answer: "Plain reply", model: "ok" });
    expect(calls).toEqual(["down:json", "ok:json", "ok:text"]);
  });
});
