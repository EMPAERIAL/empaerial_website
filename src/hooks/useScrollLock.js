"use client";

import { useEffect } from "react";

/*
 * Locks background scrolling while an overlay is open.
 *
 * `body { overflow: hidden }` alone does not hold on iOS Safari — the page
 * behind keeps scrolling and rubber-banding under the overlay. Pinning the body
 * with `position: fixed` at a negative top offset is the technique that
 * actually works there; the offset is restored on release so the reader lands
 * back where they were rather than at the top of the page.
 */
export default function useScrollLock(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const { body } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };

    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      Object.assign(body.style, previous);
      // Jumping straight back avoids an animated scroll fighting the restore.
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [locked]);
}
