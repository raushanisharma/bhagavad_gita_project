import Link from "next/link";

import { Icon } from "./Icon";

const LINKS = [
  { href: "/mood", label: "Gita for your mood" },
  { href: "/ask", label: "Ask Krishna" },
  { href: "/shlokas", label: "Shloka to real life" },
  { href: "/chapters", label: "Chapters" },
  { href: "/quiz", label: "Quiz" },
  { href: "/journey", label: "My journey" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-night text-[#e9dccb]">
      <div className="page py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="sanskrit text-2xl sm:text-3xl text-gold leading-relaxed">
              {"यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।\nतत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥"}
            </p>
            <p className="mt-4 max-w-md text-sm text-[#e9dccb]/70 leading-relaxed">
              Where there is wisdom and where there is action, there is victory, prosperity and righteousness.
              <span className="block mt-1 ref text-[#e9dccb]/45">Bhagavad Gita 18.78</span>
            </p>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-3 content-start text-sm">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[#e9dccb]/75 hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-14 pt-8 border-t border-white/10 grid gap-3 text-xs text-[#e9dccb]/50 leading-relaxed sm:grid-cols-[auto_1fr] sm:gap-6">
          <div className="flex items-center gap-2 text-[#e9dccb]/80">
            <Icon name="lotus" size={18} className="text-gold" />
            <span className="font-display text-base">Gita for Life</span>
          </div>
          <div className="space-y-2">
            <p>
              Translations and explanations are simplified paraphrases written for everyday readers. For deeper study,
              read the Gita alongside a traditional commentary.
            </p>
            <p>
              Sanskrit text of all 700 verses: public domain, via the open{" "}
              <a href="https://github.com/gita/gita" className="underline underline-offset-2 hover:text-white" target="_blank" rel="noreferrer">
                gita/gita
              </a>{" "}
              dataset. Full-text translation adapted from Shri Purohit Swami (1935), public domain.
            </p>
            <p>
              Answers in Ask Krishna are AI-generated guidance, not the words of Krishna or of any teacher, and are not a
              substitute for professional medical, legal or mental-health advice.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
