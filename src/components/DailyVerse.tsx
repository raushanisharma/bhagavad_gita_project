"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";

import { verseOfTheDay } from "@/data/verses";
import { localDateKey } from "@/lib/progress";
import { verseHref } from "@/lib/slug";

import { CopyVerseButton } from "./CopyVerseButton";
import { Icon } from "./Icon";
import { ListenButton, VoiceToggle } from "./ListenButton";

// The date only exists on the client; on the server we render a placeholder.
const subscribe = () => () => {};
const getDateKey = () => localDateKey();
const getServerDateKey = () => null;

export function DailyVerse() {
  const dateKey = useSyncExternalStore(subscribe, getDateKey, getServerDateKey);

  if (!dateKey) {
    return <div className="card h-[30rem] animate-pulse" aria-busy="true" aria-label="Loading today's shloka" />;
  }

  const date = new Date(`${dateKey}T00:00:00`);
  const verse = verseOfTheDay(date);
  const dateLabel = date.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <article className="card relative overflow-hidden px-6 py-10 sm:px-14 sm:py-14 text-center shadow-2xl shadow-maroon/10 animate-rise">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-saffron-soft/70 to-transparent"
        aria-hidden
      />
      <div className="relative">
        <p className="eyebrow justify-center">
          <span className="diya-glow inline-flex text-saffron">
            <Icon name="diya" size={16} />
          </span>
          Today&apos;s shloka
        </p>
        <p className="mt-2 text-sm text-muted">{dateLabel}</p>

        <p className="sanskrit mt-8 text-[1.3rem] sm:text-[2.1rem] text-maroon">{verse.sanskrit}</p>
        <p className="translit mt-3 text-sm text-muted">{verse.transliteration}</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <ListenButton source={{ kind: "verse", id: verse.id }} />
          <VoiceToggle />
        </div>

        <div className="divider-ornament my-8 mx-auto max-w-xs" aria-hidden>
          <Icon name="lotus" size={18} />
        </div>

        <p className="font-display mx-auto max-w-2xl text-2xl sm:text-[1.9rem] leading-snug">{verse.translation}</p>

        <div className="mx-auto mt-9 max-w-xl rounded-2xl border border-gold/30 bg-gold-soft/40 px-6 py-5 text-left">
          <p className="ref text-saffron-deep">Practice for today</p>
          <p className="mt-2 text-[1.05rem] leading-relaxed text-ink-soft">{verse.realLife.takeaway}</p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href={verseHref(verse.id)} className="btn btn-ink">
            Read the full lesson <Icon name="arrowRight" size={16} />
          </Link>
          <CopyVerseButton verse={verse} className="px-4 py-2.5 text-sm" />
        </div>
        <p className="ref mt-6 text-muted">Bhagavad Gita {verse.id}</p>
      </div>
    </article>
  );
}
