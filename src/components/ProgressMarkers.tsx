"use client";

import { useEffect } from "react";

import { progressActions } from "@/lib/progress";

export function MarkMoodTried({ mood }: { mood: string }) {
  useEffect(() => {
    progressActions.markMoodTried(mood);
  }, [mood]);
  return null;
}

export function MarkVerseRead({ id }: { id: string }) {
  useEffect(() => {
    progressActions.markVerseRead(id);
  }, [id]);
  return null;
}
