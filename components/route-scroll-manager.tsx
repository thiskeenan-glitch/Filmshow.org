"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

function scrollToHashTarget(hash: string) {
  const id = hash.replace(/^#/, "");
  if (!id) return;

  const target = document.getElementById(id);
  if (!target) return;

  target.scrollIntoView({ behavior: "auto", block: "start" });
}

export function RouteScrollManager() {
  const pathname = usePathname();

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      const previous = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";

      return () => {
        window.history.scrollRestoration = previous;
      };
    }
  }, []);

  useEffect(() => {
    const hash = window.location.hash;

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });

    if (!hash || hash === "#top") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollToHashTarget(hash);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
