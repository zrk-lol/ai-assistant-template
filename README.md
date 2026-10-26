# AI assistant template

The back end of a website assistant, by **Varhex by Ȥrk Team**. It answers visitors **only from the facts you write**, never invents prices or deadlines, and keeps your API key on the server.

- Works with any OpenAI-compatible API (Groq has a free tier)
- Tries several models in order, retries without JSON mode when a model refuses it
- Validates every request, limits history length, restricts CORS to your site
- Tested without calling a real AI

## Start

```bash
npm install
cp .env.example .env   # add AI_API_KEY
# edit src/facts.ts with your own business facts
npm run dev
```

```bash
curl -X POST http://localhost:3001/chat -H 'content-type: application/json' -d '{"question":"What do you do?"}'
```

## Français

Back-end d’assistant IA pour site web : il ne répond qu’à partir des faits écrits dans `src/facts.ts`, n’invente jamais de prix ni de délai, garde la clé côté serveur et bascule sur un autre modèle en cas de panne.

---
Made by [Varhex by Ȥrk Team](https://varhex.com) · MIT licence
