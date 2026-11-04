import "server-only";

import { ApiError } from "@google/genai";

import { GEMINI_MODEL, getGemini } from "./gemini";

export type VoiceGender = "female" | "male";

export const TTS_MODEL = process.env.GEMINI_TTS_MODEL || "gemini-3.8-flash-lite-tts";

const VOICES: Record<VoiceGender, string> = {
  female: process.env.GEMINI_TTS_VOICE_FEMALE || "Sulafat", // warm
  male: process.env.GEMINI_TTS_VOICE_MALE || "Algieba", // smooth
};

export function isVoiceGender(v: unknown): v is VoiceGender {
  return v === "female" || v === "male";
}

export type SegmentKind = "sanskrit" | "speech";

export interface Segment {
  kind: SegmentKind;
  text: string;
  /** IAST transliteration, used to verify transcripts written in Latin letters. */
  romanized?: string;
}

/** Part of every cache key: bump when prompts change so old audio is discarded. */
const PROMPT_VERSION = "3";

/**
 * The TTS models reject system instructions, so any style direction has to go
 * into the prompt, and the model sometimes reads it aloud.
 *  - Sanskrit: sent as bare Devanagari with no instruction at all. Any English
 *    direction (e.g. "Recite this shloka...") was occasionally spoken. The calm
 *    delivery comes from the chosen voice.
 *  - Speech (English / Hindi / Hinglish): a director's-notes layout with a
 *    clearly marked transcript, which keeps the notes out of the audio in testing.
 * Every clip is still verified by transcription (see `synthesizeSegment`).
 */
function prompt(segment: Segment): string {
  if (segment.kind === "sanskrit") return segment.text;
  return `### DIRECTOR'S NOTES
Read the transcript exactly as written. Do not add, skip or change any words.
Voice: calm, peaceful, warm and reassuring. Pace: slow, with soft natural pauses.
#### TRANSCRIPT
${segment.text}`;
}

interface Pcm {
  data: Buffer;
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
}

/** Accepts either a WAV container or raw 16-bit PCM ("audio/L16;rate=24000"). */
function toPcm(bytes: Buffer, mimeType: string): Pcm {
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WAVE") {
    let offset = 12;
    let fmt: Omit<Pcm, "data"> | null = null;
    while (offset + 8 <= bytes.length) {
      const id = bytes.toString("ascii", offset, offset + 4);
      const size = bytes.readUInt32LE(offset + 4);
      const body = offset + 8;
      if (id === "fmt ") {
        fmt = {
          channels: bytes.readUInt16LE(body + 2),
          sampleRate: bytes.readUInt32LE(body + 4),
          bitsPerSample: bytes.readUInt16LE(body + 14),
        };
      } else if (id === "data" && fmt) {
        return { ...fmt, data: bytes.subarray(body, Math.min(body + size, bytes.length)) };
      }
      offset = body + size + (size % 2);
    }
    throw new Error("Malformed WAV returned by TTS model");
  }
  const rate = Number(/rate=(\d+)/.exec(mimeType)?.[1] ?? 24000);
  return { data: bytes, sampleRate: rate, channels: 1, bitsPerSample: 16 };
}

function toWav(pcm: Pcm): Buffer {
  const blockAlign = (pcm.channels * pcm.bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.data.length, 4);
  header.write("WAVE", 8, "ascii");
  header.write("fmt ", 12, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(pcm.channels, 22);
  header.writeUInt32LE(pcm.sampleRate, 24);
  header.writeUInt32LE(pcm.sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(pcm.bitsPerSample, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.data.length, 40);
  return Buffer.concat([header, pcm.data]);
}

export class TtsUnavailableError extends Error {}

async function generate(segment: Segment, gender: VoiceGender): Promise<Pcm> {
  const ai = getGemini();
  if (!ai) throw new TtsUnavailableError("GEMINI_API_KEY is not set");

  const response = await ai.models.generateContent({
    model: TTS_MODEL,
    contents: [{ parts: [{ text: prompt(segment) }] }],
    config: {
      responseModalities: ["AUDIO"],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICES[gender] } } },
    },
  });

  const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error("TTS model returned no audio");
  return toPcm(Buffer.from(part.inlineData.data, "base64"), part.inlineData.mimeType ?? "");
}

