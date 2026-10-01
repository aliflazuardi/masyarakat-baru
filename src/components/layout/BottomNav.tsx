import Link from "next/link";
import { TOOLS } from "@/lib/site";
import { accentBg } from "@/components/ui/accent";

/** Mobile tab bar: most of the audience is on phones. */
export function BottomNav() {
  return (
    <nav
      aria-label="Navigasi alat"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-bg/90 backdrop-blur sm:hidden"
    >
      <ul className="grid grid-cols-4">
        {TOOLS.map((tool) => (
          <li key={tool.href}>
            <Link
              href={tool.href}
              className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted"
            >
              <span aria-hidden className={`size-2 rounded-full ${accentBg[tool.accent]}`} />
              {tool.label}
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/tentang/"
            className="flex min-h-14 flex-col items-center justify-center gap-1 text-xs text-muted"
          >
            <span aria-hidden className="size-2 rounded-full bg-muted" />
            Tentang
          </Link>
        </li>
      </ul>
    </nav>
  );
}
