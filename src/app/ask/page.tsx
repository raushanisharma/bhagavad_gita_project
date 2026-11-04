import type { Metadata } from "next";

import { AskChat } from "@/components/AskChat";

export const metadata: Metadata = { title: "Ask Krishna · AI Guide" };

export default function AskPage() {
  return <AskChat />;
}
