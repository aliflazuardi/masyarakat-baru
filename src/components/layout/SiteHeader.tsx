import Link from "next/link";
import { SECONDARY_NAV, SITE_NAME, TOOLS } from "@/lib/site";
import { accentBg } from "@/components/ui/accent";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-bold tracking-tight">
          {SITE_NAME}
        </Link>
        {/* Desktop nav; mobile uses the bottom tab bar. */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-6 text-sm sm:flex">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2 text-muted hover:text-text"
            >
              <span aria-hidden className={`size-2 rounded-full ${accentBg[tool.accent]}`} />
              {tool.label}
            </Link>
          ))}
          {SECONDARY_NAV.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted hover:text-text">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
