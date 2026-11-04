"use client";

import Link from "next/link";
import { useState } from "react";

import { type QuizQuestion, quizQuestions } from "@/data/quiz";
import { progressActions } from "@/lib/progress";
import { verseHref } from "@/lib/slug";

import { Icon } from "./Icon";
import { Mandala } from "./Mandala";

const ROUND_SIZE = 5;
const LETTERS = ["A", "B", "C", "D", "E"];

function pickRound(): QuizQuestion[] {
  const shuffled = [...quizQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROUND_SIZE);
}

export function Quiz() {
  const [round, setRound] = useState<QuizQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  function start() {
    setRound(pickRound());
    setIndex(0);
    setSelected(null);
    setResults([]);
    setDone(false);
  }

  if (!round) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-night p-10 sm:p-14 text-center text-[#fbeee0]">
        <Mandala className="pointer-events-none absolute left-1/2 top-1/2 w-[40rem] -translate-x-1/2 -translate-y-1/2 text-gold/10 animate-spin-slow" />
        <div className="relative">
          <span className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-white/10 text-gold">
            <Icon name="trophy" size={30} />
          </span>
          <p className="font-display mt-6 text-3xl sm:text-4xl">Ready for a round?</p>
          <p className="mt-3 text-[#f3e3d0]/70">
            {ROUND_SIZE} random questions from a bank of {quizQuestions.length}. Each answer comes with an explanation.
          </p>
          <button type="button" onClick={start} className="btn btn-primary mt-8">
            Start the quiz <Icon name="arrowRight" size={16} />
          </button>
        </div>
      </div>
    );
  }

  const score = results.filter(Boolean).length;

  if (done) {
    const percent = Math.round((score / round.length) * 100);
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    return (
      <div className="card p-10 sm:p-14 text-center animate-rise">
        <div className="relative mx-auto w-40 h-40">
          <svg viewBox="0 0 128 128" className="w-full h-full -rotate-90" aria-hidden>
            <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--color-line)" strokeWidth="8" />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="var(--color-saffron)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - percent / 100)}
              style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.2,0.7,0.2,1)" }}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div>
              <div className="font-display text-4xl">
                {score}/{round.length}
              </div>
              <div className="text-xs text-muted">{percent}%</div>
            </div>
          </div>
        </div>
        <p className="font-display mt-8 text-3xl">
          {percent >= 80 ? "Excellent work." : percent >= 50 ? "Good effort." : "A beautiful beginning."}
        </p>
        <p className="mt-2 text-muted">
          {percent >= 80
            ? "You've earned the Quiz Champion badge."
            : percent >= 50
              ? "A little more reading and you'll ace it."
              : "Every expert was once a beginner. Keep exploring."}
        </p>
        <div className="mt-6 flex justify-center gap-1.5" aria-label="Answers">
          {results.map((r, i) => (
            <span key={i} className={`w-8 h-1.5 rounded-full ${r ? "bg-saffron" : "bg-line-strong"}`} />
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={start} className="btn btn-primary">
            <Icon name="refresh" size={16} /> Play again
          </button>
          <Link href="/journey" className="btn btn-ghost">See my badges</Link>
        </div>
      </div>
    );
  }

  const q = round[index];
  const answered = selected !== null;

  function choose(i: number) {
    if (answered) return;
    setSelected(i);
    setResults((r) => [...r, i === q.answerIndex]);
  }

  function nextQuestion() {
    if (index + 1 >= round!.length) {
      const finalScore = results.filter(Boolean).length;
      progressActions.recordQuiz(Math.round((finalScore / round!.length) * 100));
      setDone(true);
    } else {
      setIndex(index + 1);
      setSelected(null);
    }
  }

  return (
    <div className="card p-6 sm:p-10" key={q.id}>
      <div className="flex items-center justify-between">
        <span className="ref text-muted">
          Question {index + 1} of {round.length}
        </span>
        <span className="ref text-saffron-deep">Score {score}</span>
      </div>
      <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden>
        {round.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-colors ${
              i < results.length ? (results[i] ? "bg-saffron" : "bg-maroon/40") : i === index ? "bg-ink/30" : "bg-line"
            }`}
          />
        ))}
      </div>

      <h2 className="font-display mt-8 text-2xl sm:text-3xl leading-snug animate-rise">{q.question}</h2>

      <div className="mt-8 grid gap-3">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answerIndex;
          const isChosen = i === selected;
          let tone = "border-line bg-surface hover:border-ink";
          let badge = "border-line-strong text-muted";
          if (answered && isCorrect) {
            tone = "border-emerald-600/60 bg-emerald-50";
            badge = "border-emerald-600 bg-emerald-600 text-white";
          } else if (answered && isChosen) {
            tone = "border-red-400/70 bg-red-50";
            badge = "border-red-500 bg-red-500 text-white";
          } else if (answered) {
            tone = "border-line bg-surface opacity-50";
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all animate-rise ${tone}`}
              style={{ animationDelay: `${80 + i * 50}ms` }}
            >
              <span className={`grid place-items-center w-8 h-8 shrink-0 rounded-full border text-sm font-semibold ${badge}`}>
                {answered && isCorrect ? <Icon name="check" size={16} strokeWidth={2.4} /> : answered && isChosen ? <Icon name="close" size={14} strokeWidth={2.4} /> : LETTERS[i]}
              </span>
              <span className="text-[1.02rem]">{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 rounded-2xl bg-gold-soft/50 border border-gold/25 p-5 animate-rise" aria-live="polite">
          <p className="font-display text-xl">{selected === q.answerIndex ? "Correct." : "Not quite."}</p>
          <p className="mt-1 text-ink-soft leading-relaxed">{q.explanation}</p>
          {q.verseId && (
            <Link href={verseHref(q.verseId)} target="_blank" className="link-arrow mt-3 text-sm">
              Read verse {q.verseId} <Icon name="arrowRight" size={16} />
            </Link>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={nextQuestion} disabled={!answered} className="btn btn-ink">
          {index + 1 >= round.length ? "See result" : "Next question"} <Icon name="arrowRight" size={16} />
        </button>
      </div>
    </div>
  );
}
