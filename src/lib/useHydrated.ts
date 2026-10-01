import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};

/**
 * False during static prerender and the first hydration pass, true afterwards.
 * Use it to gate UI that depends on the client clock or localStorage.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
