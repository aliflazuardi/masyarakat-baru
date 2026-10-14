"use client";

import { useEffect } from "react";

/** Opens the <details> with this id when the URL hash points at it (e.g. /bahasa-bayi/#metodologi). */
export function OpenOnHash({ id }: { id: string }) {
  useEffect(() => {
    function sync() {
      if (window.location.hash !== `#${id}`) return;
      const el = document.getElementById(id);
      if (el instanceof HTMLDetailsElement) {
        el.open = true;
        el.scrollIntoView({ block: "start" });
      }
    }
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [id]);
  return null;
}
