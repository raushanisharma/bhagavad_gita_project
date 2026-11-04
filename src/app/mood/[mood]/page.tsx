import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Icon } from "@/components/Icon";
import { MarkMoodTried } from "@/components/ProgressMarkers";
import { ListPageSkeleton } from "@/components/Skeletons";
import { VerseCard } from "@/components/VerseCard";
import { getMood, moods } from "@/data/moods";
import { versesForMood } from "@/data/verses";

export function generateStaticParams() {
  return moods.map((m) => ({ mood: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/mood/[mood]">): Promise<Metadata> {
  const { mood } = await params;
  const m = getMood(mood);
  return { title: m ? `Gita for when you feel ${m.label.toLowerCase()}` : "Mood" };
}

// The page shell renders instantly; the URL-dependent content streams in
// behind Suspense (all params are still prerendered via generateStaticParams).
export default function MoodVersesPage({ params }: PageProps<"/mood/[mood]">) {
  return (
    <Suspense fallback={<ListPageSkeleton label="Loading shlokas" />}>
      <MoodContent params={params} />
    </Suspense>
  );
}

async function MoodContent({ params }: Pick<PageProps<"/mood/[mood]">, "params">) {
  const { mood } = await params;
  const m = getMood(mood);
  if (!m) notFound();
  const list = versesForMood(m.id);
  const others = moods.filter((o) => o.id !== m.id);

  return (
    <>
      <MarkMoodTried mood={m.id} />

      <header className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/60 to-transparent" aria-hidden />
        <div className="page relative py-14 sm:py-20">
          <Link href="/mood" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <Icon name="arrowLeft" size={16} /> All moods
          </Link>
          <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-end sm:gap-10 animate-rise">
            <div>
              <span className="sanskrit block text-7xl sm:text-8xl leading-none text-maroon">{m.sanskrit}</span>
              <span className="mt-3 block text-sm italic text-muted">{m.transliteration}</span>
            </div>
            <div className="sm:pb-6">
              <p className="eyebrow">When you feel {m.label.toLowerCase()}</p>
              <p className="font-display mt-3 text-2xl sm:text-3xl leading-snug max-w-xl">{m.message}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="page-narrow mt-12 space-y-6">
        <p className="ref text-muted">{list.length} shlokas for this feeling</p>
        {list.map((v, i) => (
          <VerseCard key={v.id} verse={v} showExplanation index={i} />
        ))}
      </div>

      <section className="page-narrow mt-16">
        <div className="rounded-3xl bg-night p-8 sm:p-10 text-[#fbeee0] text-center">
          <p className="font-display text-3xl">Want guidance for your exact situation?</p>
          <p className="mt-2 text-[#f3e3d0]/70">Tell the AI guide what is happening and get a verse chosen for you.</p>
          <Link href="/ask" className="btn btn-primary mt-6">
            <Icon name="chat" size={18} /> Ask Krishna
          </Link>
        </div>

        <p className="ref mt-14 text-center text-muted">Or explore another feeling</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {others.map((o) => (
            <Link key={o.id} href={`/mood/${o.id}`} className="chip">
              {o.label}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
