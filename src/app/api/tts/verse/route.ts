import { getFullVerse } from "@/data/gita";
import { getVerse } from "@/data/verses";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import {
  edgeCacheMatch,
  edgeCachePut,
  isVoiceGender,
  speak,
  ttsError,
  verseCacheRequest,
  wavResponse,
} from "@/lib/tts";

// Generous: verse audio is cached, so only cache misses reach Gemini.
const isLimited = createRateLimiter(40, 10 * 60 * 1000);

/**
 * GET /api/tts/verse?id=2.47&voice=female
 * Recites the Sanskrit, pauses, then reads the meaning. The text comes from
 * our own data (never from the client), so responses are safe to cache
 * publicly and forever.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const voice = url.searchParams.get("voice");

  if (!isVoiceGender(voice)) return Response.json({ error: "voice must be female or male" }, { status: 400 });
  const verse = getFullVerse(id);
  if (!verse) return Response.json({ error: "Unknown verse" }, { status: 404 });

  // On Cloudflare, serve from the edge cache first: no Gemini call, no rate limit.
  const cacheRequest = verseCacheRequest(verse.id, voice);
  const cached = await edgeCacheMatch(cacheRequest);
  if (cached) return cached;

  if (isLimited(clientIp(request))) {
    return Response.json({ error: "Too many audio requests. Please pause for a few minutes." }, { status: 429 });
  }

  const sanskrit = [verse.speakerLine, verse.sanskrit].filter(Boolean).join("\n");
  const meaning = getVerse(verse.id)?.translation ?? verse.translation;

  try {
    const wav = await speak(
      `verse:${verse.id}`,
      [
        { kind: "sanskrit", text: sanskrit, romanized: verse.transliteration },
        { kind: "speech", text: meaning },
      ],
      voice,
    );
    const response = wavResponse(wav, "public, max-age=31536000, immutable");
    await edgeCachePut(cacheRequest, response.clone());
    return response;
  } catch (err) {
    return ttsError(err);
  }
}
