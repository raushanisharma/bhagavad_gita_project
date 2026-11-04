import { ApiError } from "@google/genai";
import { z } from "zod";

import { verseById, verses } from "@/data/verses";
import { GEMINI_MODEL, getGemini } from "@/lib/gemini";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

const MAX_TURNS = 10;
const MAX_CHARS = 1000;

const RequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        text: z.string().trim().min(1).max(MAX_CHARS),
      }),
    )
    .min(1)
    .max(40),
});

const AnswerSchema = z.object({
  verseIds: z.array(z.string()).max(3),
  answer: z.string().min(1),
  lesson: z.string(),
  reflection: z.string(),
  crisis: z.boolean(),
});

export type AskAnswer = z.infer<typeof AnswerSchema>;

// JSON Schema handed to Gemini for structured output. Kept in sync with AnswerSchema.
const responseJsonSchema = {
  type: "object",
  properties: {
    verseIds: {
      type: "array",
      description: "1 or 2 verse ids copied exactly from the VERSE CATALOG (e.g. \"2.47\"). Empty only for greetings or off-topic messages.",
      items: { type: "string", enum: verses.map((v) => v.id) },
      maxItems: 2,
    },
    answer: {
      type: "string",
      description: "A warm, direct response to the user's situation that explains how the chosen verse(s) apply. 80-160 words.",
    },
    lesson: {
      type: "string",
      description: "One concrete, practical action the user can take today. One or two sentences.",
    },
    reflection: {
      type: "string",
      description: "One short reflective question for the user to sit with.",
    },
    crisis: {
      type: "boolean",
      description: "true only if the user expresses thoughts of suicide, self-harm, harming others, or being in danger.",
    },
  },
  required: ["verseIds", "answer", "lesson", "reflection", "crisis"],
  propertyOrdering: ["verseIds", "answer", "lesson", "reflection", "crisis"],
};

const VERSE_CATALOG = verses
  .map((v) => `${v.id} | themes: ${v.themes.join(", ")} | ${v.translation}`)
  .join("\n");

const SYSTEM_INSTRUCTION = `You are "Gita Guide", an AI companion that helps people apply the teachings of the Bhagavad Gita to everyday life. You share what Krishna teaches in the Gita; you are not Krishna and must never claim to be God, a guru, or a human.

How to respond:
- Choose the 1 or 2 verses from the VERSE CATALOG below that best fit the user's situation. Only use ids from the catalog. Never quote or invent Sanskrit; the app displays the verse text itself.
- In "answer", speak warmly and plainly, connect the verse to the user's specific situation, and avoid preaching or moralising.
- Always reply in the user's language and script: English → English; Hindi in Devanagari → Hindi in Devanagari; Hinglish (Hindi written in Latin letters, e.g. "mujhe gussa aata hai") → Hinglish in Latin letters. This applies to answer, lesson and reflection.
- Be humble about interpretation: the Gita has many traditional commentaries and you are offering one practical reading.
- Do not give medical, legal or financial advice. For such questions, share the relevant wisdom and suggest a qualified professional.
- If the message is a greeting or unrelated to life guidance, reply briefly and invite the user to share what is on their mind; verseIds may be empty.
- If the user mentions suicide, self-harm, abuse, or danger, set crisis to true. Respond with compassion, encourage them to reach out right now to someone they trust or a helpline, and keep philosophy secondary.

VERSE CATALOG (id | themes | meaning):
${VERSE_CATALOG}`;

const isLimited = createRateLimiter(20, 10 * 60 * 1000);

export async function POST(request: Request) {
  const ai = getGemini();
  if (!ai) {
    return Response.json(
      { error: "Ask Krishna is not configured yet. Add GEMINI_API_KEY to .env (or .env.local) and restart the server." },
      { status: 503 },
    );
  }

  if (isLimited(clientIp(request))) {
    return Response.json({ error: "Too many questions in a short time. Please pause for a few minutes." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: `Messages must be 1-${MAX_CHARS} characters.` }, { status: 400 });
  }

  const history = parsed.data.messages.slice(-MAX_TURNS);
  if (history[0]?.role !== "user") history.shift();
  if (history.length === 0 || history[history.length - 1].role !== "user") {
    return Response.json({ error: "The last message must come from the user." }, { status: 400 });
  }

  // Small models sometimes drift into Latin script; state the expected script explicitly.
  const lastText = history[history.length - 1].text;
  const scriptHint = /[\u0900-\u097F]/.test(lastText)
    ? "\n\nThe user's latest message is in Devanagari script. Write answer, lesson and reflection in Hindi using Devanagari script."
    : "";

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + scriptHint,
        responseMimeType: "application/json",
        responseJsonSchema,
        maxOutputTokens: 2048,
      },
    });

    const text = response.text;
    if (!text) {
      return Response.json(
        { error: "The guide could not answer that one. Try rephrasing your question." },
        { status: 502 },
      );
    }

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      return Response.json({ error: "The guide's reply was incomplete. Please try again." }, { status: 502 });
    }
    const answer = AnswerSchema.safeParse(json);
    if (!answer.success) {
      return Response.json({ error: "The guide's reply was malformed. Please try again." }, { status: 502 });
    }

    const verseIds = [...new Set(answer.data.verseIds)].filter((id) => verseById.has(id)).slice(0, 2);
    return Response.json({ ...answer.data, verseIds } satisfies AskAnswer);
  } catch (err) {
    if (err instanceof ApiError) {
      console.error(`Gemini API error ${err.status}: ${err.message}`);
      if (err.status === 429) {
        return Response.json({ error: "The AI service is busy right now. Please try again in a minute." }, { status: 503 });
      }
      if (err.status === 400 || err.status === 401 || err.status === 403) {
        return Response.json({ error: "The AI service rejected the request. Check the API key and model name." }, { status: 502 });
      }
      return Response.json({ error: "The AI service had a problem. Please try again." }, { status: 502 });
    }
    console.error("Unexpected error in /api/ask", err);
    return Response.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
