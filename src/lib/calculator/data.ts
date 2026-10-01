// Assembles calculator inputs from content files. Runs at build time on the server;
// the result is plain serialisable data passed to the client components.

import type { Figure, Province, TaxRules } from "@/content/schema";
import { getAssumptions, getBudgetFigures, getProvinces, getTaxRules } from "@/lib/content";
import { indexFigures, requireFigure, rupiah } from "./figures";
import type { ModelInputs } from "./reallocation";

const LOCKED = new Set(["alokasi_bunga_utang"]);

/** Big-number presets for Tab 1, in display order. */
export const PRESET_KEYS = [
  "belanja_negara",
  "anggaran_mbg",
  "anggaran_pendidikan",
  "alokasi_subsidi_energi",
  "alokasi_bunga_utang",
  "aset_danantara",
] as const;

export const REQUIRED_FIGURES = [
  ...PRESET_KEYS,
  "pendapatan_negara",
  "defisit_persen_pdb",
  "penduduk",
  "anggota_rumah_tangga",
  "pdb_2026_asumsi",
  "batas_defisit_persen_pdb",
  "mandatory_pendidikan_persen",
  "porsi_belanja_kena_ppn",
  "harga_mie_ayam",
  "harga_beras_medium",
  "harga_porsi_mbg",
  "harga_pertalite",
  "biaya_revitalisasi_sekolah",
  "ambang_subsidi_sedang",
  "ambang_subsidi_tinggi",
] as const;

export type CalculatorData = {
  figures: Record<string, Figure>;
  /** Slider/allocation categories (rupiah), in data order. */
  allocations: { key: string; label: string; value: number }[];
  model: ModelInputs;
  tax: TaxRules;
  provinces: Province[];
};

function loadIndex() {
  return indexFigures([...getBudgetFigures(), ...getAssumptions()]);
}

export function buildModelInputs(index = loadIndex()): ModelInputs {
  const get = (k: string) => requireFigure(index, k);
  const categories = [...index.values()]
    .filter((f) => f.group === "alokasi")
    .map((f) => ({ key: f.key, label: f.label, baseline: rupiah(f), locked: LOCKED.has(f.key) }));
  return {
    categories,
    revenue: rupiah(get("pendapatan_negara")),
    gdp: rupiah(get("pdb_2026_asumsi")),
    population: get("penduduk").value,
    deficitCapPct: get("batas_defisit_persen_pdb").value,
    educationBudget: rupiah(get("anggaran_pendidikan")),
    educationCategoryKey: "alokasi_pendidikan",
    educationMinPct: get("mandatory_pendidikan_persen").value,
    energySubsidyKey: "alokasi_subsidi_energi",
    energyCutMediumPct: get("ambang_subsidi_sedang").value,
    energyCutHighPct: get("ambang_subsidi_tinggi").value,
  };
}

export function getCalculatorData(): CalculatorData {
  const index = loadIndex();
  for (const key of REQUIRED_FIGURES) requireFigure(index, key);
  const model = buildModelInputs(index);
  return {
    figures: Object.fromEntries(index),
    allocations: model.categories.map((c) => ({ key: c.key, label: c.label, value: c.baseline })),
    model,
    tax: getTaxRules(),
    provinces: getProvinces(),
  };
}
