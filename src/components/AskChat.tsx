"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { AskAnswer } from "@/app/api/ask/route";
import type { Verse } from "@/data/types";
import { getVerse } from "@/data/verses";
import { progressActions } from "@/lib/progress";
import { verseHref } from "@/lib/slug";

import { CopyVerseButton } from "./CopyVerseButton";
import { Icon } from "./Icon";
import { ListenButton, VoiceToggle } from "./ListenButton";
import { Mandala } from "./Mandala";

type ChatItem =
  | { role: "user"; text: string }
  | { role: "assistant"; answer: AskAnswer }
  | { role: "error"; text: string; retryText: string };

const SUGGESTIONS = [
  { title: "Exam anxiety", text: "I'm scared about my exam results and can't sleep" },
  { title: "Gussa", text: "Mujhe bahut gussa aata hai, kya karun?" },
  { title: "Career crossroads", text: "I feel stuck in my career and don't know which path to choose" },
  { title: "Loneliness", text: "I feel lonely after moving to a new city" },
];

const MAX_CHARS = 1000;

/** Flatten an assistant answer into plain text for conversation history. */
function answerToText(a: AskAnswer): string {
  const refs = a.verseIds.length ? ` (Verses: ${a.verseIds.join(", ")})` : "";
  return `${a.answer}${refs}\nPractical step: ${a.lesson}`;
}

