import type { Metadata } from "next";
import { Calculator } from "@/components/calculator/Calculator";
import { Methodology } from "@/components/calculator/Methodology";
import { getCalculatorData } from "@/lib/calculator/data";

const title = "Kalkulator Bahasa Bayi";
const description =
  "Membuat makroekonomi jadi mikro-personal: APBN 2026 dalam rupiah per orang, ke mana pajakmu pergi, dan simulasi jadi Menkeu sehari.";

export const metadata: Metadata = { title, description, openGraph: { title, description } };

export default function CalculatorPage() {
  const data = getCalculatorData();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-teal">
        Bahasa Bayi · Danantara
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Membuat makroekonomi jadi mikro-personal. Data: APBN 2026.
      </p>
      <p className="mt-3 inline-block rounded-lg border border-border px-3 py-1 text-xs text-muted">
        Simulasi edukatif, bukan proyeksi resmi.
      </p>
      <div className="mt-6">
        <Calculator data={data} />
      </div>
      <div className="mt-10">
        <Methodology data={data} />
      </div>
    </div>
  );
}
