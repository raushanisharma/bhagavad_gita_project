import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { PageHeading } from "@/components/PageHeading";
import { moods } from "@/data/moods";
import { versesForMood } from "@/data/verses";

export const metadata: Metadata = { title: "Gita for Your Mood" };

export default function MoodPage() {
  return (
    <>
      <PageHeading eyebrow="Gita for your mood" title={<>How do you feel <em className="text-saffron">today?</em></>} watermark="भाव">
        Choose the feeling closest to yours. Each one opens shlokas that speak directly to it, explained simply.
      </PageHeading>

      <div className="page mt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {moods.map((m, i) => (
            <Link
              key={m.id}
              href={`/mood/${m.id}`}
              className="group card card-hover relative overflow-hidden p-6 sm:p-7 animate-rise"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <span className="sanskrit block text-4xl sm:text-5xl leading-tight text-maroon transition-colors group-hover:text-saffron-deep">
                {m.sanskrit}
              </span>
              <span className="mt-1 block text-xs italic text-muted">{m.transliteration}</span>
              <div className="mt-8 flex items-end justify-between gap-2">
                <div>
                  <span className="font-display block text-xl sm:text-2xl leading-tight">{m.label}</span>
                  <span className="text-xs text-muted">{versesForMood(m.id).length} shlokas</span>
                </div>
                <span className="grid place-items-center w-9 h-9 shrink-0 rounded-full border border-line text-muted transition-all group-hover:bg-ink group-hover:border-ink group-hover:text-paper">
                  <Icon name="arrowRight" size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/ask" className="group mt-12 card card-hover flex flex-col sm:flex-row sm:items-center gap-5 p-7 sm:p-8">
          <span className="grid place-items-center w-14 h-14 shrink-0 rounded-2xl bg-peacock-soft text-peacock">
            <Icon name="chat" size={26} />
          </span>
          <div className="flex-1">
            <p className="font-display text-2xl">Feeling something more specific?</p>
            <p className="mt-1 text-muted">Describe your situation in your own words, in English, Hindi or Hinglish.</p>
          </div>
          <span className="link-arrow">
            Ask Krishna <Icon name="arrowRight" size={16} />
          </span>
        </Link>
      </div>
    </>
  );
}