export function AskChat() {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (items.length) bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [items, loading]);

  // Focus the hero question box on desktop; skip on touch so the keyboard doesn't pop up.
  useEffect(() => {
    if (window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
  }, []);

  function resizeInput() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }

  async function send(text: string, base: ChatItem[] = items) {
    const question = text.trim();
    if (!question || loading) return;

    const nextItems: ChatItem[] = [...base, { role: "user", text: question }];
    setItems(nextItems);
    setInput("");
    requestAnimationFrame(resizeInput);
    setLoading(true);

    const history = nextItems.flatMap((item): { role: "user" | "assistant"; text: string }[] => {
      if (item.role === "user") return [{ role: "user", text: item.text }];
      if (item.role === "assistant") return [{ role: "assistant", text: answerToText(item.answer) }];
      return [];
    });

    const fail = (msg: string) =>
      setItems((prev) => [...prev, { role: "error", text: msg, retryText: question }]);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data) {
        fail(data?.error ?? "Something went wrong. Please try again.");
      } else {
        setItems((prev) => [...prev, { role: "assistant", answer: data as AskAnswer }]);
        progressActions.recordQuestion();
      }
    } catch {
      fail("Could not reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function retry(index: number) {
    const item = items[index];
    if (item.role !== "error") return;
    // Drop the failed user message and the error, then resend.
    send(item.retryText, items.slice(0, index - 1));
  }

  const empty = items.length === 0;

  const composer = (
    <Composer
      hero={empty}
      inputRef={inputRef}
      value={input}
      loading={loading}
      onChange={(v) => {
        setInput(v.slice(0, MAX_CHARS));
        resizeInput();
      }}
      onSubmit={() => send(input)}
    />
  );

  if (empty) {
    return (
      <div>
        {/* Hero: the question box is the centrepiece */}
        <section className="dawn relative overflow-hidden text-[#fbeee0]" style={{ clipPath: "ellipse(160% 100% at 50% 0%)" }}>
          <Mandala className="pointer-events-none absolute left-1/2 top-[55%] w-[140vw] max-w-[1000px] -translate-x-1/2 -translate-y-1/2 text-gold/[0.12] animate-spin-slow" />
          <div className="page-narrow relative pt-14 pb-24 sm:pt-20 sm:pb-32 text-center">
            <p className="eyebrow text-gold justify-center animate-rise">Ask Krishna · AI guide</p>
            <h1
              className="font-display mt-5 text-[2.6rem] leading-[1.05] sm:text-6xl animate-rise"
              style={{ animationDelay: "60ms" }}
            >
              What is on your <em className="text-[#f6b77a]">mind?</em>
            </h1>
            <p
              className="mx-auto mt-4 max-w-lg text-[#f3e3d0]/75 leading-relaxed animate-rise"
              style={{ animationDelay: "120ms" }}
            >
              Share it in English, Hindi or Hinglish. The guide finds a fitting shloka, explains it, and suggests one
              practical step.
            </p>

            <div className="mt-9 animate-rise" style={{ animationDelay: "180ms" }}>
              {composer}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2 animate-rise" style={{ animationDelay: "260ms" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => send(s.text)}
                  title={s.text}
                  className="btn-glass rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  {s.title}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 animate-rise" style={{ animationDelay: "320ms" }}>
              <VoiceToggle dark />
              <p className="text-xs text-[#f3e3d0]/55">
                <Icon name="sparkle" size={13} className="mr-1 inline -mt-0.5" />
                AI-generated guidance inspired by the Gita · avoid sharing private details
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="page mt-16">
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              { icon: "chat" as const, title: "Share what you feel", body: "A worry, a decision, a conflict. In your own words and language." },
              { icon: "book" as const, title: "Receive a shloka", body: "The guide picks a verse from our library and explains how it applies to you." },
              { icon: "leaf" as const, title: "Take one step", body: "Every answer ends with one practical thing to try today, and you can listen to it." },
            ].map((step, i) => (
              <li key={step.title} className="card p-6 animate-rise" style={{ animationDelay: `${380 + i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-11 h-11 rounded-2xl bg-saffron-soft text-saffron-deep">
                    <Icon name={step.icon} size={22} />
                  </span>
                  <span className="font-display text-3xl text-line-strong">0{i + 1}</span>
                </div>
                <p className="font-display mt-5 text-xl">{step.title}</p>
                <p className="mt-1.5 text-sm text-muted leading-relaxed">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    );
  }

  return (
    <div className="page-narrow">
      <div className="flex flex-wrap items-center justify-between gap-3 pt-8">
        <p className="eyebrow">Ask Krishna · AI guide</p>
        <VoiceToggle className="ml-auto" />
        <button
          type="button"
          onClick={() => setItems([])}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink hover:bg-surface transition-colors disabled:opacity-40"
        >
          <Icon name="refresh" size={15} /> New conversation
        </button>
      </div>

      <div className="mt-8 space-y-8" aria-live="polite">
        {items.map((item, i) => {
          if (item.role === "user") {
            return (
              <div key={i} className="flex justify-end animate-rise">
                <p className="max-w-[85%] rounded-3xl rounded-br-md bg-ink px-5 py-3.5 text-[1.02rem] leading-relaxed text-paper whitespace-pre-wrap">
                  {item.text}
                </p>
              </div>
            );
          }
          if (item.role === "error") {
            return (
              <div
                key={i}
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-red-900 animate-rise"
              >
                <span className="inline-flex items-center gap-2">
                  <Icon name="info" size={18} /> {item.text}
                </span>
                <button type="button" onClick={() => retry(i)} disabled={loading} className="text-sm font-semibold underline underline-offset-4">
                  Try again
                </button>
              </div>
            );
          }
          return <AnswerView key={i} answer={item.answer} />;
        })}

        {loading && (
          <div className="flex items-center gap-4 animate-rise">
            <GuideAvatar />
            <div className="flex items-center gap-3 text-muted">
              <span className="flex gap-1.5" aria-hidden>
                <span className="typing-dot" />
                <span className="typing-dot" style={{ animationDelay: "150ms" }} />
                <span className="typing-dot" style={{ animationDelay: "300ms" }} />
              </span>
              Finding the right shloka for you
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Docked composer for follow-up questions */}
      <div className="sticky bottom-0 z-10 mt-10 pb-5 pt-6 bg-gradient-to-t from-paper via-paper to-paper/0">
        {composer}
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-2 text-center text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="sparkle" size={13} /> AI-generated guidance inspired by the Gita
          </span>
          <span aria-hidden>·</span>
          <span>Verse text from our curated library</span>
        </p>
      </div>
    </div>
  );
}

interface ComposerProps {
  hero: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

function Composer({ hero, inputRef, value, loading, onChange, onSubmit }: ComposerProps) {
  const canSend = !loading && value.trim().length > 0;
  return (
    <form
      className={`flex items-end gap-2 border bg-surface text-ink text-left transition-shadow ${
        hero
          ? "rounded-[2rem] border-white/40 p-2.5 pl-5 sm:p-3 sm:pl-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 focus-within:ring-4 focus-within:ring-[#f6b77a]/30"
          : "card rounded-[1.75rem] p-2 pl-5 shadow-xl shadow-maroon/10 focus-within:border-line-strong"
      }`}
      onSubmit={(e) => {
        e.preventDefault();
        if (canSend) onSubmit();
      }}
    >
      <label htmlFor="ask-input" className="sr-only">
        Your question
      </label>
      <textarea
        id="ask-input"
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        rows={hero ? 2 : 1}
        placeholder={hero ? "Apna sawaal likho… or type your question" : "Ask a follow-up…"}
        className={`max-h-44 flex-1 resize-none bg-transparent leading-relaxed outline-none focus-visible:outline-none placeholder:text-muted/70 ${
          hero ? "py-3 text-lg" : "py-3 text-[1.02rem]"
        }`}
      />
      <button
        type="submit"
        disabled={!canSend}
        aria-label="Ask"
        className={`shrink-0 rounded-full bg-saffron text-white transition-colors hover:bg-saffron-deep disabled:bg-line-strong disabled:cursor-not-allowed ${
          hero ? "inline-flex items-center justify-center gap-2 h-12 w-12 sm:w-auto sm:px-5 font-semibold" : "grid place-items-center w-11 h-11"
        }`}
      >
        {hero && <span className="hidden sm:inline">Ask</span>}
        <Icon name={hero ? "arrowRight" : "send"} size={hero ? 18 : 20} strokeWidth={2} />
      </button>
    </form>
  );
}

function GuideAvatar() {
  return (
    <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-night text-gold">
      <Icon name="lotus" size={20} />
    </span>
  );
}

function AnswerView({ answer }: { answer: AskAnswer }) {
  const verseList = answer.verseIds.map(getVerse).filter((v): v is Verse => v !== undefined);

  return (
    <div className="space-y-4 animate-rise">
      {answer.crisis && <CrisisBanner />}

      <div className="flex items-center gap-3">
        <GuideAvatar />
        <span className="font-display text-lg">Gita Guide</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-peacock-soft px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-peacock">
          <Icon name="sparkle" size={12} /> AI
        </span>
      </div>

      <div className="card p-6 sm:p-8">
        <p className="text-[1.08rem] leading-[1.75] text-ink-soft whitespace-pre-wrap">{answer.answer}</p>
        <ListenButton
          source={{ kind: "text", text: [answer.answer, answer.lesson].filter(Boolean).join("\n\n") }}
          label="Listen to this answer"
          className="mt-5"
        />

        {verseList.map((v) => (
          <QuotedVerse key={v.id} verse={v} />
        ))}

        {answer.lesson && (
          <div className="mt-6 rounded-2xl bg-night p-5 sm:p-6 text-[#fbeee0]">
            <p className="ref text-gold">Practical step for today</p>
            <p className="font-display mt-2 text-xl leading-snug">{answer.lesson}</p>
          </div>
        )}

        {answer.reflection && (
          <p className="mt-6 border-l-2 border-gold pl-4 italic text-muted leading-relaxed">
            <span className="not-italic ref text-muted block mb-1">Reflect</span>
            {answer.reflection}
          </p>
        )}
      </div>
    </div>
  );
}

function QuotedVerse({ verse }: { verse: Verse }) {
  return (
    <figure className="mt-6 rounded-2xl border border-line bg-paper/70 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <span className="ref text-saffron-deep">Bhagavad Gita {verse.id}</span>
        <div className="-mr-2 flex items-center">
          <ListenButton source={{ kind: "verse", id: verse.id }} variant="icon" label={`Listen to ${verse.id}`} />
          <CopyVerseButton verse={verse} />
        </div>
      </div>
      <blockquote className="sanskrit mt-3 text-lg sm:text-xl text-maroon">{verse.sanskrit}</blockquote>
      <figcaption className="font-display mt-3 text-lg leading-snug">{verse.translation}</figcaption>
      <Link href={verseHref(verse.id)} className="link-arrow mt-4 text-sm">
        Open the full lesson <Icon name="arrowRight" size={16} />
      </Link>
    </figure>
  );
}

function CrisisBanner() {
  return (
    <div role="alert" className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-950">
      <p className="flex items-center gap-2 font-display text-xl">
        <Icon name="heart" size={20} className="text-red-700" /> You don&apos;t have to go through this alone.
      </p>
      <p className="mt-3 leading-relaxed">
        Please reach out to someone you trust right now. In India, call <strong>Tele-MANAS on 14416</strong> (free, 24×7,
        many languages). If you are in immediate danger, call <strong>112</strong>. Outside India, contact your local
        emergency number or a crisis helpline.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href="tel:14416" className="btn btn-ink py-2.5 text-sm">Call 14416</a>
        <a href="tel:112" className="btn btn-ghost py-2.5 text-sm">Call 112</a>
      </div>
    </div>
  );
}
