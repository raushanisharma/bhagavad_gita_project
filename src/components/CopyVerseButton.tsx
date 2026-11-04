"use client";

import { useState } from "react";

import type { Verse } from "@/data/types";

import { Icon } from "./Icon";

type Copyable = Pick<Verse, "id" | "sanskrit" | "translation">;

export function CopyVerseButton({ verse, className = "" }: { verse: Copyable; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = `${verse.sanskrit}\n\n${verse.translation}\n\nBhagavad Gita ${verse.id}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked (e.g. insecure context); fail silently.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-muted hover:text-ink hover:bg-paper transition-colors ${className}`}
      aria-label={copied ? "Copied" : `Copy verse ${verse.id}`}
    >
      <Icon name={copied ? "check" : "copy"} size={14} />
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
