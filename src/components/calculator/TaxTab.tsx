"use client";

import { useState } from "react";
import type { CalculatorData } from "@/lib/calculator/data";
import { formatMultiple, formatPercent, formatRupiah } from "@/lib/calculator/format";
import { allocate, annualPph21, annualPpn } from "@/lib/calculator/tax";
import { Segmented } from "@/components/ui/Segmented";
import { StatTile } from "@/components/ui/StatTile";
import { BarList } from "./BarList";

const MAX_SALARY = 100_000_000;

export function TaxTab({ data }: { data: CalculatorData }) {
  const defaultShare = data.figures.porsi_belanja_kena_ppn.value;
  const [salary, setSalary] = useState(8_000_000);
  const [status, setStatus] = useState<"lajang" | "menikah">("lajang");
  const [dependents, setDependents] = useState<"0" | "1" | "2" | "3">("0");
  const [province, setProvince] = useState(data.provinces[0]?.key ?? "");
  const [sharePct, setSharePct] = useState(defaultShare);

  const household = { married: status === "menikah", dependents: Number(dependents) };
  const pph = annualPph21(data.tax, salary, household);
  const ppn = annualPpn(data.tax, salary, sharePct / 100);
  const total = pph.pph + ppn;
  const allocation = allocate(total, data.allocations);
  const amountFor = (key: string) => allocation.find((a) => a.key === key)?.amount ?? 0;
  const prov = data.provinces.find((p) => p.key === province);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="grid content-start gap-5">
        <div>
          <label htmlFor="gaji" className="text-sm text-muted">
            Gaji kotor per bulan
          </label>
          <input
            id="gaji"
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_SALARY * 10}
            step={100_000}
            value={salary}
            onChange={(e) => setSalary(Math.max(0, Number(e.target.value) || 0))}
            className="num mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 focus:border-teal focus:outline-none"
          />
          <input
            type="range"
            min={0}
            max={MAX_SALARY}
            step={250_000}
            value={Math.min(salary, MAX_SALARY)}
            onChange={(e) => setSalary(Number(e.target.value))}
            aria-label="Geser gaji kotor per bulan"
            aria-valuetext={formatRupiah(salary)}
            className="w-full"
          />
          <p className="num text-sm">{formatRupiah(salary)} / bulan</p>
        </div>

        <Segmented
          label="Status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "lajang", label: "Lajang" },
            { value: "menikah", label: "Menikah" },
          ]}
        />
        <Segmented
          label="Tanggungan"
          value={dependents}
          onChange={setDependents}
          options={(["0", "1", "2", "3"] as const).map((v) => ({ value: v, label: v }))}
        />

        <div>
          <label htmlFor="provinsi" className="text-sm text-muted">
            Provinsi (untuk membandingkan dengan UMP)
          </label>
          <select
            id="provinsi"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-border bg-surface px-3 focus:border-teal focus:outline-none"
          >
            {data.provinces.map((p) => (
              <option key={p.key} value={p.key} className="bg-bg">
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="porsi-ppn" className="text-sm text-muted">
            Porsi gaji yang dibelanjakan untuk barang/jasa kena PPN
          </label>
          <input
            id="porsi-ppn"
            type="range"
            min={0}
            max={100}
            step={5}
            value={sharePct}
            onChange={(e) => setSharePct(Number(e.target.value))}
            aria-valuetext={`${sharePct} persen`}
            className="w-full"
          />
          <p className="text-sm">
            <span className="num">{sharePct}%</span>{" "}
            <span className="text-muted">
              (perkiraan awal {defaultShare}%; sesuaikan dengan kebiasaanmu)
            </span>
          </p>
        </div>
      </div>

      <div className="grid content-start gap-5" aria-live="polite">
        <div className="grid grid-cols-2 gap-3">
          <StatTile
            label="PPh 21 setahun"
            value={formatRupiah(pph.pph)}
            hint={`Tarif efektif ${formatPercent(pph.effectiveRate * 100)}`}
            testId="tax-pph"
          />
          <StatTile
            label="PPN setahun (perkiraan)"
            value={formatRupiah(ppn)}
            hint="Dari belanja kena PPN"
          />
          <StatTile label="Total pajakmu setahun" value={formatRupiah(total)} testId="tax-total" />
          <StatTile
            label="Dibanding UMP"
            value={prov && prov.ump > 0 ? `${formatMultiple(salary / prov.ump)} UMP` : "–"}
            hint={prov ? `UMP ${prov.name} ${formatRupiah(prov.ump)}` : undefined}
          />
        </div>

        <p className="rounded-xl border border-teal/40 bg-teal/5 p-4 leading-relaxed">
          <span className="font-semibold">Bahasa bayinya:</span>{" "}
          {total > 0 ? (
            <>
              dari pajakmu tahun ini, sekitar{" "}
              <strong className="num">{formatRupiah(amountFor("alokasi_pendidikan"))}</strong> ikut
              membiayai pendidikan,{" "}
              <strong className="num">{formatRupiah(amountFor("alokasi_kesehatan"))}</strong> untuk
              kesehatan, dan{" "}
              <strong className="num">{formatRupiah(amountFor("alokasi_bunga_utang"))}</strong>{" "}
              untuk membayar bunga utang negara.
            </>
          ) : (
            <>
              dengan penghasilan ini kamu belum kena PPh 21, tapi tetap membayar PPN setiap kali
              berbelanja.
            </>
          )}
        </p>

        <div>
          <h3 className="font-semibold">Ke mana pajakmu (dibagi sesuai porsi APBN 2026)</h3>
          <div className="mt-4">
            <BarList
              rows={allocation}
              caption="Pembagian pajakmu menurut porsi belanja APBN 2026"
            />
          </div>
        </div>

        <details className="rounded-xl border border-border p-4 text-sm text-muted">
          <summary className="cursor-pointer font-semibold text-text">
            Penyederhanaan yang kami pakai
          </summary>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>
              PPh 21 dihitung setahun untuk pegawai tetap dengan satu pemberi kerja: penghasilan
              bruto dikurangi biaya jabatan dan PTKP, lalu dikenai tarif progresif. Iuran pensiun
              dan pengurang lain tidak dihitung.
            </li>
            <li>
              PPN dihitung dari porsi belanja yang kamu pilih, dengan tarif efektif{" "}
              {formatPercent(data.tax.ppn.effectiveRate * 100, 0)} yang sudah termasuk dalam harga.
            </li>
            <li>
              Pajak masuk ke kas negara bersama-sama, jadi tidak ada rupiah yang
              &ldquo;ditandai&rdquo; untuk pos tertentu. Pembagian di atas mengikuti porsi belanja
              APBN 2026 sebagai ilustrasi.
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}
