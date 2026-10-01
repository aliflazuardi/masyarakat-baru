"use client";

import { useState, type ReactNode } from "react";
import type { CalculatorData } from "@/lib/calculator/data";
import { PRESET_KEYS } from "@/lib/calculator/data";
import { rupiah, TRILIUN } from "@/lib/calculator/figures";
import {
  formatCount,
  formatNumber,
  formatRupiah,
  formatRupiahShort,
} from "@/lib/calculator/format";
import { howMany, perCapita } from "@/lib/calculator/perCapita";
import { StatTile } from "@/components/ui/StatTile";
import { SourceNote } from "./SourceNote";

const CUSTOM = "custom";

export function BigNumberTab({ data }: { data: CalculatorData }) {
  const fig = (k: string) => data.figures[k];
  const [selected, setSelected] = useState<string>(PRESET_KEYS[0]);
  const [customT, setCustomT] = useState("100");

  const preset = selected === CUSTOM ? null : fig(selected);
  const customValue = Number(customT.replace(",", "."));
  const total = preset
    ? rupiah(preset)
    : Number.isFinite(customValue) && customValue > 0
      ? customValue * TRILIUN
      : 0;
  const label = preset ? preset.label : "Angka pilihanmu";

  const population = fig("penduduk").value;
  const pc = perCapita(total, population, fig("anggota_rumah_tangga").value);
  const mieAyamPerDay = pc.perPersonDay / fig("harga_mie_ayam").value;
  const umpJakarta = data.provinces.find((p) => p.key === "dki-jakarta");

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="mb-3 text-sm text-muted">Pilih angka raksasa</legend>
        <div className="flex flex-wrap gap-2">
          {PRESET_KEYS.map((k) => (
            <PresetChip key={k} active={selected === k} onClick={() => setSelected(k)}>
              {fig(k).label}
            </PresetChip>
          ))}
          <PresetChip active={selected === CUSTOM} onClick={() => setSelected(CUSTOM)}>
            Angka sendiri
          </PresetChip>
        </div>
        {selected === CUSTOM && (
          <label className="mt-4 flex max-w-xs items-center gap-2">
            <span className="text-sm text-muted">Rp</span>
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="any"
              value={customT}
              onChange={(e) => setCustomT(e.target.value)}
              aria-label="Jumlah dalam triliun rupiah"
              className="num min-h-11 w-full rounded-xl border border-border bg-surface px-3 focus:border-teal focus:outline-none"
            />
            <span className="text-sm text-muted">triliun</span>
          </label>
        )}
      </fieldset>

      <div aria-live="polite">
        <p className="text-sm text-muted">{label}</p>
        <p className="num text-4xl font-bold text-teal sm:text-5xl" data-testid="big-number">
          {formatRupiahShort(total)}
        </p>
        {preset && (
          <div className="mt-2">
            <SourceNote figure={preset} />
          </div>
        )}
      </div>

      <p className="rounded-xl border border-teal/40 bg-teal/5 p-4 leading-relaxed">
        <span className="font-semibold">Bahasa bayinya:</span> kalau angka ini dibagi rata ke{" "}
        {formatNumber(population / 1e6)} juta penduduk, tiap orang &ldquo;kebagian&rdquo;{" "}
        <strong className="num">{formatRupiah(pc.perPersonYear)}</strong> setahun, atau sekitar{" "}
        <strong className="num">{formatRupiah(pc.perPersonDay)}</strong> sehari
        {mieAyamPerDay >= 0.1 && (
          <>
            {" "}
            (kira-kira {mieAyamPerDay >= 1 ? formatNumber(mieAyamPerDay) : "sepersekian"} mangkuk
            mie ayam per hari)
          </>
        )}
        .
        {preset?.key === "aset_danantara" && (
          <span className="mt-2 block text-sm text-muted">
            Catatan: ini nilai aset yang dikelola, bukan uang yang dibelanjakan setiap tahun.
          </span>
        )}
      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label="Per orang per tahun"
          value={formatRupiah(pc.perPersonYear)}
          testId="per-person-year"
        />
        <StatTile label="Per orang per bulan" value={formatRupiah(pc.perPersonMonth)} />
        <StatTile label="Per orang per hari" value={formatRupiah(pc.perPersonDay)} />
        <StatTile
          label="Per rumah tangga per tahun"
          value={formatRupiah(pc.perHouseholdYear)}
          hint={`${fig("anggota_rumah_tangga").value.toLocaleString("id-ID")} orang per rumah tangga`}
        />
      </div>

      <div>
        <h3 className="font-semibold">Setara dengan…</h3>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          <Analogy
            value={howMany(pc.perPersonYear, fig("harga_mie_ayam").value)}
            unit="mangkuk mie ayam per orang setahun"
            figureLabel={`@ ${formatRupiah(fig("harga_mie_ayam").value)}`}
          />
          <Analogy
            value={howMany(pc.perPersonYear, fig("harga_beras_medium").value)}
            unit="kg beras medium per orang setahun"
            figureLabel={`@ ${formatRupiah(fig("harga_beras_medium").value)}/kg`}
          />
          <Analogy
            value={howMany(total, fig("harga_porsi_mbg").value)}
            unit="porsi Makan Bergizi Gratis"
            figureLabel={`@ ${formatRupiah(fig("harga_porsi_mbg").value)}/porsi`}
          />
          <Analogy
            value={howMany(total, fig("biaya_revitalisasi_sekolah").value)}
            unit="sekolah direvitalisasi"
            figureLabel={`@ ${formatRupiahShort(fig("biaya_revitalisasi_sekolah").value)}/sekolah`}
          />
          <Analogy
            value={howMany(pc.perPersonYear, fig("harga_pertalite").value)}
            unit="liter Pertalite per orang setahun"
            figureLabel={`@ ${formatRupiah(fig("harga_pertalite").value)}/liter`}
          />
          {umpJakarta && (
            <Analogy
              value={howMany(total, umpJakarta.ump * 12)}
              unit="gaji setahun pekerja ber-UMP DKI Jakarta"
              figureLabel={`@ ${formatRupiah(umpJakarta.ump)}/bulan`}
            />
          )}
        </ul>
        <p className="mt-3 text-xs text-muted">
          Harga pembanding dan sumbernya ada di bagian &ldquo;Bagaimana kami menghitung?&rdquo; di
          bawah.
        </p>
      </div>
    </div>
  );
}

function PresetChip({
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
      className={`min-h-10 rounded-full border px-4 text-sm transition-colors ${
        active ? "border-teal bg-teal text-bg" : "border-border text-muted hover:text-text"
      }`}
    >
      {children}
    </button>
  );
}

function Analogy({
  value,
  unit,
  figureLabel,
}: {
  value: number;
  unit: string;
  figureLabel: string;
}) {
  return (
    <li className="rounded-xl border border-border bg-surface p-4">
      <p className="num text-2xl font-bold">{formatCount(value)}</p>
      <p className="text-sm">{unit}</p>
      <p className="mt-1 text-xs text-muted">{figureLabel}</p>
    </li>
  );
}
