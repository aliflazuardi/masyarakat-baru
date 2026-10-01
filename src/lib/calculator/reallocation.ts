// Tab 3, "Jadi Menkeu Sehari": reallocate spending and see the trade-offs.
// Revenue is held at the APBN target; only spending moves. Indirect effects are
// shown as direction plus a rough level, never as a forecast.

export type Category = {
  key: string;
  label: string;
  /** Baseline in rupiah. */
  baseline: number;
  /** Locked categories (e.g. debt interest) can't be changed. */
  locked?: boolean;
};

export type Scenario = Record<string, number>;

export type ModelInputs = {
  categories: readonly Category[];
  /** Revenue in rupiah (fixed). */
  revenue: number;
  /** Nominal GDP in rupiah. */
  gdp: number;
  population: number;
  deficitCapPct: number;
  /** Cross-cutting education budget at baseline (includes transfers), rupiah. */
  educationBudget: number;
  educationCategoryKey: string;
  educationMinPct: number;
  energySubsidyKey: string;
  /** Cut percentages at which energy price pressure is "sedang" / "tinggi". */
  energyCutMediumPct: number;
  energyCutHighPct: number;
};

export type Level = "rendah" | "sedang" | "tinggi";

export type CategoryResult = {
  key: string;
  label: string;
  baseline: number;
  value: number;
  delta: number;
  deltaPerPerson: number;
};

export type ModelResult = {
  categories: CategoryResult[];
  totalSpending: number;
  deficit: number;
  deficitPct: number;
  overDeficitCap: boolean;
  educationBudget: number;
  educationPct: number;
  belowEducationFloor: boolean;
  energyCutPct: number;
  energyPricePressure: Level;
};

/** Slider bounds for a category: 50%–150% of baseline, fixed when locked. */
export function sliderRange(c: Category): { min: number; max: number } {
  return c.locked
    ? { min: c.baseline, max: c.baseline }
    : { min: c.baseline * 0.5, max: c.baseline * 1.5 };
}

/** Clamps a scenario to each category's allowed range; unknown keys are dropped. */
export function normalizeScenario(categories: readonly Category[], scenario: Scenario): Scenario {
  const out: Scenario = {};
  for (const c of categories) {
    const { min, max } = sliderRange(c);
    const v = scenario[c.key];
    out[c.key] =
      typeof v === "number" && Number.isFinite(v) ? Math.min(Math.max(v, min), max) : c.baseline;
  }
  return out;
}

export function evaluate(inputs: ModelInputs, scenario: Scenario): ModelResult {
  const values = normalizeScenario(inputs.categories, scenario);
  const categories = inputs.categories.map((c) => {
    const value = values[c.key];
    const delta = value - c.baseline;
    return {
      key: c.key,
      label: c.label,
      baseline: c.baseline,
      value,
      delta,
      deltaPerPerson: delta / inputs.population,
    };
  });
  const totalSpending = categories.reduce((s, c) => s + c.value, 0);
  const deficit = totalSpending - inputs.revenue;
  const deficitPct = (deficit / inputs.gdp) * 100;

  const eduDelta = categories.find((c) => c.key === inputs.educationCategoryKey)?.delta ?? 0;
  const educationBudget = inputs.educationBudget + eduDelta;
  const educationPct = (educationBudget / totalSpending) * 100;

  const energy = categories.find((c) => c.key === inputs.energySubsidyKey);
  const energyCutPct =
    energy && energy.baseline > 0 ? Math.max(0, (-energy.delta / energy.baseline) * 100) : 0;
  let energyPricePressure: Level = "rendah";
  if (energyCutPct >= inputs.energyCutHighPct) energyPricePressure = "tinggi";
  else if (energyCutPct >= inputs.energyCutMediumPct) energyPricePressure = "sedang";

  return {
    categories,
    totalSpending,
    deficit,
    deficitPct,
    overDeficitCap: deficitPct > inputs.deficitCapPct,
    educationBudget,
    educationPct,
    belowEducationFloor: educationPct < inputs.educationMinPct,
    energyCutPct,
    energyPricePressure,
  };
}

/** Encodes changed categories as compact query params (values in triliun, 1 decimal). */
export function encodeScenario(categories: readonly Category[], scenario: Scenario): string {
  const params = new URLSearchParams();
  for (const c of categories) {
    const v = scenario[c.key];
    if (typeof v !== "number" || Math.abs(v - c.baseline) < 0.05e12) continue;
    params.set(c.key, (v / 1e12).toFixed(1));
  }
  return params.toString();
}

export function decodeScenario(categories: readonly Category[], query: string): Scenario {
  const params = new URLSearchParams(query);
  const raw: Scenario = {};
  for (const c of categories) {
    const v = params.get(c.key);
    if (v !== null && v.trim() !== "" && Number.isFinite(Number(v))) raw[c.key] = Number(v) * 1e12;
  }
  return normalizeScenario(categories, raw);
}
