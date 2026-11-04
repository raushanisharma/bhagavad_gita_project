# Gita for Life

A web app that makes the Bhagavad Gita practical for everyday life.

## Features

| Feature | Route | Description |
| --- | --- | --- |
| Gita for Your Mood | `/mood`, `/mood/[mood]` | Choose one of 12 moods (angry, confused, sad, stressed, ...) and get matching shlokas with explanations. |
| Ask Krishna (AI guide) | `/ask` | Describe a situation in English, Hindi or Hinglish. Gemini picks relevant verses from the curated library and gives a practical lesson. Every answer is labelled as AI-generated. |
| Shloka to Real Life | `/shlokas`, `/shlokas/[id]` | 45 key verses with a real-life situation, a simple example and a practical takeaway, plus search and theme filters. Every one of the 700 verses also has its own page at `/shlokas/<chapter>-<verse>`. |
| Chapters | `/chapters`, `/chapters/[n]` | All 18 chapters with summaries and **all 700 verses** (Sanskrit, transliteration, translation). Includes a jump-to-verse form. |
| Quiz | `/quiz` | Rounds of 5 random questions from a 15-question bank. |
| My Journey | `/journey` | Daily streak, verses read, moods explored and badges. Stored in `localStorage`, so no account is needed. |
| Daily shloka | `/` | A verse of the day that changes each calendar day. |
| Listen (TTS) | everywhere | Calm narrator audio for any verse (Sanskrit, then its meaning) and for Ask Krishna answers. Female or male voice, saved per browser. |

## Getting started

```bash
npm install
cp .env.example .env   # then add your Gemini API key
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `GEMINI_API_KEY` | Yes, for `/ask` | none | Google Gemini API key. Without it, every page except Ask Krishna still works. |
| `GEMINI_MODEL` | No | `gemini-3.5-flash-lite` | Gemini model used by `/api/ask`. |
| `GEMINI_TTS_MODEL` | No | `gemini-3.8-flash-lite-tts` | Text-to-speech model. |
| `GEMINI_TTS_VOICE_FEMALE` | No | `Sulafat` | Prebuilt voice for the female option. |
| `GEMINI_TTS_VOICE_MALE` | No | `Algieba` | Prebuilt voice for the male option. |

## How "Ask Krishna" stays grounded

- The Gemini model gets the catalog of curated verses (id, themes and meaning) in its system instruction. It can only return verse IDs from that catalog (enforced by a JSON-schema `enum`).
- Sanskrit, transliteration and translation are always rendered from local data (`src/data/verses.ts`). The model never writes them, so it cannot invent a fake shloka.
- The response is structured JSON (`verseIds`, `answer`, `lesson`, `reflection`, `crisis`) and is validated with Zod on the server.
- If a message mentions self-harm or danger, the model sets `crisis: true` and the UI shows helpline information (Tele-MANAS 14416, emergency 112).
- A simple per-IP rate limit (20 requests per 10 minutes) protects the API key. It is in-memory and per instance, so use a shared store such as Redis or Upstash if you deploy several instances.

## Audio (Gemini TTS)

- `GET /api/tts/verse?id=2.47&voice=female|male` recites the Sanskrit, pauses, then reads the meaning. The text comes from the app's own data, so the response is cached publicly for a year; on a CDN each verse and voice is generated once.
- `POST /api/tts` with `{ text, voice }` reads an Ask Krishna answer (max 1,500 characters, rate-limited).
- Sanskrit and English are generated as separate segments in parallel and joined with a short pause. In testing, the lite model often skipped one language when both were in one request.
- The TTS models reject system instructions, so persona and style go into the prompt. Sanskrit is sent as bare Devanagari, because English directions were sometimes read aloud; speech segments use a director's-notes prompt.
- **Every clip is verified before it is served:** it is transcribed with the text model and compared with the source text (Devanagari consonant bigrams, or the transliteration if the transcript is in Latin letters). Clips that skipped words, read instructions aloud, or recited a different verse are regenerated, up to 3 attempts. This adds one cheap transcription call per clip and roughly 1-2 seconds on a cache miss.
- Generated audio is cached in memory on the server (80 MB, LRU) and in the browser. Bump `PROMPT_VERSION` in `src/lib/tts.ts` and `AUDIO_VERSION` in `src/components/ListenButton.tsx` after changing prompts or voices.

## Project structure

```
src/
  app/                 Routes (App Router) and /api/ask route handler
  components/          UI components
  data/                Verses, chapters, moods and quiz bank
  lib/                 Gemini client, progress/badge store, URL helpers
