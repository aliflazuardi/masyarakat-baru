import { DISCLAIMER, SITE_NAME } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border pb-20 sm:pb-0">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted">
        <p data-testid="disclaimer" className="italic">
          {DISCLAIMER}
        </p>
        <p className="mt-2">© {SITE_NAME}</p>
      </div>
    </footer>
  );
}
