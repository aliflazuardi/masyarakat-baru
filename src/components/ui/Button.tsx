import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
};

const base =
  "inline-flex min-h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors";

const variants = {
  primary: "bg-gold text-bg hover:bg-gold/85",
  ghost: "border border-border text-text hover:bg-surface-strong",
};

export function ButtonLink({ href, children, variant = "primary" }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]}`}>
      {children}
    </Link>
  );
}
