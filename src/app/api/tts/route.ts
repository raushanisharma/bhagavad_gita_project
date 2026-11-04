import { createHash } from "node:crypto";

import { z } from "zod";

import { clientIp, createRateLimiter } from "@/lib/rate-limit";
import { speak, ttsError, wavResponse } from "@/lib/tts";

const MAX_CHARS = 1500;
const isLimited = createRateLimiter(15, 10 * 60 * 1000);

const BodySchema = z.object({
  text: z.string().trim().min(1).max(MAX_CHARS),
  voice: z.enum(["female", "male"]),
});

/**
 * POST /api/tts  { text, voice }
 * Reads a guide answer aloud. Used for Ask Krishna replies.
 */
export async function POST(request: Request) {
  if (isLimited(clientIp(request))) {
    return Response.json({ error: "Too many audio requests. Please pause for a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: `Text must be 1-${MAX_CHARS} characters.` }, { status: 400 });
  }

  const { text, voice } = parsed.data;
  const key = `text:${createHash("sha256").update(text).digest("hex")}`;

  try {
    const wav = await speak(key, [{ kind: "speech", text }], voice);
    return wavResponse(wav, "private, no-store");
  } catch (err) {
    return ttsError(err);
  }
}
