/**
 * Builds src/data/gita.json: all 700 verses of the Bhagavad Gita (plus the
 * 13.0 prelude found in some editions).
 *
 * Source: https://github.com/gita/gita (Unlicense).
 *  - Sanskrit text: public domain.
 *  - English: Shri Purohit Swami's translation (1935), lightly modernised in the
 *    source dataset. Public domain in India and most other countries.
 *  - Transliteration: generated here from the Devanagari (IAST).
 *
 * Usage: npx tsx scripts/build-gita.ts [path/to/dataset-dir]
 *   If a directory is given it must contain verse.json and translation.json;
 *   otherwise the files are downloaded from GitHub.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { chapters } from "../src/data/chapters";
import type { FullVerse, Speaker } from "../src/data/gita-types";

const RAW_BASE = "https://raw.githubusercontent.com/gita/gita/main/data";
const TRANSLATOR = "Shri Purohit Swami";

interface RawVerse {
  id: number;
  chapter_number: number;
  verse_number: number;
  text: string;
}
interface RawTranslation {
  verse_id: number;
  authorName: string;
  description: string;
}

/** Translations that are missing or broken in the source dataset. */
const TRANSLATION_OVERRIDES: Record<string, string> = {
  "1.7":
    "But know also, O best of the twice-born, the distinguished warriors on our side, the leaders of my army. I name them for your information.",
  "16.6":
    "There are two kinds of beings in this world: the divine and the demonic. The divine has been described at length. Now hear from me, O Arjuna, about the demonic.",
};

// ---------- Devanagari -> IAST ----------

const CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ṅ",
  च: "c", छ: "ch", ज: "j", झ: "jh", ञ: "ñ",
  ट: "ṭ", ठ: "ṭh", ड: "ḍ", ढ: "ḍh", ण: "ṇ",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "ś", ष: "ṣ", स: "s", ह: "h", ळ: "ḷ",
};
const VOWELS: Record<string, string> = {
  अ: "a", आ: "ā", इ: "i", ई: "ī", उ: "u", ऊ: "ū", ऋ: "ṛ", ॠ: "ṝ", ऌ: "ḷ",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au",
};
const MATRAS: Record<string, string> = {
  "ा": "ā", "ि": "i", "ी": "ī", "ु": "u", "ू": "ū", "ृ": "ṛ", "ॄ": "ṝ",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
};
const VIRAMA = "्";
const OTHER: Record<string, string> = { "ं": "ṁ", "ः": "ḥ", "ँ": "m̐", "ऽ": "'", "।": "", "॥": "" };

export function toIAST(text: string): string {
  let out = "";
  const chars = [...text];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "़") continue; // nukta
    if (CONSONANTS[ch]) {
      out += CONSONANTS[ch];
      const next = chars[i + 1];
      if (next === VIRAMA) i++;
      else if (next && MATRAS[next]) {
        out += MATRAS[next];
        i++;
      } else out += "a";
    } else if (VOWELS[ch]) out += VOWELS[ch];
    else if (MATRAS[ch]) out += MATRAS[ch];
    else if (ch in OTHER) out += OTHER[ch];
    else if (ch === VIRAMA) continue;
    else out += ch;
  }
  return out
    .split("\n")
    .map((l) => l.replace(/\s+/g, " ").trim())
    .join("\n");
}

// ---------- Sanskrit cleaning ----------

const SPEAKER_PATTERNS: [RegExp, Speaker, string][] = [
  [/श्री\s*भगवानुवाच/, "Krishna", "श्रीभगवानुवाच"],
  [/धृतराष्ट्र\s*उवाच/, "Dhritarashtra", "धृतराष्ट्र उवाच"],
  [/(?:सञ्जय|संजय)\s*उवाच/, "Sanjaya", "सञ्जय उवाच"],
  [/अर्जुन\s*उवाच/, "Arjuna", "अर्जुन उवाच"],
];

