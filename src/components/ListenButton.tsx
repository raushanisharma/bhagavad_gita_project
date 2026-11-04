"use client";

import { setVoice, toggleAudio, usePlayer, useVoice, type VoiceGender } from "@/lib/audio";

import { Icon } from "./Icon";

type Source = { kind: "verse"; id: string } | { kind: "text"; text: string };

interface Props {
  source: Source;
  label?: string;
  /** "pill" shows text; "icon" is a compact round button. */
  variant?: "pill" | "icon" | "dark";
  className?: string;
}

/** Bump when the voice prompt or model changes so browsers fetch fresh audio. */
const AUDIO_VERSION = "3";

function sourceKey(source: Source, voice: VoiceGender) {
  return source.kind === "verse" ? `verse:${source.id}:${voice}` : `text:${voice}:${source.text}`;
}

function load(source: Source, voice: VoiceGender) {
  if (source.kind === "verse") {
    const qs = new URLSearchParams({ id: source.id, voice, v: AUDIO_VERSION });
    return fetch(`/api/tts/verse?${qs}`);
  }
  return fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: source.text, voice }),
  });
}

export function ListenButton({ source, label = "Listen", variant = "pill", className = "" }: Props) {
  const voice = useVoice();
  const player = usePlayer();
  const key = sourceKey(source, voice);
  const active = player.key === key;
  const status = active ? player.status : "idle";

  const icon =
    status === "loading" ? (
      <Icon name="loader" size={16} className="animate-spin" />
    ) : status === "playing" ? (
      <Icon name="pause" size={16} strokeWidth={2.2} />
    ) : (
      <Icon name="play" size={15} strokeWidth={1.8} className="translate-x-px" />
    );

  const text =
    status === "loading" ? "Preparing voice…" : status === "playing" ? "Pause" : status === "paused" ? "Resume" : label;
  const aria = status === "playing" ? `Pause ${label.toLowerCase()}` : label;

  const onClick = () => toggleAudio(key, () => load(source, voice));

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        title={status === "error" && active ? player.error : aria}
        className={`relative grid place-items-center w-8 h-8 rounded-full text-muted hover:text-ink hover:bg-paper transition-colors ${
          status === "playing" ? "text-saffron-deep" : ""
        } ${className}`}
      >
        {icon}
      </button>
    );
  }

  const dark = variant === "dark";
  return (
    <span className={`inline-flex flex-col items-center ${className}`}>
      <button
        type="button"
        onClick={onClick}
        aria-label={aria}
        className={`relative inline-flex items-center gap-2 overflow-hidden rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
          dark
            ? "border-white/20 bg-white/10 text-[#fbeee0] hover:bg-white/15"
            : status === "idle"
              ? "border-line-strong bg-surface text-ink hover:border-ink"
              : "border-saffron bg-saffron-soft text-maroon"
        }`}
      >
        <span className="grid place-items-center w-4">{icon}</span>
        <span aria-live="polite">{text}</span>
        {active && (status === "playing" || status === "paused") && (
          <span
            className="absolute bottom-0 left-0 h-[2px] bg-saffron transition-[width] duration-200"
            style={{ width: `${player.progress * 100}%` }}
            aria-hidden
          />
        )}
      </button>
      {active && status === "error" && <span role="alert" className="mt-1.5 text-xs text-red-700">{player.error}</span>}
    </span>
  );
}

export function VoiceToggle({ className = "", dark = false }: { className?: string; dark?: boolean }) {
  const voice = useVoice();
  const options: { value: VoiceGender; label: string }[] = [
    { value: "female", label: "Female" },
    { value: "male", label: "Male" },
  ];
  return (
    <div
      role="radiogroup"
      aria-label="Narrator voice"
      className={`inline-flex items-center gap-0.5 rounded-full border p-0.5 text-xs font-medium ${
        dark ? "border-white/20 bg-white/5" : "border-line bg-surface"
      } ${className}`}
    >
      <Icon name="volume" size={14} className={`mx-1.5 ${dark ? "text-[#f3e3d0]/60" : "text-muted"}`} />
      {options.map((o) => {
        const selected = voice === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => setVoice(o.value)}
            className={`rounded-full px-3 py-1 transition-colors ${
              selected
                ? dark
                  ? "bg-[#fbeee0] text-night"
                  : "bg-ink text-paper"
                : dark
                  ? "text-[#f3e3d0]/70 hover:text-white"
                  : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
