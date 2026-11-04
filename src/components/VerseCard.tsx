import Link from "next/link";

import type { Verse } from "@/data/types";
import { verseHref } from "@/lib/slug";

import { CopyVerseButton } from "./CopyVerseButton";
import { Icon } from "./Icon";
import { ListenButton } from "./ListenButton";

interface Props {
  verse: Verse;
  showExplanation?: boolean;
  showLink?: boolean;
  compact?: boolean;
  /** Zero-based position, used to stagger entrance animations. */
  index?: number;
}

export function VerseCard({ verse, showExplanation, showLink = true, compact, index = 0 }: Props) {
  return (
    <article
      className={`card relative overflow-hidden animate-rise ${compact ? "p-6" : "p-7 sm:p-10"}`}
      style={{ animationDelay: `${Math.min(index, 6) * 70}ms` }}
    >
      <div className="absolute left-0 top-8 bottom-8 w-[3px] rounded-r-full bg-gradient-to-b from-saffron via-gold to-transparent" aria-hidden />

      <div className="flex items-center justify-between gap-3">
        <p className="ref text-saffron-deep">
          Bhagavad Gita {verse.id}
          <span className="text-muted font-medium tracking-[0.12em]"> · {verse.speaker}</span>
        </p>
        <div className="-mr-2 flex items-center">
          <ListenButton source={{ kind: "verse", id: verse.id }} variant="icon" label={`Listen to ${verse.id}`} />
          <CopyVerseButton verse={verse} />
        </div>
      </div>

      <p className={`sanskrit mt-5 text-maroon ${compact ? "text-[1.35rem]" : "text-2xl sm:text-[1.9rem]"}`}>
        {verse.sanskrit}
      </p>
      {!compact && <p className="translit mt-3 text-[0.95rem] text-muted leading-relaxed">{verse.transliteration}</p>}

      <div className="divider-ornament my-6" aria-hidden>
        <Icon name="lotus" size={16} />
      </div>

      <p className={`font-display text-ink leading-snug ${compact ? "text-xl" : "text-2xl sm:text-[1.7rem]"}`}>
        {verse.translation}
      </p>

      {showExplanation && <p className="mt-5 text-[1.05rem] text-ink-soft leading-relaxed">{verse.explanation}</p>}

      {showLink && (
        <Link href={verseHref(verse.id)} className="link-arrow mt-6 text-sm">
          Apply it to real life <Icon name="arrowRight" size={16} />
        </Link>
      )}
    </article>
  );
}
