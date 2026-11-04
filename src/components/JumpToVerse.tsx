"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { chapters } from "@/data/chapters";
import { verseHref } from "@/lib/slug";

import { Icon } from "./Icon";

/** Small form to open any verse by chapter and number, e.g. 2 · 47. */
export function JumpToVerse({ tone = "light" }: { tone?: "light" | "dark" }) {
  const router = useRouter();
  const [chapter, setChapter] = useState(2);
  const [verse, setVerse] = useState("47");
  const max = chapters.find((c) => c.number === chapter)?.verseCount ?? 1;
  const n = Number(verse);
  const valid = Number.isInteger(n) && n >= 1 && n <= max;

  const field =
    tone === "dark"
      ? "bg-white/10 border-white/20 text-white"
      : "bg-surface border-line-strong text-ink";

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) router.push(verseHref(`${chapter}.${n}`));
      }}
    >
      <label className="flex flex-col gap-1 text-xs font-medium text-muted">
        Chapter
        <select
          value={chapter}
          onChange={(e) => {
            setChapter(Number(e.target.value));
            setVerse("1");
          }}
          className={`h-11 rounded-full border px-4 text-sm outline-none focus:border-saffron [&>option]:text-ink ${field}`}
        >
          {chapters.map((c) => (
            <option key={c.number} value={c.number}>
              {c.number}. {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted">
        Verse (1–{max})
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={max}
          value={verse}
          onChange={(e) => setVerse(e.target.value)}
          className={`h-11 w-24 rounded-full border px-4 text-sm outline-none focus:border-saffron ${field}`}
        />
      </label>
      <button type="submit" disabled={!valid} className="btn btn-ink h-11 py-0">
        Open <Icon name="arrowRight" size={16} />
      </button>
    </form>
  );
}
