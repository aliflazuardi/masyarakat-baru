import type { Accent } from "@/lib/site";

// Full class names (not string-built) so Tailwind can detect them.
export const accentBg: Record<Accent, string> = {
  teal: "bg-teal",
  gold: "bg-gold",
  pink: "bg-pink",
};

export const accentText: Record<Accent, string> = {
  teal: "text-teal",
  gold: "text-gold",
  pink: "text-pink",
};
