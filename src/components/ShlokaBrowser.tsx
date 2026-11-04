"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { verses } from "@/data/verses";
import { useProgress } from "@/lib/progress";
import { verseHref } from "@/lib/slug";

import { Icon } from "./Icon";

const ALL_THEMES = [...new Set(verses.flatMap((v) => v.themes))].sort();
const TOP_THEMES = ALL_THEMES.filter((t) => verses.filter((v) => v.themes.includes(t)).length >= 2);

export function ShlokaBrowser() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<string | null>(null);
  const progress = useProgress();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return verses.filter((v) => {
      if (theme && !v.themes.includes(theme)) return false;
      if (!q) return true;
      return [v.id, v.translation, v.explanation, v.transliteration, v.realLife.situation, ...v.themes]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, theme]);

  return (
    <div>
      <div className="sticky top-16 z-20 -mx-5 px-5 sm:mx-0 sm:px-0 py-3 bg-paper/85 backdrop-blur-xl">
        <label className="relative block">
          <span className="sr-only">Search shlokas</span>
          <Icon name="search" size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a feeling or situation: exam stress, anger, 2.47…"
            className="w-full rounded-full border border-line bg-surface py-4 pl-13 pr-5 text-base shadow-sm outline-none transition-colors placeholder:text-muted/70 focus:border-saffron"
          />
        </label>
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by theme">
          <button type="button" className="chip shrink-0" aria-pressed={theme === null} onClick={() => setTheme(null)}>
            All
          </button>
          {TOP_THEMES.map((t) => (
            <button
              key={t}
              type="button"
              className="chip shrink-0 capitalize"
              aria-pressed={theme === t}
              onClick={() => setTheme(theme === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="ref mt-6 text-muted" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "shloka" : "shlokas"}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((v) => {
          const read = progress.readVerses.includes(v.id);
          return (
            <Link key={v.id} href={verseHref(v.id)} className="group card card-hover flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="ref text-saffron-deep">BG {v.id}</span>
                {read && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-peacock">
                    <Icon name="check" size={14} /> Read
                  </span>
                )}
              </div>
              <p className="font-display mt-4 text-xl leading-snug">{v.realLife.situation}</p>
              <p className="sanskrit mt-4 text-[0.95rem] text-maroon/70 line-clamp-1">{v.sanskrit.split("\n")[0]}</p>
              <p className="mt-2 text-sm text-muted line-clamp-2 flex-1">{v.translation}</p>
              <span className="link-arrow mt-5 text-sm">
                Open lesson <Icon name="arrowRight" size={16} />
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="card mt-4 p-10 text-center">
          <p className="font-display text-2xl">No shlokas match that yet.</p>
          <p className="mt-2 text-muted">Try a different word, or describe your situation to the AI guide.</p>
          <Link href="/ask" className="btn btn-primary mt-6">
            Ask Krishna
          </Link>
        </div>
      )}
    </div>
  );
}
