import type { Metadata } from "next";
import Link from "next/link";
import { DailyQuiz, type OptionLabels } from "@/components/quiz/DailyQuiz";
import { getFallacies, getQuizPool } from "@/lib/content";

const title = "Kuis Sesat Pikir";
const description =
  "30 detik sehari untuk berpikir lebih jernih. Tebak sesat pikir dalam 3 pernyataan hari ini.";

export const metadata: Metadata = { title, description, openGraph: { title, description } };

export default function QuizPage() {
  const labels: OptionLabels = Object.fromEntries(
    getFallacies().map((f) => [f.slug, { nameId: f.nameId, nameEn: f.nameEn }]),
  );
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">
        The Court · Sabda PS
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-muted">
        30 detik sehari untuk berpikir lebih jernih. Soal baru setiap tengah malam WIB.
      </p>
      <div className="mt-6">
        <DailyQuiz pool={getQuizPool()} labels={labels} />
      </div>
      <p className="mt-6 text-sm text-muted">
        Belum hafal istilahnya?{" "}
        <Link href="/kamus-sesat-pikir/" className="text-gold underline-offset-4 hover:underline">
          Buka Kamus Sesat Pikir
        </Link>
      </p>
    </div>
  );
}
