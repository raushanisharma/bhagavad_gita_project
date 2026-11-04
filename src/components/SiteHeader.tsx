"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "./Icon";

const NAV = [
  { href: "/mood", label: "Mood" },
  { href: "/ask", label: "Ask Krishna" },
  { href: "/shlokas", label: "Shlokas" },
  { href: "/chapters", label: "Chapters" },
  { href: "/quiz", label: "Quiz" },
  { href: "/journey", label: "Journey" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // On the home page the header floats over the dark hero until the user scrolls.
  const overDark = pathname === "/" && !scrolled && !open;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300 ${
        overDark
          ? "bg-transparent border-b border-transparent"
          : "bg-paper/80 backdrop-blur-xl border-b border-line/80"
      }`}
    >
      <div className="page h-16 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span
            className={`grid place-items-center w-9 h-9 rounded-full border transition-colors ${
              overDark ? "border-gold/50 text-gold" : "border-line-strong text-saffron"
            }`}
          >
            <Icon name="lotus" size={20} />
          </span>
          <span className={`font-display text-[1.35rem] leading-none ${overDark ? "text-[#fbeee0]" : "text-ink"}`}>
            Gita <span className="italic text-saffron">for</span> Life
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {NAV.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3.5 py-2 text-sm font-medium transition-colors ${
                  overDark
                    ? "text-[#f3e3d0]/75 hover:text-white"
                    : active
                      ? "text-ink"
                      : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-3.5 right-3.5 -bottom-0.5 h-px bg-saffron origin-left transition-transform duration-300 ${
                    active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          className={`md:hidden grid place-items-center w-10 h-10 rounded-full border ${
            overDark ? "border-white/20 text-white" : "border-line-strong text-ink"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name={open ? "close" : "menu"} size={20} />
        </button>
      </div>

      {open && (
        <nav
          className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-paper px-5 pt-6 pb-10 flex flex-col animate-rise"
          aria-label="Mobile"
        >
          {NAV.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-rise flex items-center justify-between border-b border-line py-4"
            >
              <span className={`font-display text-3xl ${isActive(item.href) ? "text-saffron" : "text-ink"}`}>
                {item.label}
              </span>
              <Icon name="arrowRight" size={20} className="text-muted" />
            </Link>
          ))}
          <p className="mt-auto sanskrit text-center text-maroon/70 text-lg">योगः कर्मसु कौशलम्</p>
        </nav>
      )}
    </header>
  );
}
