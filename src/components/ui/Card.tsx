import type { ReactNode } from "react";
import type { Accent } from "@/lib/site";
import { accentBg } from "./accent";

type CardProps = {
  children: ReactNode;
  accent?: Accent;
  className?: string;
};

/** Frosted-glass card with an optional accent bar on top. */
export function Card({ children, accent, className = "" }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-surface p-5 backdrop-blur ${className}`}
    >
      {accent && (
        <span aria-hidden className={`absolute inset-x-0 top-0 h-[3px] ${accentBg[accent]}`} />
      )}
      {children}
    </div>
  );
}
