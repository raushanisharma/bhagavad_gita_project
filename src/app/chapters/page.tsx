import type { Metadata } from "next";
import Link from "next/link";

import { Icon } from "@/components/Icon";
import { JumpToVerse } from "@/components/JumpToVerse";
import { PageHeading } from "@/components/PageHeading";
import { chapters } from "@/data/chapters";
import { versesForChapter } from "@/data/verses";

export const metadata: Metadata = { title: "Chapters" };

export default function ChaptersPage() {
  return (
    <>
      <PageHeading eyebrow="18 chapters · 700 verses" title={<>The Gita, <em className="text-saffron">chapter by chapter.</em></>} watermark="अध्याय">
        All 700 verses in Sanskrit with transliteration and translation, plus a friendly summary of every chapter.
      </PageHeading>

      <div className="page mt-12">
        <div className="card mb-10 flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
          <div>
            <p className="ref text-saffron-deep">Know the verse?</p>
            <p className="font-display mt-2 text-2xl">Jump straight to it.</p>
          </div>
          <JumpToVerse />
        </div>
        <ol className="grid gap-4 md:grid-cols-2">
          {chapters.map((c, i) => {
            const featured = versesForChapter(c.number).length;
            return (
              <li key={c.number} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}>
                <Link href={`/chapters/${c.number}`} className="group card card-hover flex h-full gap-5 p-6 sm:p-7">
                  <span className="font-display w-14 shrink-0 text-5xl leading-none text-line-strong transition-colors group-hover:text-saffron">
                    {String(c.number).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="sanskrit text-lg leading-snug text-maroon">{c.sanskritName}</p>
                    <h2 className="font-display mt-1 text-xl leading-snug">{c.meaning}</h2>
                    <p className="mt-2 text-sm text-muted line-clamp-2">{c.summary}</p>
                    <div className="mt-4 flex items-center gap-3 text-xs text-muted">
                      <span>{c.verseCount} verses</span>
                      {featured > 0 && (
                        <span className="rounded-full bg-saffron-soft px-2.5 py-0.5 font-medium text-maroon">
                          {featured} explained
                        </span>
                      )}
                      <Icon name="arrowRight" size={16} className="ml-auto transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
