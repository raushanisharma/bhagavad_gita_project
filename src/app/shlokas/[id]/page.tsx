import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CopyVerseButton } from "@/components/CopyVerseButton";
import { Icon, type IconName } from "@/components/Icon";
import { ListenButton, VoiceToggle } from "@/components/ListenButton";
import { MarkVerseRead } from "@/components/ProgressMarkers";
import { VerseSkeleton } from "@/components/Skeletons";
import { getChapter } from "@/data/chapters";
import { allVerses, getFullVerse, neighbours, TRANSLATION_CREDIT } from "@/data/gita";
import type { FullVerse } from "@/data/gita-types";
import { getMood } from "@/data/moods";
import { getVerse } from "@/data/verses";
import { slugToVerseId, verseHref, verseSlug } from "@/lib/slug";

export function generateStaticParams() {
  return allVerses.map((v) => ({ id: verseSlug(v.id) }));
}

export async function generateMetadata({ params }: PageProps<"/shlokas/[id]">): Promise<Metadata> {
  const { id } = await params;
  const v = getFullVerse(slugToVerseId(id));
  if (!v) return { title: "Shloka not found" };
  const simple = getVerse(v.id)?.translation ?? v.translation;
  return { title: `Bhagavad Gita ${v.id}`, description: simple };
}

const SPEAKER_NAMES: Record<FullVerse["speaker"], string> = {
  Krishna: "Krishna",
  Arjuna: "Arjuna",
  Sanjaya: "Sanjaya",
  Dhritarashtra: "Dhritarashtra",
};

// The page shell renders instantly; the URL-dependent content streams in
// behind Suspense (all params are still prerendered via generateStaticParams).
export default function ShlokaPage({ params }: PageProps<"/shlokas/[id]">) {
  return (
    <Suspense fallback={<VerseSkeleton />}>
      <ShlokaContent params={params} />
    </Suspense>
  );
}

