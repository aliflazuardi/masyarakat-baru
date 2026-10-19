import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Affiliations } from "@/components/profile/Affiliations";
import { Card } from "@/components/ui/Card";
import { getProfile, getScenarios } from "@/lib/content";
import { DISCLAIMER } from "@/lib/site";

const title = "Tentang";
const description =
  "Tentang prototipe Masyarakat Baru: tujuan, sumber data, privasi, dan pembuatnya.";

export const metadata: Metadata = { title, description, openGraph: { title, description } };

export default function AboutPage() {
  const profile = getProfile();
  const scenarios = getScenarios();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Tentang prototipe ini</h1>
      <p className="mt-3 text-lg text-muted">
        Masyarakat Baru adalah prototipe konsep &ldquo;Malaka Interactive Suite&rdquo;: tiga alat
        web ringan yang memperluas seri-seri Malaka Project menjadi pengalaman interaktif.
      </p>

      <Card className="mt-6" accent="gold">
        <p className="text-sm italic" data-testid="about-disclaimer">
          {DISCLAIMER}
        </p>
      </Card>

      <Block title="Kenapa dibuat">
        <p>
          Video dan podcast Malaka sudah menjangkau jutaan orang. Prototipe ini menunjukkan langkah
          berikutnya: memberi penonton tempat untuk berlatih, yaitu menghitung dampak kebijakan,
          menguji argumen, dan merasakan pilihan sulit yang dihadapi warga. Semua alat di sini sudah
          berfungsi dan bisa dicoba.
        </p>
      </Block>

      <Block title="Sumber data">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <Link
              href="/bahasa-bayi/#metodologi"
              className="text-teal underline-offset-4 hover:underline"
            >
              Kalkulator Bahasa Bayi
            </Link>
            : APBN 2026, BPS, dan aturan pajak. Setiap angka punya sumber dan jenisnya (resmi,
            turunan, atau perkiraan) di bagian &ldquo;Bagaimana kami menghitung?&rdquo;. Ini
            simulasi edukatif, bukan proyeksi resmi.
          </li>
          <li>
            <Link
              href="/kamus-sesat-pikir/"
              className="text-gold underline-offset-4 hover:underline"
            >
              Kamus
            </Link>{" "}
            dan{" "}
            <Link
              href="/kuis-sesat-pikir/"
              className="text-gold underline-offset-4 hover:underline"
            >
              Kuis Sesat Pikir
            </Link>
            : ditulis oleh pembuat prototipe. Contoh-contohnya sengaja umum dan tidak menyebut tokoh
            atau partai sungguhan.
          </li>
          <li>
            <Link href="/simulator/" className="text-pink underline-offset-4 hover:underline">
              Simulator
            </Link>
            : skenario terinspirasi liputan media dan organisasi lingkungan. Tokohnya fiktif, dan
            peluang hasil adalah perkiraan ilustratif. Sumber liputan:
            <ul className="mt-2 list-[circle] space-y-1 pl-5">
              {scenarios
                .flatMap((s) => s.realStory)
                .filter((r, i, all) => all.findIndex((x) => x.url === r.url) === i)
                .map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      {r.title}
                    </a>{" "}
                    <span className="text-muted">· {r.publisher}</span>
                  </li>
                ))}
            </ul>
          </li>
        </ul>
      </Block>

      <Block title="Privasi">
        <p>
          Tidak ada akun, tidak ada cookie, dan tidak ada data pribadi yang dikirim ke server.
          Streak kuis dan progres simulasi disimpan di peramban kamu sendiri. Analitik (jika aktif)
          hanya menghitung jumlah, misalnya berapa kuis yang selesai.
        </p>
      </Block>

      <Block title="Dibuat dengan">
        <p>
          Next.js dan React (diekspor statis), TypeScript, dan Tailwind CSS. Kodenya terbuka di{" "}
          <a
            href="https://github.com/aliflazuardi/masyarakat-baru"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub
          </a>
          .
        </p>
      </Block>

      <Block title="Pembuat">
        <p className="font-semibold">{profile.name}</p>
        <p className="text-sm text-muted">{profile.role}</p>
        <p className="mt-2">{profile.bio}</p>
        <Affiliations items={profile.affiliations} />
        <p className="mt-3">
          <a
            href={`mailto:${profile.email}`}
            className="text-gold underline-offset-4 hover:underline"
          >
            {profile.email}
          </a>
          {" · "}
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            GitHub
          </a>
          {profile.linkedin && (
            <>
              {" · "}
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                LinkedIn
              </a>
            </>
          )}
        </p>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">{title}</h2>
      <div className="mt-3 leading-relaxed">{children}</div>
    </section>
  );
}
