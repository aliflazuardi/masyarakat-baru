"use client";

import { useState } from "react";
import type { CalculatorData } from "@/lib/calculator/data";
import { formatDelta, formatPercent, formatRupiahShort } from "@/lib/calculator/format";
import {
  encodeScenario,
  evaluate,
  normalizeScenario,
  sliderRange,
  type Scenario,
} from "@/lib/calculator/reallocation";
import { track } from "@/lib/analytics";
import { Meter } from "./Meter";

const LEVEL_TEXT = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
} as const;

type Props = {
  data: CalculatorData;
  scenario: Scenario;
  onChange: (s: Scenario) => void;
};

export function ReallocationTab({ data, scenario, onChange }: Props) {
  const { model } = data;
  const result = evaluate(model, scenario);
  const [copied, setCopied] = useState(false);

  function set(key: string, value: number) {
    onChange(normalizeScenario(model.categories, { ...scenario, [key]: value }));
  }

  async function share() {
    const query = encodeScenario(model.categories, scenario);
    const url = `${window.location.origin}${window.location.pathname}?tab=menkeu${query ? `&${query}` : ""}`;
    window.history.replaceState(null, "", url);
    track({ name: "calculator_shared", props: { tab: "menkeu" } });
    try {
      if (navigator.share)
        await navigator.share({ url, text: "Coba lihat skenario APBN versiku:" });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
      }
    } catch {
      // Share sheet dismissed or clipboard blocked: the URL is still in the address bar.
    }
  }

  const biggest = [...result.categories].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))[0];
  const changed = biggest && Math.abs(biggest.delta) >= 0.05e12;

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Meter
          label="Defisit terhadap PDB"
          value={result.deficitPct}
          max={5}
          limit={model.deficitCapPct}
          limitLabel={`Batas ${formatPercent(model.deficitCapPct, 0)}`}
          badWhenAbove
          valueText={formatPercent(result.deficitPct, 2)}
          okText={`Defisit ${formatRupiahShort(result.deficit)}, masih di bawah batas UU.`}
          badText={`Defisit ${formatRupiahShort(result.deficit)} melewati batas ${formatPercent(model.deficitCapPct, 0)} PDB.`}
          testId="meter-deficit"
        />
        <Meter
          label="Anggaran pendidikan"
          value={result.educationPct}
          max={30}
          limit={model.educationMinPct}
          limitLabel={`Minimal ${formatPercent(model.educationMinPct, 0)}`}
          badWhenAbove={false}
          valueText={formatPercent(result.educationPct)}
          okText="Memenuhi amanat konstitusi."
          badText="Di bawah amanat 20% dalam UUD 1945."
          testId="meter-education"
        />
        <div
          className="rounded-xl border border-border bg-surface p-4"
          data-testid="energy-pressure"
        >
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-semibold">Tekanan harga energi</p>
            <p className="text-lg font-bold">{LEVEL_TEXT[result.energyPricePressure]}</p>
          </div>
          <p className="mt-3 text-sm text-muted">
            {result.energyCutPct > 0
              ? `Subsidi energi dipangkas ${formatPercent(result.energyCutPct, 0)}. Harga BBM, LPG, atau listrik bersubsidi berpotensi naik, dan bisa ikut mendorong inflasi.`
              : "Subsidi energi tidak dipangkas, jadi harga energi bersubsidi tidak tertekan dari sisi anggaran."}
          </p>
        </div>
      </div>

      <p
        className="rounded-xl border border-teal/40 bg-teal/5 p-4 leading-relaxed"
        aria-live="polite"
      >
        <span className="font-semibold">Bahasa bayinya:</span>{" "}
        {changed ? (
          <>
            perubahan terbesarmu ada di <strong>{biggest.label.toLowerCase()}</strong>:{" "}
            <strong className="num">{formatDelta(biggest.delta, true)}</strong>, atau{" "}
            <strong className="num">{formatDelta(biggest.deltaPerPerson)}</strong> per orang per
            tahun. Total belanja menjadi{" "}
            <strong className="num">{formatRupiahShort(result.totalSpending)}</strong> dengan
            pendapatan tetap, jadi defisit{" "}
            {result.deficit >= 0 ? "menjadi" : "berubah menjadi surplus"}{" "}
            <strong className="num">{formatRupiahShort(Math.abs(result.deficit))}</strong>.
          </>
        ) : (
          <>
            geser salah satu pos di bawah untuk melihat konsekuensinya. Pendapatan negara dianggap
            tetap.
          </>
        )}
      </p>

      <ul className="grid gap-4">
        {result.categories.map((c) => {
          const cat = model.categories.find((x) => x.key === c.key)!;
          const { min, max } = sliderRange(cat);
          const id = `slider-${c.key}`;
          const pctChange = (c.delta / c.baseline) * 100;
          return (
            <li key={c.key} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <label htmlFor={id} className="font-semibold">
                  {cat.locked && <span aria-hidden>🔒 </span>}
                  {c.label}
                </label>
                <span className="num text-sm">
                  {formatRupiahShort(c.value)} <DeltaBadge delta={c.delta} pct={pctChange} />
                </span>
              </div>
              <input
                id={id}
                type="range"
                min={min}
                max={max}
                step={c.baseline / 100}
                value={c.value}
                disabled={cat.locked}
                onChange={(e) => set(c.key, Number(e.target.value))}
                aria-valuetext={`${formatRupiahShort(c.value)}, ${formatDelta(c.delta, true)} dari APBN`}
                className="w-full"
              />
              <p className="text-xs text-muted">
                {cat.locked
                  ? "Dikunci: bunga utang adalah kewajiban yang harus dibayar."
                  : `APBN: ${formatRupiahShort(c.baseline)} · per orang: ${formatDelta(c.deltaPerPerson)}/tahun`}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={share}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold/85"
        >
          Bagikan skenarioku
        </button>
        <button
          type="button"
          onClick={() => onChange(normalizeScenario(model.categories, {}))}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-surface-strong"
        >
          Kembalikan ke APBN
        </button>
        <span aria-live="polite" className="text-xs text-muted">
          {copied && "Tautan skenario tersalin!"}
        </span>
      </div>
    </div>
  );
}

/** Diverging encoding: teal for more, orange for less, always with a sign. */
function DeltaBadge({ delta, pct }: { delta: number; pct: number }) {
  if (Math.abs(delta) < 0.05e12) return <span className="text-muted">(tetap)</span>;
  const up = delta > 0;
  return (
    <span
      className={`ml-1 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-semibold text-bg ${up ? "bg-chart-up" : "bg-chart-down"}`}
    >
      {up ? "▲" : "▼"} {formatPercent(Math.abs(pct), 0)}
    </span>
  );
}
