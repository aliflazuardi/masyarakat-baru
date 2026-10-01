import type { CalculatorData } from "@/lib/calculator/data";
import {
  formatNumber,
  formatPercent,
  formatRupiah,
  formatRupiahShort,
} from "@/lib/calculator/format";
import type { Figure } from "@/content/schema";
import { KIND_LABEL } from "./SourceNote";

const GROUPS: { title: string; match: (f: Figure) => boolean }[] = [
  { title: "Postur APBN 2026", match: (f) => f.group === "postur" },
  {
    title: "Pos belanja untuk simulator (tidak tumpang-tindih)",
    match: (f) => f.group === "alokasi",
  },
  {
    title: "Anggaran prioritas (lintas fungsi)",
    match: (f) => f.group === "prioritas" || f.group === "lainnya",
  },
  {
    title: "Penduduk, ekonomi, dan aturan",
    match: (f) =>
      !f.group &&
      !f.key.startsWith("harga_") &&
      !f.key.startsWith("biaya_") &&
      !f.key.startsWith("ambang_"),
  },
  {
    title: "Harga pembanding",
    match: (f) => f.key.startsWith("harga_") || f.key.startsWith("biaya_"),
  },
  { title: "Asumsi model simulator", match: (f) => f.key.startsWith("ambang_") },
];

function formatValue(f: Figure): string {
  switch (f.unit) {
    case "IDR_T":
      return formatRupiahShort(f.value * 1e12);
    case "IDR":
      return formatRupiah(f.value);
    case "persen":
      return formatPercent(f.value, f.value % 1 === 0 ? 0 : 2);
    case "orang":
      return f.value >= 1e6 ? `${formatNumber(f.value / 1e6)} juta orang` : `${f.value} orang`;
    default:
      return `${f.value} ${f.unit}`;
  }
}

/** "Bagaimana kami menghitung?": every number and assumption, with its source. */
export function Methodology({ data }: { data: CalculatorData }) {
  const figures = Object.values(data.figures);
  return (
    <details className="rounded-2xl border border-border bg-surface p-5" id="metodologi">
      <summary className="cursor-pointer text-lg font-semibold">Bagaimana kami menghitung?</summary>
      <div className="mt-4 grid gap-6 text-sm">
        <p className="text-muted">
          Semua angka berasal dari dokumen resmi atau dihitung dari angka resmi. Angka{" "}
          <em>perkiraan</em> adalah asumsi penyusun yang ditulis terbuka agar bisa diperiksa. Model
          ini sengaja sederhana: tujuannya membantu memahami skala dan trade-off, bukan memprediksi.
        </p>
        {GROUPS.map((g) => {
          const rows = figures.filter(g.match);
          if (rows.length === 0) return null;
          return (
            <section key={g.title}>
              <h3 className="font-semibold">{g.title}</h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[36rem] text-left">
                  <thead className="text-xs text-muted">
                    <tr>
                      <th className="py-1 pr-3 font-normal">Angka</th>
                      <th className="py-1 pr-3 font-normal">Nilai</th>
                      <th className="py-1 pr-3 font-normal">Jenis</th>
                      <th className="py-1 font-normal">Sumber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((f) => (
                      <tr key={f.key} className="border-t border-border align-top">
                        <td className="py-2 pr-3">
                          {f.label}
                          {f.note && (
                            <span className="mt-0.5 block text-xs text-muted">{f.note}</span>
                          )}
                        </td>
                        <td className="num py-2 pr-3 whitespace-nowrap">{formatValue(f)}</td>
                        <td className="py-2 pr-3">{KIND_LABEL[f.kind]}</td>
                        <td className="py-2">
                          {f.sourceUrl ? (
                            <a
                              href={f.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-2"
                            >
                              {f.source}
                            </a>
                          ) : (
                            f.source
                          )}{" "}
                          ({f.year})
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
        <section>
          <h3 className="font-semibold">Aturan pajak {data.tax.year}</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Tarif PPh 21 progresif:{" "}
              {data.tax.pph21.brackets
                .map((b, i, all) => {
                  const lower = i === 0 ? 0 : (all[i - 1].upTo as number);
                  return b.upTo === null
                    ? `${formatPercent(b.rate * 100, 0)} di atas ${formatRupiahShort(lower)}`
                    : `${formatPercent(b.rate * 100, 0)} sampai ${formatRupiahShort(b.upTo)}`;
                })
                .join("; ")}
              .
            </li>
            <li>
              PTKP {formatRupiah(data.tax.pph21.ptkp.self)} per tahun, ditambah{" "}
              {formatRupiah(data.tax.pph21.ptkp.married)} jika menikah dan{" "}
              {formatRupiah(data.tax.pph21.ptkp.perDependent)} per tanggungan (maksimal{" "}
              {data.tax.pph21.ptkp.maxDependents}).
            </li>
            <li>
              Biaya jabatan {formatPercent(data.tax.pph21.biayaJabatan.rate * 100, 0)} dari
              penghasilan bruto, maksimal {formatRupiah(data.tax.pph21.biayaJabatan.maxPerYear)} per
              tahun.
            </li>
            <li>
              PPN efektif {formatPercent(data.tax.ppn.effectiveRate * 100, 0)} untuk barang/jasa
              non-mewah.
            </li>
          </ul>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {data.tax.sources.map((s) => (
              <li key={s.url}>
                Sumber:{" "}
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="font-semibold">Upah minimum provinsi</h3>
          <ul className="mt-2 space-y-1">
            {data.provinces.map((p) => (
              <li key={p.key}>
                {p.name}: <span className="num">{formatRupiah(p.ump)}</span> ({p.year}) ·{" "}
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {p.source}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </details>
  );
}
