import Image from "next/image";
import type { Profile } from "@/content/schema";

// next/image does not prefix basePath for public/ paths (GitHub Pages serves from a sub-path).
const basePath = process.env.BASE_PATH ?? "";

/** Work and education rows with organisation logos, for the builder profile. */
export function Affiliations({ items }: { items: Profile["affiliations"] }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((a) => (
        <li key={`${a.kind}-${a.org}`} className="flex items-center gap-3">
          {/* White tile so full-colour logos stay legible on the dark theme. */}
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
            <Image src={`${basePath}${a.logo}`} alt={`Logo ${a.org}`} width={32} height={32} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{a.title}</span>
            <span className="block text-sm text-muted">
              {a.org} · {a.period}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
