import type { Metadata } from "next";

import { PageHeading } from "@/components/PageHeading";
import { Quiz } from "@/components/Quiz";

export const metadata: Metadata = { title: "Gita Quiz" };

export default function QuizPage() {
  return (
    <>
      <PageHeading eyebrow="Quiz" title={<>How well do you know <em className="text-saffron">the Gita?</em></>} watermark="प्रश्न">
        Five questions a round. Score 80% or more to earn the Quiz Champion badge.
      </PageHeading>
      <div className="page-narrow mt-12">
        <Quiz />
      </div>
    </>
  );
}
