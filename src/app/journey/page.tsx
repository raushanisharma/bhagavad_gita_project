import type { Metadata } from "next";

import { Journey } from "@/components/Journey";
import { PageHeading } from "@/components/PageHeading";

export const metadata: Metadata = { title: "My Journey" };

export default function JourneyPage() {
  return (
    <>
      <PageHeading eyebrow="My journey" title={<>Your path, <em className="text-saffron">step by step.</em></>} watermark="यात्रा">
        Streaks, progress and badges. Everything is stored privately in this browser. No account needed.
      </PageHeading>
      <div className="page mt-12">
        <Journey />
      </div>
    </>
  );
}
