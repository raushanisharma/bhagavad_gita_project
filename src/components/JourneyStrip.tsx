"use client";

import Link from "next/link";

import { verses } from "@/data/verses";
import { badges, currentStreak, useProgress } from "@/lib/progress";

import { Icon, type IconName } from "./Icon";

export function JourneyStrip() {
  const progress = useProgress();
  const streak = currentStreak(progress.visitDays);
  const earned = badges.filter((b) => b.earned(progress)).length;

  return (
    <Link
      href="/journey"
      className="group card card-hover grid grid-cols-3 divide-x divide-line py-5"
      aria-label="Open my journey"
    >
      <Stat icon="flame" value={streak} label="day streak" />
      <Stat icon="book" value={`${progress.readVerses.length}/${verses.length}`} label="shlokas read" />
      <Stat icon="trophy" value={`${earned}/${badges.length}`} label="badges earned" />
    </Link>
  );
}

function Stat({ icon, value, label }: { icon: IconName; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-2 sm:flex-row sm:justify-center sm:gap-3">
      <Icon name={icon} size={20} className="text-saffron" />
      <div className="text-center sm:text-left">
        <div className="font-display text-2xl leading-none">{value}</div>
        <div className="mt-1 text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}
