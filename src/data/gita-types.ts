export type Speaker = "Krishna" | "Arjuna" | "Sanjaya" | "Dhritarashtra";

/** A verse from the complete Gita text (src/data/gita.json). */
export interface FullVerse {
  /** "chapter.verse"; "13.0" is the prelude found in some editions. */
  id: string;
  chapter: number;
  verse: number;
  speaker: Speaker;
  /** e.g. "श्रीभगवानुवाच" when a new speaker begins with this verse. */
  speakerLine?: string;
  sanskrit: string;
  transliteration: string;
  translation: string;
  /** "purohit": adapted from Shri Purohit Swami (1935). "app": written for this app. */
  translationSource: "purohit" | "app";
}