// ---------- Verification ----------

/** Devanagari consonants only: robust to anusvara/virama and sandhi spelling variants. */
const devaConsonants = (s: string) => s.replace(/[^\u0915-\u0939\u0958-\u095F]/g, "");
const latinWords = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1);

function dice<T>(a: T[], b: T[]): number {
  if (!a.length || !b.length) return 0;
  const counts = new Map<T, number>();
  for (const x of a) counts.set(x, (counts.get(x) ?? 0) + 1);
  let overlap = 0;
  for (const x of b) {
    const n = counts.get(x) ?? 0;
    if (n > 0) {
      overlap++;
      counts.set(x, n - 1);
    }
  }
  return (2 * overlap) / (a.length + b.length);
}

const bigrams = (s: string) => Array.from({ length: Math.max(0, s.length - 1) }, (_, i) => s.slice(i, i + 2));

const latinLetters = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");

/**
 * 0..1 similarity between what we asked for and what was heard.
 * Sanskrit is compared on Devanagari consonant bigrams; if the transcriber
 * wrote it in Latin letters instead, it is compared with the transliteration.
 */
export function similarity(expected: string, heard: string, romanized?: string): number {
  const exp = devaConsonants(expected);
  if (exp.length >= 6) {
    const deva = dice(bigrams(exp), bigrams(devaConsonants(heard)));
    const latin = romanized ? dice(bigrams(latinLetters(romanized)), bigrams(latinLetters(heard))) : 0;
    return Math.max(deva, latin);
  }
  return dice(latinWords(expected), latinWords(heard));
}

const LEAK = /recit|director|transcript|exactly as written|natural pauses|reverent|peaceful voice|shloka from the/i;
const MIN_SIMILARITY = 0.6;
const MAX_ATTEMPTS = 3;

async function transcribe(pcm: Pcm): Promise<string> {
  const ai = getGemini();
  if (!ai) throw new TtsUnavailableError("GEMINI_API_KEY is not set");
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        parts: [
          { inlineData: { mimeType: "audio/wav", data: toWav(pcm).toString("base64") } },
          {
            text: "Transcribe everything spoken in this audio, word for word. Use Devanagari for Sanskrit and Hindi, Latin letters for English and Hinglish. Output only the transcript.",
          },
        ],
      },
    ],
  });
  return response.text ?? "";
}

/**
 * Generate a segment and check it by transcribing it back. Retries when the
 * model read the instructions aloud, improvised, or recited a different verse.
 */
async function synthesizeSegment(segment: Segment, gender: VoiceGender): Promise<Pcm> {
  let lastScore = 0;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const pcm = await generate(segment, gender);
    const heard = await transcribe(pcm);
    const score = similarity(segment.text, heard, segment.romanized);
    // Only a leak if the instruction words were heard but are not in the text itself.
    const leaked = LEAK.test(heard) && !LEAK.test(segment.text);
    if (score >= MIN_SIMILARITY && !leaked) return pcm;
    lastScore = score;
    console.warn(
      `TTS verification failed (attempt ${attempt}/${MAX_ATTEMPTS}, ${segment.kind}, ${VOICES[gender]}): ` +
        `similarity ${score.toFixed(2)}${leaked ? ", instructions read aloud" : ""}`,
    );
  }
  throw new TtsVerificationError(`Audio did not match the text after ${MAX_ATTEMPTS} attempts (last ${lastScore.toFixed(2)})`);
}

export class TtsVerificationError extends Error {}

/**
 * Synthesize one or more segments and join them with short silences.
 * Segments are generated (and verified) in parallel. Mixed-language text should
 * be split into separate segments: the lite model tends to skip one language otherwise.
 */
