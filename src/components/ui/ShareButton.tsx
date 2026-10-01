"use client";

import { useState } from "react";

type Status = "idle" | "copied" | "error";

/** Shares text via the Web Share API on mobile, falling back to the clipboard. */
export function ShareButton({ text, label = "Bagikan hasil" }: { text: string; label?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (err) {
      // The user closing the share sheet is not an error.
      if (err instanceof DOMException && err.name === "AbortError") return;
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={share}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gold px-5 text-sm font-semibold text-bg transition-colors hover:bg-gold/85"
      >
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
        {label}
      </button>
      <p aria-live="polite" className="min-h-5 text-xs text-muted">
        {status === "copied" && "Tersalin ke papan klip!"}
        {status === "error" && "Gagal membagikan. Coba salin manual."}
      </p>
    </div>
  );
}
