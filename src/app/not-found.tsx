import Link from "next/link";

import { Icon } from "@/components/Icon";
import { Mandala } from "@/components/Mandala";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden">
      <Mandala className="pointer-events-none absolute left-1/2 top-1/2 w-[42rem] -translate-x-1/2 -translate-y-1/2 text-gold/15" />
      <div className="page-narrow relative py-28 text-center">
        <p className="sanskrit text-6xl text-maroon">मोह</p>
        <p className="eyebrow mt-6 justify-center">404 · Page not found</p>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">Even Arjuna lost his way for a moment.</h1>
        <p className="mt-4 text-lg text-muted">This page doesn&apos;t exist, but the path back is right here.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-ink">
            <Icon name="arrowLeft" size={16} /> Go home
          </Link>
          <Link href="/shlokas" className="btn btn-ghost">Browse shlokas</Link>
        </div>
      </div>
    </div>
  );
}