function cleanSanskrit(raw: string): { text: string; speakerLine?: string; speaker?: Speaker } {
  let text = raw;
  let speaker: Speaker | undefined;
  let speakerLine: string | undefined;

  for (const [re, who, canonical] of SPEAKER_PATTERNS) {
    if (re.test(text)) {
      speaker = who;
      speakerLine = canonical;
      text = text.replace(re, "\n");
    }
  }

  text = text
    // Verse number markers such as "।।2.47।।"
    .replace(/[।|]{1,2}\s*[\d०-९]+\s*\.\s*[\d०-९]+\s*[।|]{0,2}/g, "॥")
    // Legacy-font ordering bug: vowel sign typed before the consonant ("श्िच" -> "श्चि")
    .replace(/्ि([क-हळ])/g, "्$1ि")
    .replace(/।।/g, "॥")
    .replace(/[ \t]+/g, " ");

  let lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // Some source verses have no line breaks: split after each danda.
  if (lines.length === 1) {
    lines = lines[0]
      .split(/(?<=।)/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  // Ensure the verse ends with a double danda and has no stray one elsewhere.
  const last = lines.length - 1;
  lines[last] = lines[last].replace(/[।॥\s]+$/, "") + "॥";
  for (let i = 0; i < last; i++) lines[i] = lines[i].replace(/॥/g, "।");

  return { text: lines.join("\n"), speaker, speakerLine };
}

function cleanTranslation(raw: string): string {
  return raw
    .replace(/^\s*(revised|corrected|updated)\s*:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- Build ----------

async function load<T>(dir: string | undefined, file: string): Promise<T> {
  if (dir) return JSON.parse(readFileSync(path.join(dir, file), "utf8")) as T;
  const res = await fetch(`${RAW_BASE}/${file}`);
  if (!res.ok) throw new Error(`Failed to download ${file}: ${res.status}`);
  return (await res.json()) as T;
}

async function main() {
  const dir = process.argv[2];
  const rawVerses = await load<RawVerse[]>(dir, "verse.json");
  const rawTranslations = await load<RawTranslation[]>(dir, "translation.json");

  const translations = new Map(
    rawTranslations.filter((t) => t.authorName === TRANSLATOR).map((t) => [t.verse_id, t.description]),
  );

  rawVerses.sort((a, b) => a.chapter_number - b.chapter_number || a.verse_number - b.verse_number);

  let currentSpeaker: Speaker = "Dhritarashtra";
  const out: FullVerse[] = [];

  for (const rv of rawVerses) {
    const chapter = rv.chapter_number;
    // The source numbers Arjuna's opening question in chapter 13 as 13.1.
    // Standard 700-verse editions omit it, so it becomes the 13.0 prelude.
    const verse = chapter === 13 ? rv.verse_number - 1 : rv.verse_number;
    const id = `${chapter}.${verse}`;

    const { text, speaker, speakerLine } = cleanSanskrit(rv.text);
    if (speaker) currentSpeaker = speaker;

    const override = TRANSLATION_OVERRIDES[id];
    const sourceTranslation = cleanTranslation(translations.get(rv.id) ?? "");
    if (!override && (!sourceTranslation || /no changes needed/i.test(sourceTranslation))) {
      throw new Error(`Missing or broken translation for ${id}: "${sourceTranslation}"`);
    }

    out.push({
      id,
      chapter,
      verse,
      speaker: currentSpeaker,
      ...(speakerLine ? { speakerLine } : {}),
      sanskrit: text,
      transliteration: toIAST(text),
      translation: override ?? sourceTranslation,
      translationSource: override ? "app" : "purohit",
    });
  }

  // ---------- Validation ----------
  const errors: string[] = [];
  for (const c of chapters) {
    const count = out.filter((v) => v.chapter === c.number && v.verse > 0).length;
    if (count !== c.verseCount) errors.push(`Chapter ${c.number}: ${count} verses, expected ${c.verseCount}`);
  }
  const total = out.filter((v) => v.verse > 0).length;
  if (total !== 700) errors.push(`Total ${total}, expected 700`);
  for (const v of out) {
    if (/[\d०-९]/.test(v.sanskrit)) errors.push(`${v.id}: digits left in Sanskrit`);
    if (/्[ा-ौ]/.test(v.sanskrit)) errors.push(`${v.id}: vowel sign after virama`);
    if (/[a-zA-Z]/.test(v.sanskrit)) errors.push(`${v.id}: Latin characters in Sanskrit`);
    if (/[ऀ-ॿ]/.test(v.transliteration)) errors.push(`${v.id}: Devanagari left in transliteration`);
  }
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exit(1);
  }

  const target = path.join(process.cwd(), "src/data/gita.json");
  writeFileSync(target, JSON.stringify(out));
  console.log(`Wrote ${out.length} verses (${total} + prelude) to ${path.relative(process.cwd(), target)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
