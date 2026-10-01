// Site-wide constants shared by navigation, metadata and the landing page.

export const SITE_NAME = "Masyarakat Baru";
export const SITE_TAGLINE = "Dari penonton menjadi warga.";
export const SITE_DESCRIPTION =
  "Prototipe konsep Malaka Interactive Suite: kalkulator kebijakan Bahasa Bayi, kuis sesat pikir harian, dan simulator dampak isu sosial.";

export const DISCLAIMER =
  "Prototipe konsep independen untuk diajukan kepada Malaka Project. Tidak berafiliasi dengan, atau didukung oleh, Malaka Project.";

export type Accent = "teal" | "gold" | "pink";

export type Tool = {
  href: string;
  /** Short label for navigation. */
  label: string;
  title: string;
  tagline: string;
  /** The Malaka series this tool extends. */
  series: string;
  accent: Accent;
};

export const TOOLS: readonly Tool[] = [
  {
    href: "/bahasa-bayi/",
    label: "Kalkulator",
    title: "Kalkulator Bahasa Bayi",
    tagline: "Membuat makroekonomi jadi mikro-personal.",
    series: "Bahasa Bayi / Danantara",
    accent: "teal",
  },
  {
    href: "/kuis-sesat-pikir/",
    label: "Kuis",
    title: "Kuis Sesat Pikir",
    tagline: "30 detik sehari untuk berpikir lebih jernih.",
    series: "The Court / Sabda PS",
    accent: "gold",
  },
  {
    href: "/simulator/",
    label: "Simulator",
    title: "Simulator Dampak Sosial",
    tagline: "Dari kisah yang didengar, menjadi pengalaman yang dirasakan.",
    series: "Dokumenter Investigasi",
    accent: "pink",
  },
];

export const SECONDARY_NAV = [
  { href: "/kamus-sesat-pikir/", label: "Kamus" },
  { href: "/tentang/", label: "Tentang" },
] as const;
