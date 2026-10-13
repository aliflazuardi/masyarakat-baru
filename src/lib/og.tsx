// Shared Open Graph image (1200×630) rendered at build time with next/og.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

const ACCENTS = { gold: "#e8c547", teal: "#7fd3dc", pink: "#d26fa6" } as const;
export type OgAccent = keyof typeof ACCENTS;

const fontDir = join(process.cwd(), "node_modules/@fontsource/plus-jakarta-sans/files");

export async function renderOg(opts: {
  eyebrow: string;
  title: string;
  subtitle: string;
  accent: OgAccent;
}) {
  const [regular, bold] = await Promise.all([
    readFile(join(fontDir, "plus-jakarta-sans-latin-400-normal.woff")),
    readFile(join(fontDir, "plus-jakarta-sans-latin-700-normal.woff")),
  ]);
  const accent = ACCENTS[opts.accent];
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: "#16191d",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        color: "#f2f3f5",
        fontFamily: "Jakarta",
        borderTop: `14px solid ${accent}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: accent,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          {opts.eyebrow}
        </div>
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            lineHeight: 1.05,
            marginTop: 24,
            letterSpacing: -2,
          }}
        >
          {opts.title}
        </div>
        <div
          style={{ fontSize: 36, color: "#a3a9b3", marginTop: 28, lineHeight: 1.3, maxWidth: 980 }}
        >
          {opts.subtitle}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
        }}
      >
        <div style={{ fontWeight: 700 }}>{SITE_NAME}</div>
        <div style={{ color: "#a3a9b3" }}>Prototipe proposal untuk Malaka Project</div>
      </div>
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: "Jakarta", data: regular, weight: 400, style: "normal" },
        { name: "Jakarta", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
