"use client";

import Link from "next/link";

import { moods } from "@/data/moods";
import { verses } from "@/data/verses";
import { badges, currentStreak, progressActions, useProgress } from "@/lib/progress";

import { Icon } from "./Icon";
import { Mandala } from "./Mandala";

export function Journey() {
  const progress = useProgress();
  const streak = currentStreak(progress.visitDays);
  const readPercent = Math.round((progress.readVerses.length / verses.length) * 100);
  const earnedCount = badges.filter((b) => b.earned(progress)).length;

  return (
    <div className="space-y-14">
      <div className="grid gap-4 lg:grid-cols-[1.1fr_2fr]">
        {/* Streak */}
        <div className="relative overflow-hidden rounded-3xl bg-night p-8 text-[#fbeee0]">
          <Mandala className="pointer-events-none absolute -right-20 -top-20 w-72 text-gold/15" />
          <span className="relative grid place-items-center w-12 h-12 rounded-2xl bg-white/10 text-[#f6b77a]">
            <Icon name="flame" size={26} />
          </span>
          <p className="relative font-display mt-8 text-7xl leading-none">{streak}</p>
          <p className="relative mt-2 text-[#f3e3d0]/75">{streak === 1 ? "day streak" : "days in a row"}</p>
          <p className="relative mt-6 ref text-gold">Best · {progress.bestStreak} days</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Stat label="Shlokas read" value={progress.readVerses.length} sub={`of ${verses.length}`} />
          <Stat label="Moods explored" value={progress.moodsTried.length} sub={`of ${moods.length}`} />
          <Stat label="Best quiz" value={`${progress.quizBest}%`} sub={`${progress.quizzesTaken} rounds played`} />

          <div className="card p-6 sm:col-span-3">
            <div className="flex items-baseline justify-between">
              <p className="ref text-muted">Library progress</p>
              <p className="font-display text-2xl">{readPercent}%</p>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-line">
              <div
                className="h-full rounded-full bg-gradient-to-r from-saffron to-gold transition-[width] duration-700"
                style={{ width: `${readPercent}%` }}
              />
            </div>
            {progress.readVerses.length < verses.length && (
              <Link href="/shlokas" className="link-arrow mt-5 text-sm">
                Continue reading <Icon name="arrowRight" size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Badges</p>
            <h2 className="font-display mt-3 text-3xl sm:text-4xl">
              {earnedCount} of {badges.length} earned
            </h2>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {badges.map((b) => {
            const earned = b.earned(progress);
            return (
              <div key={b.id} className={`card p-6 text-center ${earned ? "" : "bg-transparent shadow-none"}`}>
                <span
                  className={`mx-auto grid place-items-center w-16 h-16 rounded-full ${
                    earned
                      ? "bg-gradient-to-br from-[#f6d89a] via-gold to-[#8f6519] text-night shadow-lg shadow-gold/30"
                      : "border border-dashed border-line-strong text-line-strong"
                  }`}
                >
                  <Icon name={earned ? b.icon : "lock"} size={26} />
                </span>
                <p className={`font-display mt-4 text-lg ${earned ? "" : "text-muted"}`}>{b.name}</p>
                <p className="mt-1 text-xs text-muted leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Reset all progress, streaks and badges on this device?")) progressActions.reset();
          }}
          className="text-sm text-muted underline underline-offset-4 hover:text-red-700"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
  return (
    <div className="card p-6">
      <p className="ref text-muted">{label}</p>
      <p className="font-display mt-3 text-4xl leading-none">{value}</p>
      <p className="mt-2 text-xs text-muted">{sub}</p>
    </div>
  );
}
