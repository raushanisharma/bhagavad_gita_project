import Link from "next/link";

import { DailyVerse } from "@/components/DailyVerse";
import { Icon, type IconName } from "@/components/Icon";
import { JourneyStrip } from "@/components/JourneyStrip";
import { Mandala } from "@/components/Mandala";
import { chapters } from "@/data/chapters";
import { moods } from "@/data/moods";
import { verses } from "@/data/verses";

const PILLARS: { href: string; icon: IconName; title: string; body: string; cta: string }[] = [
  {
    href: "/mood",
    icon: "compass",
    title: "Gita for your mood",
    body: "Angry, confused, anxious or on fire? Choose a feeling and receive the shlokas that speak to it.",
    cta: "Choose a mood",
  },
  {
    href: "/ask",
    icon: "chat",
    title: "Ask Krishna",
    body: "Describe what you are going through. An AI guide finds the right verse and one practical step for today.",
    cta: "Ask a question",
  },
  {
    href: "/shlokas",
    icon: "leaf",
    title: "Shloka to real life",
    body: "Every verse comes with a real situation, a simple example and a takeaway you can practise today.",
    cta: "Browse shlokas",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="dawn relative -mt-16 overflow-hidden text-[#fbeee0]"
        style={{ clipPath: "ellipse(150% 100% at 50% 0%)" }}
      >
        <Mandala className="pointer-events-none absolute left-1/2 top-[58%] w-[150vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 text-gold/[0.13] animate-spin-slow" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#2a1610]/0 to-transparent" aria-hidden />

        <div className="page relative pt-36 pb-44 sm:pt-44 sm:pb-56 text-center">
          <p className="eyebrow text-gold animate-rise">Bhagavad Gita · for everyday life</p>
          <h1
            className="font-display mx-auto mt-6 max-w-4xl text-[2.9rem] leading-[1.02] sm:text-7xl lg:text-[5.5rem] animate-rise"
            style={{ animationDelay: "80ms" }}
          >
            What is your heart <em className="text-[#f6b77a]">carrying</em> today?
          </h1>
          <p
            className="mx-auto mt-6 max-w-xl text-lg sm:text-xl text-[#f3e3d0]/75 leading-relaxed animate-rise"
            style={{ animationDelay: "160ms" }}
          >
            Long ago, on a battlefield, a confused warrior asked for guidance. The answers still work today.
          </p>

          <div
            className="mx-auto mt-10 flex max-w-3xl flex-wrap justify-center gap-2 animate-rise"
            style={{ animationDelay: "240ms" }}
          >
            {moods.map((m) => (
              <Link
                key={m.id}
                href={`/mood/${m.id}`}
                className="btn-glass rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                {m.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 animate-rise" style={{ animationDelay: "320ms" }}>
            <Link href="/ask" className="btn btn-primary">
              <Icon name="chat" size={18} /> Ask Krishna
            </Link>
            <Link href="/shlokas" className="btn btn-glass">
              Explore shlokas
            </Link>
          </div>
        </div>
      </section>

      {/* Daily shloka floats over the hero edge */}
      <section className="page-narrow relative -mt-28 sm:-mt-36 z-10">
        <DailyVerse />
      </section>

      {/* Journey */}
      <section className="page-narrow mt-6">
        <JourneyStrip />
      </section>

      {/* Pillars */}
      <section className="page mt-28">
        <div className="max-w-3xl">
          <p className="eyebrow">Three ways in</p>
          <h2 className="font-display mt-4 text-4xl sm:text-5xl leading-tight">
            Wisdom that meets you <em className="text-saffron">where you are.</em>
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Link key={p.href} href={p.href} className="group card card-hover p-8 flex flex-col">
              <div className="flex items-start justify-between">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-saffron-soft text-saffron-deep">
                  <Icon name={p.icon} size={24} />
                </span>
                <span className="font-display text-5xl text-line-strong leading-none">0{i + 1}</span>
              </div>
              <h3 className="font-display mt-8 text-2xl">{p.title}</h3>
              <p className="mt-3 text-muted leading-relaxed flex-1">{p.body}</p>
              <span className="link-arrow mt-8 text-sm">
                {p.cta} <Icon name="arrowRight" size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Moods in Sanskrit */}
      <section className="page mt-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="eyebrow">Every feeling has a name</p>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl leading-tight">The Gita has a verse for it.</h2>
          </div>
          <Link href="/mood" className="link-arrow">
            All moods <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px overflow-hidden rounded-3xl border border-line bg-line">
          {moods.map((m) => (
            <Link
              key={m.id}
              href={`/mood/${m.id}`}
              className="group bg-surface px-5 py-7 text-center transition-colors hover:bg-saffron-soft/60"
            >
              <span className="sanskrit block text-3xl text-maroon transition-transform duration-300 group-hover:-translate-y-0.5">
                {m.sanskrit}
              </span>
              <span className="mt-2 block text-sm font-medium text-ink">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Chapters + quiz */}
      <section className="page mt-28 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Link href="/chapters" className="group card card-hover relative overflow-hidden p-8 sm:p-10">
          <p className="eyebrow">18 chapters · 700 verses</p>
          <h3 className="font-display mt-4 text-3xl sm:text-4xl max-w-md">
            The whole Gita, one chapter at a time.
          </h3>
          <p className="mt-3 max-w-md text-muted">Every verse in Sanskrit, with transliteration and translation.</p>
          <div className="mt-8 flex flex-wrap gap-2" aria-hidden>
            {chapters.map((c) => (
              <span
                key={c.number}
                className="grid place-items-center w-10 h-10 rounded-full border border-line font-display text-sm text-muted transition-colors group-hover:border-line-strong"
              >
                {c.number}
              </span>
            ))}
          </div>
          <span className="link-arrow mt-8 text-sm">
            Read chapter summaries <Icon name="arrowRight" size={16} />
          </span>
        </Link>

        <Link href="/quiz" className="group relative overflow-hidden rounded-3xl bg-night p-8 sm:p-10 text-[#fbeee0] card-hover">
          <Mandala className="pointer-events-none absolute -right-24 -bottom-24 w-80 text-gold/15" />
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-white/10 text-gold">
            <Icon name="trophy" size={24} />
          </span>
          <h3 className="font-display relative mt-8 text-3xl sm:text-4xl">Test your wisdom</h3>
          <p className="relative mt-3 text-[#f3e3d0]/70 leading-relaxed">
            Quick five-question rounds. Earn badges as you learn.
          </p>
          <span className="relative mt-8 inline-flex items-center gap-2 font-semibold text-[#f6b77a]">
            Start a quiz <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      {/* Closing quote */}
      <section className="page-narrow mt-28 text-center">
        <Icon name="lotus" size={28} className="mx-auto text-gold" />
        <p className="sanskrit mt-6 text-3xl sm:text-4xl text-maroon">योगः कर्मसु कौशलम्</p>
        <p className="font-display mt-4 text-2xl sm:text-3xl italic text-ink-soft">&ldquo;Yoga is skill in action.&rdquo;</p>
        <p className="ref mt-4 text-muted">Bhagavad Gita 2.50 · {verses.length} verses explained so far</p>
      </section>
    </>
  );
}
