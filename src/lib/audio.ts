"use client";

import { useSyncExternalStore } from "react";

export type VoiceGender = "female" | "male";

// ---------- Voice preference (persisted) ----------

const VOICE_KEY = "gita-voice-v1";
const voiceListeners = new Set<() => void>();
let voiceCache: VoiceGender | null = null;

function readVoice(): VoiceGender {
  if (voiceCache) return voiceCache;
  try {
    voiceCache = window.localStorage.getItem(VOICE_KEY) === "male" ? "male" : "female";
  } catch {
    voiceCache = "female";
  }
  return voiceCache;
}

export function setVoice(v: VoiceGender) {
  voiceCache = v;
  try {
    window.localStorage.setItem(VOICE_KEY, v);
  } catch {
    // ignore unavailable storage
  }
  stopAudio();
  voiceListeners.forEach((l) => l());
}

export function useVoice(): VoiceGender {
  return useSyncExternalStore(
    (l) => {
      voiceListeners.add(l);
      return () => voiceListeners.delete(l);
    },
    readVoice,
    () => "female",
  );
}

// ---------- Single shared player ----------

export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";

interface PlayerState {
  key: string | null;
  status: PlayerStatus;
  progress: number; // 0..1
  error?: string;
}

let state: PlayerState = { key: null, status: "idle", progress: 0 };
const playerListeners = new Set<() => void>();
let audio: HTMLAudioElement | null = null;
let requestId = 0;

// Blob URLs for audio already fetched in this session (small LRU).
const blobUrls = new Map<string, string>();
const MAX_BLOBS = 24;

function setState(next: Partial<PlayerState>) {
  state = { ...state, ...next };
  playerListeners.forEach((l) => l());
}

export function usePlayer(): PlayerState {
  return useSyncExternalStore(
    (l) => {
      playerListeners.add(l);
      return () => playerListeners.delete(l);
    },
    () => state,
    () => state,
  );
}

export function stopAudio() {
  requestId++;
  if (audio) {
    audio.pause();
    audio = null;
  }
  setState({ key: null, status: "idle", progress: 0, error: undefined });
}

function getAudio(): HTMLAudioElement {
  const el = new Audio();
  el.preload = "auto";
  el.addEventListener("timeupdate", () => {
    if (el === audio && el.duration) setState({ progress: el.currentTime / el.duration });
  });
  el.addEventListener("ended", () => {
    if (el === audio) setState({ status: "idle", progress: 0, key: null });
  });
  el.addEventListener("pause", () => {
    if (el === audio && !el.ended) setState({ status: "paused" });
  });
  el.addEventListener("play", () => {
    if (el === audio) setState({ status: "playing" });
  });
  return el;
}

/**
 * Toggle playback for `key`. `load` fetches the WAV the first time; the
 * resulting blob is reused for repeat plays in this session.
 */
export async function toggleAudio(key: string, load: () => Promise<Response>) {
  if (state.key === key && audio) {
    if (state.status === "playing") audio.pause();
    else if (state.status === "paused") await audio.play().catch(() => undefined);
    return;
  }
  if (state.key === key && state.status === "loading") {
    stopAudio(); // second click while loading cancels
    return;
  }

  stopAudio();
  const myRequest = ++requestId;
  setState({ key, status: "loading", progress: 0, error: undefined });

  try {
    let url = blobUrls.get(key);
    if (!url) {
      const res = await load();
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Could not load audio.");
      }
      url = URL.createObjectURL(await res.blob());
      blobUrls.set(key, url);
      if (blobUrls.size > MAX_BLOBS) {
        const [oldestKey, oldestUrl] = blobUrls.entries().next().value as [string, string];
        URL.revokeObjectURL(oldestUrl);
        blobUrls.delete(oldestKey);
      }
    }
    if (myRequest !== requestId) return; // cancelled or superseded

    audio = getAudio();
    audio.src = url;
    await audio.play();
  } catch (err) {
    if (myRequest !== requestId) return;
    audio = null;
    setState({ status: "error", error: err instanceof Error ? err.message : "Could not play audio." });
  }
}
