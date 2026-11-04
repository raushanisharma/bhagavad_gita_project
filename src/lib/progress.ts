"use client";

import { useSyncExternalStore } from "react";

import type { IconName } from "@/components/Icon";

export interface Progress {
  readVerses: string[];
  moodsTried: string[];
  quizBest: number; // best percentage, 0-100
  quizzesTaken: number;
  questionsAsked: number;
  visitDays: string[]; // YYYY-MM-DD in local time
  bestStreak: number;
}

const STORAGE_KEY = "gita-progress-v1";

const EMPTY: Progress = {
  readVerses: [],
  moodsTried: [],
  quizBest: 0,
  quizzesTaken: 0,
  questionsAsked: 0,
  visitDays: [],
  bestStreak: 0,
};

const listeners = new Set<() => void>();
let cache: Progress | null = null;

function load(): Progress {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function save(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); progress stays in memory.
  }
  listeners.forEach((l) => l());
}

function update(fn: (p: Progress) => Progress) {
  save(fn(load()));
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

const addUnique = (list: string[], item: string) =>
  list.includes(item) ? list : [...list, item];

export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const progressActions = {
  markVerseRead: (id: string) =>
    update((p) => ({ ...p, readVerses: addUnique(p.readVerses, id) })),
  markMoodTried: (mood: string) =>
    update((p) => ({ ...p, moodsTried: addUnique(p.moodsTried, mood) })),
  recordQuiz: (percent: number) =>
    update((p) => ({
      ...p,
      quizBest: Math.max(p.quizBest, percent),
      quizzesTaken: p.quizzesTaken + 1,
    })),
  recordQuestion: () =>
    update((p) => ({ ...p, questionsAsked: p.questionsAsked + 1 })),
  recordVisit: () =>
    update((p) => {
      const today = localDateKey();
      if (p.visitDays.includes(today)) return p;
      const visitDays = [...p.visitDays, today].slice(-400);
      return { ...p, visitDays, bestStreak: Math.max(p.bestStreak, currentStreak(visitDays)) };
    }),
  reset: () => save(EMPTY),
};

/** Consecutive-day streak ending today (or yesterday, if not yet visited today). */
export function currentStreak(visitDays: string[]): number {
  // Empty during server prerender (no localStorage), which also keeps `new Date()` client-only.
  if (visitDays.length === 0) return 0;
  const days = new Set(visitDays);
  const cursor = new Date();
  if (!days.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(localDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export interface Badge {
  id: string;
  name: string;
  icon: IconName;
  description: string;
  earned: (p: Progress) => boolean;
}

export const badges: Badge[] = [
  { id: "first-shloka", name: "First Shloka", icon: "diya", description: "Read your first verse", earned: (p) => p.readVerses.length >= 1 },
  { id: "seeker", name: "Seeker", icon: "book", description: "Read 10 verses", earned: (p) => p.readVerses.length >= 10 },
  { id: "scholar", name: "Scholar", icon: "feather", description: "Read 25 verses", earned: (p) => p.readVerses.length >= 25 },
  { id: "mood-explorer", name: "Mood Explorer", icon: "compass", description: "Explore verses for 3 different moods", earned: (p) => p.moodsTried.length >= 3 },
  { id: "curious-mind", name: "Curious Mind", icon: "chat", description: "Ask Krishna your first question", earned: (p) => p.questionsAsked >= 1 },
  { id: "quiz-taker", name: "Quiz Taker", icon: "pen", description: "Complete a quiz", earned: (p) => p.quizzesTaken >= 1 },
  { id: "quiz-champion", name: "Quiz Champion", icon: "trophy", description: "Score 80% or more in a quiz", earned: (p) => p.quizBest >= 80 },
  { id: "streak-3", name: "Steady Mind", icon: "flame", description: "Visit 3 days in a row", earned: (p) => p.bestStreak >= 3 },
  { id: "streak-7", name: "Sthita Prajna", icon: "moon", description: "Visit 7 days in a row", earned: (p) => p.bestStreak >= 7 },
];
