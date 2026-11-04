import type { Metadata } from "next";

import Link from "next/link";

import { Icon } from "@/components/Icon";
import { JumpToVerse } from "@/components/JumpToVerse";
import { PageHeading } from "@/components/PageHeading";
import { ShlokaBrowser } from "@/components/ShlokaBrowser";
import { verses } from "@/data/verses";

export const metadata: Metadata = { title: "Shloka to Real Life" };

export default function ShlokasPage() {
  return (
    <>
      <PageHeading eyebrow="Shloka to real life" title={<>Verses you can <em className="text-saffron">live by.</em></>} watermark="श्लोक">
        {verses.length} key shlokas explained for everyday life, each with a real situation, a simple example and one practical takeaway.
      </PageHeading>
      <div className="page mt-10">
        <ShlokaBrowser />

        <section className="mt-16 overflow-hidden rounded-3xl bg-night p-8 sm:p-10 text-[#fbeee0]">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="ref text-gold">The complete Gita</p>
              <p className="font-display mt-3 text-3xl sm:text-4xl">Looking for a different verse?</p>
              <p className="mt-2 max-w-lg text-[#f3e3d0]/70">
                All 700 verses are here in Sanskrit with transliteration and translation.
              </p>
              <Link href="/chapters" className="mt-5 inline-flex items-center gap-2 font-semibold text-[#f6b77a]">
                Browse by chapter <Icon name="arrowRight" size={16} />
              </Link>
            </div>
            <JumpToVerse tone="dark" />
          </div>
        </section>
      </div>
    </>
  );
}
