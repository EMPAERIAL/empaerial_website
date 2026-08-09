"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeForSearch } from "@/Lib/searchIndex";

const HIGHLIGHT_NAME = "empaerial-search";

/*
 * Highlights the term a visitor arrived with (?q=…) on the destination page and
 * scrolls the first occurrence into view.
 *
 * This uses the CSS Custom Highlight API rather than wrapping matches in <mark>
 * elements: injecting nodes into a React-rendered tree fights reconciliation
 * and breaks on the next re-render. Highlight ranges live beside the DOM, so
 * they are invisible to React. Where the API is missing the page still scrolls
 * to the anchor — it just does not tint the term.
 */

function isSupported() {
  return (
    typeof window !== "undefined" &&
    typeof window.CSS !== "undefined" &&
    typeof window.Highlight === "function" &&
    window.CSS.highlights
  );
}

const STYLE_ID = "empaerial-search-highlight-style";

/*
 * ::highlight() has to be injected at runtime rather than living in
 * globals.css: the build's CSS parser rejects the pseudo-element outright.
 * Adding it only where the API exists costs nothing elsewhere.
 */
function ensureHighlightStyle() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `::highlight(${HIGHLIGHT_NAME}){background-color:#ffe27a;color:#000;}`;
  document.head.appendChild(style);
}

/** Fold a node's text the same way the index does, keeping source offsets. */
function foldWithOffsets(value) {
  let folded = "";
  const offsets = [];
  let pendingSpace = false;

  for (let i = 0; i < value.length; i += 1) {
    const char = value[i];

    if (/\s/.test(char)) {
      if (folded.length > 0) pendingSpace = true;
      continue;
    }

    if (pendingSpace) {
      folded += " ";
      offsets.push(i);
      pendingSpace = false;
    }

    for (const piece of normalizeForSearch(char)) {
      folded += piece;
      offsets.push(i);
    }
  }

  return { folded, offsets };
}

function Highlighter({ containerSelector }) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  useEffect(() => {
    if (!isSupported()) return undefined;

    ensureHighlightStyle();
    const needle = normalizeForSearch(query);

    const clear = () => {
      try {
        CSS.highlights.delete(HIGHLIGHT_NAME);
      } catch {
        // Nothing registered yet.
      }
    };

    if (needle.length < 2) {
      clear();
      return undefined;
    }

    // The content is client-fetched, so wait a beat for it to land before
    // walking the tree.
    const timer = window.setTimeout(() => {
      const container =
        document.querySelector(containerSelector) || document.body;
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
            const tag = node.parentElement?.tagName;
            if (tag === "SCRIPT" || tag === "STYLE")
              return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          },
        }
      );

      const ranges = [];

      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const { folded, offsets } = foldWithOffsets(node.nodeValue);

        let from = folded.indexOf(needle);
        while (from !== -1) {
          const range = document.createRange();
          range.setStart(node, offsets[from]);
          range.setEnd(node, offsets[from + needle.length - 1] + 1);
          ranges.push(range);
          from = folded.indexOf(needle, from + needle.length);
        }
      }

      if (!ranges.length) {
        clear();
        return;
      }

      CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));

      // Only take over the scroll position when the URL carries no anchor of
      // its own — an explicit #section wins.
      if (!window.location.hash) {
        ranges[0].startContainer.parentElement?.scrollIntoView({
          block: "center",
          behavior: "smooth",
        });
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      clear();
    };
  }, [containerSelector, query]);

  return null;
}

export default function SearchHighlight({ containerSelector = "main" }) {
  // useSearchParams needs a Suspense boundary or it opts the whole route out of
  // static rendering. Keeping it here means callers just drop the component in.
  return (
    <Suspense fallback={null}>
      <Highlighter containerSelector={containerSelector} />
    </Suspense>
  );
}
