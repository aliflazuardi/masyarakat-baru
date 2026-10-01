// Typed analytics events that mirror the KPIs in BUILD_PLAN.md §10.
// Sends to a cookieless provider (Umami) when its script is loaded; otherwise a no-op.

export type AnalyticsEvent =
  | { name: "quiz_completed"; props: { score: number; streak: number } }
  | { name: "scenario_completed"; props: { slug: string; ending: string } }
  | { name: "action_link_clicked"; props: { slug: string; org: string } }
  | { name: "calculator_shared"; props: { tab: string } }
  | { name: "kamus_card_opened"; props: { slug: string } };

type Umami = { track: (name: string, data?: Record<string, unknown>) => void };

type Target = { umami?: Umami } | undefined;

function defaultTarget(): Target {
  return typeof window === "undefined" ? undefined : (window as unknown as { umami?: Umami });
}

/** Records an event. Never throws: analytics must not break the experience. */
export function track(event: AnalyticsEvent, target: Target = defaultTarget()): void {
  try {
    target?.umami?.track(event.name, event.props);
  } catch {
    // ignore provider errors
  }
}
