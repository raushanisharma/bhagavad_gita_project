"use client";

import { useEffect } from "react";

import { progressActions } from "@/lib/progress";

export function VisitTracker() {
  useEffect(() => {
    progressActions.recordVisit();
  }, []);
  return null;
}