```

## Deploying to Cloudflare Workers

The app runs on Cloudflare Workers through the [OpenNext adapter](https://opennext.js.org/cloudflare), live at https://gita.raushani.com.

```bash
# one-time: put the key in .dev.vars (git-ignored), e.g. copy the GEMINI_* lines from .env
grep -E "^GEMINI_" .env > .dev.vars

npm run preview                                   # build + run locally on the Workers runtime (port 8787)
npx opennextjs-cloudflare build                   # production build
npx opennextjs-cloudflare deploy --secrets-file .dev.vars   # deploy and upload the key as an encrypted secret
```

- `wrangler.jsonc` sets the worker name (`gita-for-life`) and the `gita.raushani.com` custom domain; wrangler creates the DNS record.
- Prerendered pages are served from Workers static assets (`open-next.config.ts` uses the static-assets incremental cache), so no R2 or KV is needed.
- Verse audio is stored in Cloudflare's Cache API per data centre, so each verse and voice is generated once per location.
- The worker is about 2 MB gzipped, under the Free plan's 3 MB limit.
- If `next build` fails with `ENOTEMPTY`, delete `.next` and `.open-next` and build again (a running `next dev` can cause this).

### Gemini quotas

On the Gemini free tier the TTS model allows **100 requests per day**. A new verse recitation uses at least 2 requests (Sanskrit and meaning), more if verification retries. When the daily quota runs out, Listen shows "Today's audio limit has been reached" until it resets. Enable billing in Google AI Studio for real traffic.

## Complete Gita text

`src/data/gita.json` holds all 700 verses plus the 13.0 prelude. It is generated, not hand-edited:

```bash
npx tsx scripts/build-gita.ts            # downloads the source dataset
npx tsx scripts/build-gita.ts ./dataset  # or uses a local copy
```

The script:

- Takes the Sanskrit text and Shri Purohit Swami's English translation from the open [gita/gita](https://github.com/gita/gita) dataset (Unlicense). The Sanskrit is public domain. Purohit Swami's translation (1935) is public domain in India and most other countries; the dataset's copy is lightly modernised, so the app credits it as "adapted".
- Generates IAST transliteration from the Devanagari. The dataset's own transliteration and word meanings are not used.
- Repairs a legacy-font bug in the source where a vowel sign appears before its consonant (for example निश्िचतं → निश्चितं).
- Renumbers chapter 13 to the standard 700-verse count. The source has Arjuna's opening question as 13.1; the app shows it as the 13.0 prelude.
- Replaces two broken source translations (1.7 and 16.6) with translations written for the app, and strips a stray "Revised:" prefix (2.48).
- Fails the build if any chapter's verse count is wrong or the text still has digits, Latin letters or invalid vowel signs.

`src/data/gita.ts` is server-only, so the full text never ships in a client bundle.

## Content notes

- 45 verses are curated with simplified translations, explanations and real-life sections written for this app. The remaining verses use the classic translation described above.
- Ask Krishna grounds its answers in the 45 curated verses.
- To add a verse, append it to `src/data/verses.ts` with its moods and themes. It then shows up automatically in mood pages, search, chapters and the AI catalog.

## Tech

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4, `@google/genai`, Zod.
