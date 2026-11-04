interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  /** Large faint Devanagari word shown behind the heading. */
  watermark?: string;
  children?: React.ReactNode;
}

export function PageHeading({ eyebrow, title, watermark, children }: Props) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/50 via-paper/0 to-transparent" aria-hidden />
      {watermark && (
        <span
          aria-hidden
          className="sanskrit pointer-events-none absolute -right-4 sm:right-6 top-1/2 -translate-y-1/2 select-none text-[9rem] sm:text-[13rem] leading-none text-maroon/[0.06]"
        >
          {watermark}
        </span>
      )}
      <div className="page relative py-14 sm:py-20 animate-rise">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-display mt-4 text-4xl sm:text-6xl leading-[1.05] text-ink max-w-3xl">{title}</h1>
        {children && <div className="mt-5 text-lg sm:text-xl text-muted max-w-2xl leading-relaxed">{children}</div>}
      </div>
    </header>
  );
}
