import type { Mood, MoodId } from "./types";

export const moods: Mood[] = [
  { id: "angry", label: "Angry", sanskrit: "क्रोध", transliteration: "krodha", message: "Anger is energy. The Gita shows how to cool it before it clouds your judgement." },
  { id: "confused", label: "Confused", sanskrit: "मोह", transliteration: "moha", message: "Arjuna was confused too. That is exactly where the Gita begins." },
  { id: "sad", label: "Sad", sanskrit: "शोक", transliteration: "śoka", message: "It is okay to feel low. These verses offer a gentle, wider view." },
  { id: "stressed", label: "Stressed", sanskrit: "चिन्ता", transliteration: "cintā", message: "Do your part, let go of the rest. Here is how Krishna puts it." },
  { id: "anxious", label: "Anxious", sanskrit: "भय", transliteration: "bhaya", message: "Worry pulls you into the future. These verses bring you back to now." },
  { id: "lonely", label: "Lonely", sanskrit: "एकाकी", transliteration: "ekākī", message: "You are not as alone as it feels. The Gita says the Divine lives in every heart." },
  { id: "lazy", label: "Lazy", sanskrit: "आलस्य", transliteration: "ālasya", message: "A little nudge from Krishna to get up and act." },
  { id: "motivated", label: "Motivated", sanskrit: "उत्साह", transliteration: "utsāha", message: "Channel that fire wisely: full effort, without attachment." },
  { id: "proud", label: "Proud", sanskrit: "अभिमान", transliteration: "abhimāna", message: "Celebrate, and stay grounded. The Gita on success and humility." },
  { id: "hopeful", label: "Hopeful", sanskrit: "आशा", transliteration: "āśā", message: "Hope is well placed. No sincere effort is ever wasted." },
  { id: "guilty", label: "Guilty", sanskrit: "पश्चात्ताप", transliteration: "paścāttāpa", message: "Your past does not define you. The Gita offers a fresh start." },
  { id: "jealous", label: "Jealous", sanskrit: "ईर्ष्या", transliteration: "īrṣyā", message: "Comparison steals peace. Walk your own path." },
];

export function getMood(id: string): Mood | undefined {
  return moods.find((m) => m.id === (id as MoodId));
}