async function ShlokaContent({ params }: Pick<PageProps<"/shlokas/[id]">, "params">) {
  const { id } = await params;
  const full = getFullVerse(slugToVerseId(id));
  if (!full) notFound();

  const explained = getVerse(full.id); // curated: meaning + real-life, if available
  const { prev, next } = neighbours(full.id);
  const chapter = getChapter(full.chapter);
  const isPrelude = full.verse === 0;

  // Copy uses the simplified translation when we have one.
  const copyable = { id: full.id, sanskrit: full.sanskrit, translation: explained?.translation ?? full.translation };

  const steps: { icon: IconName; label: string; text: string; highlight?: boolean }[] = explained
    ? [
        { icon: "compass", label: "When this helps", text: explained.realLife.situation },
        { icon: "leaf", label: "A simple example", text: explained.realLife.example },
        { icon: "sparkle", label: "Your practice today", text: explained.realLife.takeaway, highlight: true },
      ]
    : [];

  return (
    <>
      {explained && <MarkVerseRead id={full.id} />}

      {/* Verse hero */}
      <header className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/60 via-paper/0 to-transparent" aria-hidden />
        <div className="page-narrow relative py-12 sm:py-16 text-center">
          <div className="flex items-center justify-between gap-3 text-sm">
            <Link href={`/chapters/${full.chapter}#v-${full.verse}`} className="inline-flex items-center gap-2 text-muted hover:text-ink">
              <Icon name="arrowLeft" size={16} /> Chapter {full.chapter}
            </Link>
            <CopyVerseButton verse={copyable} />
          </div>

          <div className="animate-rise">
            <p className="eyebrow mt-10 justify-center">
              {isPrelude ? "Chapter 13 · Prelude" : `Bhagavad Gita ${full.id}`}
            </p>
            {chapter && (
              <Link href={`/chapters/${chapter.number}`} className="mt-2 block text-sm text-muted hover:text-ink">
                {chapter.meaning}
                {!isPrelude && ` · verse ${full.verse} of ${chapter.verseCount}`}
              </Link>
            )}

            {full.speakerLine && <p className="sanskrit mt-10 text-base text-saffron-deep">{full.speakerLine}</p>}
            <p className={`sanskrit text-[1.45rem] sm:text-[2.4rem] text-maroon ${full.speakerLine ? "mt-3" : "mt-10"}`}>
              {full.sanskrit}
            </p>
            <p className="translit mt-4 text-sm sm:text-base text-muted">{full.transliteration}</p>

            <div className="divider-ornament my-10 mx-auto max-w-sm" aria-hidden>
              <Icon name="lotus" size={20} />
            </div>

            <p className="font-display text-2xl sm:text-4xl leading-snug text-ink">
              {explained ? explained.translation : full.translation}
            </p>
            <p className="ref mt-5 text-muted">{SPEAKER_NAMES[full.speaker]} speaks</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ListenButton source={{ kind: "verse", id: full.id }} label="Listen to this shloka" />
              <VoiceToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="page-narrow">
        {isPrelude && (
          <p className="mt-10 rounded-2xl border border-line bg-surface p-5 text-sm text-muted leading-relaxed">
            Some editions open chapter 13 with this question from Arjuna. Most editions, including the standard
            700-verse count, leave it unnumbered, so we show it as a prelude.
          </p>
        )}

        {explained && (
          <section className="mt-14">
            <p className="eyebrow">What it means</p>
            <p className="mt-4 text-xl leading-relaxed text-ink-soft">{explained.explanation}</p>
          </section>
        )}

        {/* Classic translation (shown separately when the hero uses our simplified one) */}
        {explained && (
          <section className="mt-10 card p-6 sm:p-7">
            <p className="ref text-muted">Classic translation</p>
            <p className="font-display mt-3 text-xl leading-snug text-ink-soft">{full.translation}</p>
            <p className="mt-3 text-xs text-muted">{TRANSLATION_CREDIT}</p>
          </section>
        )}

        {explained ? (
          <section className="mt-16">
            <p className="eyebrow">Shloka to real life</p>
            <h2 className="font-display mt-4 text-3xl sm:text-4xl">Bring it into your day.</h2>
            <ol className="relative mt-10 space-y-5 before:absolute before:left-[1.4rem] before:top-4 before:bottom-4 before:w-px before:bg-line-strong">
              {steps.map((s, i) => (
                <li key={s.label} className="relative grid grid-cols-[2.8rem_1fr] gap-4">
                  <span
                    className={`relative z-10 grid place-items-center w-11 h-11 rounded-full border ${
                      s.highlight ? "bg-saffron border-saffron text-white" : "bg-surface border-line-strong text-saffron-deep"
                    }`}
                  >
                    <Icon name={s.icon} size={20} />
                  </span>
                  <div className={`rounded-2xl p-6 ${s.highlight ? "bg-night text-[#fbeee0]" : "card"}`}>
                    <p className={`ref ${s.highlight ? "text-gold" : "text-muted"}`}>
                      0{i + 1} · {s.label}
                    </p>
                    <p className={`mt-2 leading-relaxed ${s.highlight ? "font-display text-2xl" : "text-lg"}`}>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : (
          <section className="mt-12">
            <p className="text-xs text-muted text-center">{full.translationSource === "purohit" ? TRANSLATION_CREDIT : "Translation written for Gita for Life."}</p>
            <Link href="/ask" className="group mt-8 card card-hover flex flex-col sm:flex-row sm:items-center gap-5 p-7">
              <span className="grid place-items-center w-14 h-14 shrink-0 rounded-2xl bg-peacock-soft text-peacock">
                <Icon name="chat" size={26} />
              </span>
              <div className="flex-1">
                <p className="font-display text-2xl">How does this apply to your life?</p>
                <p className="mt-1 text-muted">Describe your situation and the AI guide will find the most relevant teaching.</p>
              </div>
              <span className="link-arrow">
                Ask Krishna <Icon name="arrowRight" size={16} />
              </span>
            </Link>
          </section>
        )}

        {explained && (
          <section className="mt-14 flex flex-wrap items-center gap-2">
            <span className="ref text-muted mr-2">Helpful when feeling</span>
            {explained.moods.map((m) => {
              const mood = getMood(m);
              return mood ? (
                <Link key={m} href={`/mood/${m}`} className="chip">
                  <span className="sanskrit text-maroon text-sm leading-none">{mood.sanskrit}</span> {mood.label}
                </Link>
              ) : null;
            })}
          </section>
        )}

        {/* Prev / next through the whole Gita */}
        <nav className="mt-16 grid gap-4 sm:grid-cols-2" aria-label="Verse navigation">
          {prev ? (
            <Link href={verseHref(prev.id)} className="group card card-hover p-6">
              <span className="ref inline-flex items-center gap-2 text-muted">
                <Icon name="arrowLeft" size={14} /> {prev.verse === 0 ? "Prelude" : prev.id}
              </span>
              <p className="mt-2 line-clamp-2 text-ink-soft">{getVerse(prev.id)?.translation ?? prev.translation}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={verseHref(next.id)} className="group card card-hover p-6 sm:text-right">
              <span className="ref inline-flex items-center gap-2 text-muted">
                {next.verse === 0 ? "Prelude" : next.id} <Icon name="arrowRight" size={14} />
              </span>
              <p className="mt-2 line-clamp-2 text-ink-soft">{getVerse(next.id)?.translation ?? next.translation}</p>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
