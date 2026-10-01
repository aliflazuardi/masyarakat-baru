// Tab 1, "Angka Raksasa, Bahasa Bayi": turn a big rupiah amount into personal numbers.

export type PerCapita = {
  perPersonYear: number;
  perPersonMonth: number;
  perPersonDay: number;
  perHouseholdYear: number;
};

export function perCapita(total: number, population: number, householdSize: number): PerCapita {
  if (population <= 0 || householdSize <= 0)
    throw new Error("population and householdSize must be positive");
  const perPersonYear = total / population;
  return {
    perPersonYear,
    perPersonMonth: perPersonYear / 12,
    perPersonDay: perPersonYear / 365,
    perHouseholdYear: perPersonYear * householdSize,
  };
}

/** How many of something costing `unitPrice` an amount buys (floored, never negative). */
export function howMany(amount: number, unitPrice: number): number {
  if (unitPrice <= 0) throw new Error("unitPrice must be positive");
  return Math.max(0, Math.floor(amount / unitPrice));
}
