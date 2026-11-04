/** Placeholders shown while URL-dependent page content streams in. */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-line/80 animate-pulse ${className}`} />;
}

export function VerseSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading shloka">
      <header className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/60 to-transparent" aria-hidden />
        <div className="page-narrow relative flex flex-col items-center py-12 sm:py-16">
          <Bar className="h-3 w-24 self-start" />
          <Bar className="mt-12 h-3 w-40" />
          <Bar className="mt-3 h-3 w-56" />
          <Bar className="mt-12 h-7 w-4/5" />
          <Bar className="mt-4 h-7 w-3/4" />
          <Bar className="mt-6 h-3 w-2/3" />
          <Bar className="mt-12 h-6 w-5/6" />
          <Bar className="mt-3 h-6 w-2/3" />
        </div>
      </header>
    </div>
  );
}

export function ListPageSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <header className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0 bg-gradient-to-b from-saffron-soft/60 to-transparent" aria-hidden />
        <div className="page relative py-14 sm:py-20">
          <Bar className="h-3 w-24" />
          <Bar className="mt-10 h-3 w-40" />
          <Bar className="mt-6 h-10 w-2/3 sm:w-1/2" />
          <Bar className="mt-4 h-4 w-1/3" />
        </div>
      </header>
      <div className="page-narrow mt-12 space-y-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-40 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
