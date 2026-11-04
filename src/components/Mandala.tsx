/** Decorative line-art mandala. Purely ornamental. */
export function Mandala({ className = "" }: { className?: string }) {
  const petals = Array.from({ length: 24 }, (_, i) => i * 15);
  const inner = Array.from({ length: 12 }, (_, i) => i * 30);
  const dots = Array.from({ length: 48 }, (_, i) => i * 7.5);

  return (
    <svg viewBox="0 0 400 400" fill="none" stroke="currentColor" aria-hidden className={className}>
      <circle cx="200" cy="200" r="196" strokeWidth="0.6" />
      <circle cx="200" cy="200" r="186" strokeWidth="0.4" strokeDasharray="2 6" />
      {dots.map((a) => (
        <circle key={`d${a}`} cx="200" cy="22" r="1.4" transform={`rotate(${a} 200 200)`} fill="currentColor" stroke="none" />
      ))}
      {petals.map((a) => (
        <path
          key={`p${a}`}
          d="M200 40 C 222 80, 222 120, 200 150 C 178 120, 178 80, 200 40 Z"
          strokeWidth="0.7"
          transform={`rotate(${a} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="52" strokeWidth="0.7" />
      {inner.map((a) => (
        <path
          key={`i${a}`}
          d="M200 150 C 214 165, 214 180, 200 192 C 186 180, 186 165, 200 150 Z"
          strokeWidth="0.7"
          transform={`rotate(${a} 200 200)`}
        />
      ))}
      <circle cx="200" cy="200" r="6" strokeWidth="0.8" />
    </svg>
  );
}
