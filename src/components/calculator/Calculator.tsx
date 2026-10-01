"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import type { CalculatorData } from "@/lib/calculator/data";
import { decodeScenario, normalizeScenario, type Scenario } from "@/lib/calculator/reallocation";
import { BigNumberTab } from "./BigNumberTab";
import { ReallocationTab } from "./ReallocationTab";
import { TaxTab } from "./TaxTab";

const TABS = [
  { id: "angka", label: "Angka Raksasa" },
  { id: "pajak", label: "Ke Mana Pajakmu?" },
  { id: "menkeu", label: "Jadi Menkeu Sehari" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function Calculator({ data }: { data: CalculatorData }) {
  const [tab, setTab] = useState<TabId>("angka");
  const [scenario, setScenario] = useState<Scenario>(() =>
    normalizeScenario(data.model.categories, {}),
  );

  // Shared links (?tab=menkeu&alokasi_x=…) restore the tab and the scenario after hydration.
  useEffect(() => {
    function applyUrl() {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      if (t && TABS.some((x) => x.id === t)) setTab(t as TabId);
      if (t === "menkeu")
        setScenario(decodeScenario(data.model.categories, window.location.search));
    }
    applyUrl();
  }, [data.model.categories]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    const next = TABS[(index + delta + TABS.length) % TABS.length];
    setTab(next.id);
    document.getElementById(`tab-${next.id}`)?.focus();
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Mode kalkulator"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border bg-surface p-1"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`min-h-11 rounded-xl px-2 py-1 text-xs leading-tight font-semibold transition-colors sm:text-sm ${
              tab === t.id ? "bg-teal text-bg" : "text-muted hover:text-text"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {TABS.map((t) => (
        <div
          key={t.id}
          id={`panel-${t.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${t.id}`}
          hidden={tab !== t.id}
          className="mt-6"
        >
          {t.id === "angka" && <BigNumberTab data={data} />}
          {t.id === "pajak" && <TaxTab data={data} />}
          {t.id === "menkeu" && (
            <ReallocationTab data={data} scenario={scenario} onChange={setScenario} />
          )}
        </div>
      ))}
    </div>
  );
}
