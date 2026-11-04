export type MoodId =
  | "angry"
  | "confused"
  | "sad"
  | "stressed"
  | "anxious"
  | "lonely"
  | "lazy"
  | "motivated"
  | "proud"
  | "hopeful"
  | "guilty"
  | "jealous";

export interface RealLife {
  /** A short, relatable situation where this verse applies. */
  situation: string;
  /** A concrete everyday example. */
  example: string;
  /** One actionable takeaway the reader can apply today. */
  takeaway: string;
}

export interface Verse {
  /** Canonical id in the form "chapter.verse", e.g. "2.47". */
  id: string;
  chapter: number;
  verse: number;
  speaker: "Krishna" | "Arjuna" | "Sanjaya";
  sanskrit: string;
  transliteration: string;
  translation: string;
  explanation: string;
  themes: string[];
  moods: MoodId[];
  realLife: RealLife;
}

export interface Chapter {
  number: number;
  sanskritName: string;
  name: string;
  meaning: string;
  verseCount: number;
  summary: string;
}

export interface Mood {
  id: MoodId;
  label: string;
  /** Sanskrit word for the feeling, in Devanagari. */
  sanskrit: string;
  /** IAST transliteration of the Sanskrit word. */
  transliteration: string;
  message: string;
}
