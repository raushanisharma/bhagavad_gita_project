import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { Icon } from "@/components/Icon";
import { ListPageSkeleton } from "@/components/Skeletons";
import { chapters, getChapter } from "@/data/chapters";
import { chapterVerses, TRANSLATION_CREDIT } from "@/data/gita";
import { getVerse, versesForChapter } from "@/data/verses";
import { verseHref } from "@/lib/slug";

export function generateStaticParams() {
  return chapters.map((c) => ({ number: String(c.number) }));
}

export async function generateMetadata({ params }: PageProps<"/chapters/[number]">): Promise<Metadata> {
  const { number } = await params;
  const c = getChapter(Number(number));
  return { title: c ? `Chapter ${c.number}: ${c.name}` : "Chapter not found" };
}

// The page shell renders instantly; the URL-dependent content streams in
// behind Suspense (all params are still prerendered via generateStaticParams).
export default function ChapterPage({ params }: PageProps<"/chapters/[number]">) {
  return (
    <Suspense fallback={<ListPageSkeleton label="Loading chapter" />}>
      <ChapterContent params={params} />
    </Suspense>
  );
}

async function ChapterContent({ params }: Pick<PageProps<"/chapters/[number]">, "params">) {
  const { number } = await params;
  const chapter = getChapter(Number(number));
  if (!chapter) notFound();

  const featured = versesForChapter(chapter.number);
  const all = chapterVerses(chapter.number);
  const prev = getChapter(chapter.number - 1);
  const next = getChapter(chapter.number + 1);

  return (
    <>
      <header className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/60 to-transparent" aria-hidden />
        <span
          aria-hidden
          className="font-display pointer-events-none absolute -right-6 -bottom-16 select-none text-[16rem] sm:text-[22rem] leading-none text-maroon/[0.05]"
        >
          {chapter.number}
        </span>
        <div className="page relative py-14 sm:py-20">
          <Link href="/chapters" className="inline-flex items-center gap-2 text-sm text-muted hover:text-ink">
            <Icon name="arrowLeft" size={16} /> All chapters
          </Link>
          <div className="mt-10 animate-rise">
            <p className="eyebrow">
              Chapter {chapter.number} · {chapter.verseCount} verses
            </p>
            <p className="sanskrit mt-5 text-3xl sm:text-4xl text-maroon">{chapter.sanskritName}</p>
            <h1 className="font-display mt-2 text-4xl sm:text-6xl leading-[1.05]">{chapter.meaning}</h1>
            <p className="mt-2 text-muted italic">{chapter.name}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#verses" className="btn btn-ink">
                Read all {chapter.verseCount} verses <Icon name="arrowRight" size={16} />
              </a>
              {featured.length > 0 && (
                <a href="#key" className="btn btn-ghost">
                  {featured.length} explained for real life
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="page-narrow">
        <section className="mt-14">
          <p className="eyebrow">In short</p>
          <p className="font-display mt-4 text-2xl sm:text-[1.75rem] leading-snug text-ink-soft">{chapter.summary}</p>
        </section>

        {featured.length > 0 && (
          <section id="key" className="mt-16 scroll-mt-24">
            <p className="eyebrow">Explained for real life</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {featured.map((v) => (
                <Link key={v.id} href={verseHref(v.id)} className="group card card-hover flex flex-col p-5">
                  <span className="ref text-saffron-deep">BG {v.id}</span>
                  <span className="font-display mt-2 text-lg leading-snug flex-1">{v.realLife.situation}</span>
                  <span className="link-arrow mt-3 text-xs">
                    Open lesson <Icon name="arrowRight" size={14} />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section id="verses" className="mt-20 scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="eyebrow">The complete chapter</p>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl">All {chapter.verseCount} verses</h2>
            </div>
            <p className="text-xs text-muted max-w-xs sm:text-right">{TRANSLATION_CREDIT}</p>
          </div>

          <ol className="mt-8 divide-y divide-line border-y border-line">
            {all.map((v) => {
              const isExplained = Boolean(getVerse(v.id));
              return (
                <li key={v.id} id={`v-${v.verse}`} className="scroll-mt-24">
                  <Link
                    href={verseHref(v.id)}
                    className="group grid grid-cols-[3rem_1fr] gap-4 py-7 transition-colors hover:bg-surface/70 sm:grid-cols-[4rem_1fr] sm:px-3 sm:-mx-3 rounded-xl"
                  >
                    <span className="font-display pt-1 text-2xl leading-none text-line-strong transition-colors group-hover:text-saffron">
                      {v.verse === 0 ? "—" : v.verse}
                    </span>
                    <div className="min-w-0">
                      {v.verse === 0 && <p className="ref mb-2 text-muted">Prelude · found in some editions</p>}
                      {v.speakerLine && <p className="sanskrit text-sm text-saffron-deep">{v.speakerLine}</p>}
                      <p className="sanskrit text-lg sm:text-xl text-maroon">{v.sanskrit}</p>
                      <p className="mt-3 text-[1.02rem] leading-relaxed text-ink-soft">{v.translation}</p>
                      <div className="mt-3 flex items-center gap-3">
                        {isExplained && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-0.5 text-xs font-medium text-maroon">
                            <Icon name="sparkle" size={12} /> Real-life lesson
                          </span>
                        )}
                        <span className="link-arrow text-xs opacity-0 transition-opacity group-hover:opacity-100">
                          Open <Icon name="arrowRight" size={14} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <nav className="mt-16 grid gap-4 sm:grid-cols-2" aria-label="Chapter navigation">
          {prev ? (
            <Link href={`/chapters/${prev.number}`} className="card card-hover p-6">
              <span className="ref inline-flex items-center gap-2 text-muted">
                <Icon name="arrowLeft" size={14} /> Chapter {prev.number}
              </span>
              <p className="font-display mt-2 text-lg">{prev.meaning}</p>
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link href={`/chapters/${next.number}`} className="card card-hover p-6 sm:text-right">
              <span className="ref inline-flex items-center gap-2 text-muted">
                Chapter {next.number} <Icon name="arrowRight" size={14} />
              </span>
              <p className="font-display mt-2 text-lg">{next.meaning}</p>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
