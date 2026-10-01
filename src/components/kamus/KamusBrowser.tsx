"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { Fallacy, FallacyCategory } from "@/content/schema";
import { track } from "@/lib/analytics";
import { CATEGORY_LABELS, filterFallacies } from "@/lib/kamus/search";

type KamusBrowserProps = { fallacies: Fallacy[] };

const CATEGORIES = Object.keys(CATEGORY_LABELS) as FallacyCategory[];

function slugFromHash(): string | null {
  const slug = decodeURIComponent(window.location.hash.slice(1));
  return slug || null;
}

export function KamusBrowser({ fallacies }: KamusBrowserProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FallacyCategory | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const bySlug = new Map(fallacies.map((f) => [f.slug, f]));
  const visible = filterFallacies(fallacies, query, category);

  // Deep links: /kamus-sesat-pikir/#ad-hominem opens that card, on load and on hash change.
  useEffect(() => {
    const slugs = new Set(fallacies.map((f) => f.slug));
    function syncFromHash() {
      const slug = slugFromHash();
      if (!slug || !slugs.has(slug)) return;
      // Clear filters so the linked card is guaranteed to be visible.
      setQuery("");
      setCategory(null);
      setOpenSlug(slug);
      requestAnimationFrame(() =>
        document.getElementById(slug)?.scrollIntoView({ block: "start" }),
      );
    }
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [fallacies]);

  function toggle(slug: string) {
    const next = openSlug === slug ? null : slug;
    setOpenSlug(next);
    // Keep the URL shareable without adding history entries or jumping.
    const url = next ? `#${next}` : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
    if (next) track({ name: "kamus_card_opened", props: { slug: next } });
  }

  return (
    <div>
      <div className="sticky top-14 z-10 -mx-4 bg-bg/90 px-4 py-3 backdrop-blur">
        <label htmlFor="kamus-search" className="sr-only">
          Cari sesat pikir
        </label>
        <input
          id="kamus-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari: ad hominem, lereng licin, pengalihan…"
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-border bg-surface px-4 text-base placeholder:text-muted focus:border-gold focus:outline-none"
        />
        <div
          role="group"
          aria-label="Filter kategori"
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
        >
          <Chip active={category === null} onClick={() => setCategory(null)}>
            Semua
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={category === c}
              onClick={() => setCategory(category === c ? null : c)}
            >
              {CATEGORY_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="mt-2 text-sm text-muted" data-testid="kamus-count">
        {visible.length} sesat pikir
      </p>

      {visible.length === 0 ? (
        <p className="mt-6 text-muted">
          Tidak ada yang cocok. Coba kata kunci lain atau{" "}
          <button
            type="button"
            className="text-gold underline underline-offset-4"
            onClick={() => {
              setQuery("");
              setCategory(null);
            }}
          >
            hapus filter
          </button>
          .
        </p>
      ) : (
        <ul className="mt-4 grid items-start gap-3 sm:grid-cols-2">
          {visible.map((f) => (
            <li key={f.slug}>
              <FallacyCard
                fallacy={f}
                open={openSlug === f.slug}
                onToggle={() => toggle(f.slug)}
                related={f.related.map((r) => bySlug.get(r)).filter((r): r is Fallacy => !!r)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-9 shrink-0 rounded-full border px-3 text-sm transition-colors ${
        active ? "border-gold bg-gold text-bg" : "border-border text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function FallacyCard({
  fallacy: f,
  open,
  onToggle,
  related,
}: {
  fallacy: Fallacy;
  open: boolean;
  onToggle: () => void;
  related: Fallacy[];
}) {
  const panelId = `${f.slug}-panel`;
  return (
    <article
      id={f.slug}
      className={`scroll-mt-48 overflow-hidden rounded-2xl border bg-surface backdrop-blur transition-colors ${
        open ? "border-gold/60" : "border-border"
      }`}
    >
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-16 w-full items-start justify-between gap-3 p-4 text-left hover:bg-surface-strong"
        >
          <span>
            <span className="block text-lg font-bold">{f.nameId}</span>
            <span className="block text-sm text-muted">{f.nameEn}</span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted">
              {CATEGORY_LABELS[f.category]}
            </span>
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              className={`size-4 text-muted transition-transform ${open ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-border p-4 text-sm leading-relaxed"
      >
        <p>{f.definition}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold">Contoh</h3>
        <p className="mt-1 italic">{f.example}</p>
        <h3 className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold">
          Cara Menanggapi
        </h3>
        <p className="mt-1">{f.counter}</p>
        {related.length > 0 && (
          <>
            <h3 className="mt-4 text-xs font-semibold uppercase tracking-widest text-gold">
              Terkait
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {related.map((r) => (
                <li key={r.slug}>
                  <a
                    href={`#${r.slug}`}
                    className="inline-block rounded-full border border-border px-3 py-1 hover:bg-surface-strong"
                  >
                    {r.nameId}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
        <Link
          href="/kuis-sesat-pikir/"
          className="mt-5 inline-block font-semibold text-gold underline-offset-4 hover:underline"
        >
          Uji dirimu di Kuis Sesat Pikir →
        </Link>
      </div>
    </article>
  );
}