async function synthesize(segments: Segment[], gender: VoiceGender, pauseSeconds = 0.9): Promise<Buffer> {
  const parts = await Promise.all(segments.map((s) => synthesizeSegment(s, gender)));
  const { sampleRate, channels, bitsPerSample } = parts[0];
  if (parts.some((p) => p.sampleRate !== sampleRate || p.channels !== channels || p.bitsPerSample !== bitsPerSample)) {
    throw new Error("TTS segments returned different audio formats");
  }
  const silence = Buffer.alloc(Math.round(pauseSeconds * sampleRate) * channels * (bitsPerSample / 8));
  const chunks: Buffer[] = [];
  parts.forEach((p, i) => {
    if (i > 0) chunks.push(silence);
    chunks.push(p.data);
  });
  return toWav({ data: Buffer.concat(chunks), sampleRate, channels, bitsPerSample });
}

// ---------- Cache (bounded by bytes) + in-flight de-duplication ----------

const MAX_CACHE_BYTES = 80 * 1024 * 1024;
const cache = new Map<string, Buffer>();
let cacheBytes = 0;
const inFlight = new Map<string, Promise<Buffer>>();

function remember(key: string, wav: Buffer) {
  cache.set(key, wav);
  cacheBytes += wav.length;
  for (const [k, v] of cache) {
    if (cacheBytes <= MAX_CACHE_BYTES) break;
    cache.delete(k);
    cacheBytes -= v.length;
  }
}

export async function speak(cacheKey: string, segments: Segment[], gender: VoiceGender): Promise<Buffer> {
  const key = `${PROMPT_VERSION}:${TTS_MODEL}:${VOICES[gender]}:${cacheKey}`;
  const hit = cache.get(key);
  if (hit) {
    // refresh LRU position
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const pending = inFlight.get(key);
  if (pending) return pending;

  const job = synthesize(segments, gender)
    .then((wav) => {
      remember(key, wav);
      return wav;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, job);
  return job;
}

// ---------- Cloudflare edge cache ----------

interface EdgeCache {
  match(request: Request): Promise<Response | undefined>;
  put(request: Request, response: Response): Promise<void>;
}

/** Cloudflare's per-location Cache API (`caches.default`); null outside Workers. */
function edgeCache(): EdgeCache | null {
  const storage = (globalThis as unknown as { caches?: { default?: EdgeCache } }).caches;
  return storage?.default ?? null;
}

/**
 * Edge-cache key for a verse recitation. Includes everything that changes the
 * audio, so a new prompt version, model or voice never serves stale clips.
 */
export function verseCacheRequest(verseId: string, gender: VoiceGender): Request {
  const parts = [PROMPT_VERSION, TTS_MODEL, VOICES[gender], verseId].map(encodeURIComponent).join("/");
  return new Request(`https://tts-cache.gita.internal/verse/${parts}`);
}

export async function edgeCacheMatch(request: Request): Promise<Response | null> {
  try {
    return (await edgeCache()?.match(request)) ?? null;
  } catch {
    return null;
  }
}

export async function edgeCachePut(request: Request, response: Response): Promise<void> {
  try {
    await edgeCache()?.put(request, response);
  } catch (err) {
    console.warn("Edge cache put failed", err);
  }
}

export function wavResponse(wav: Buffer, cacheControl: string): Response {
  return new Response(new Uint8Array(wav), {
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(wav.length),
      "Cache-Control": cacheControl,
    },
  });
}

/** Maps TTS failures to JSON error responses. */
export function ttsError(err: unknown): Response {
  if (err instanceof TtsUnavailableError) {
    return Response.json({ error: "Audio is not configured. Add GEMINI_API_KEY and restart." }, { status: 503 });
  }
  if (err instanceof TtsVerificationError) {
    console.error(err.message);
    return Response.json({ error: "The voice came out unclear. Please try again." }, { status: 502 });
  }
  if (err instanceof ApiError) {
    console.error(`Gemini TTS error ${err.status}: ${err.message}`);
    if (err.status === 429 && /per_?day/i.test(err.message)) {
      return Response.json(
        { error: "Today's audio limit has been reached. Listening will be back tomorrow." },
        { status: 503 },
      );
    }
    const status = err.status === 429 ? 503 : 502;
    return Response.json({ error: "The voice service is busy. Please try again in a moment." }, { status });
  }
  console.error("TTS failed", err);
  return Response.json({ error: "Could not create audio. Please try again." }, { status: 502 });
}
