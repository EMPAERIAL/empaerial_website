"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  buildSearchIndex,
  groupResults,
  searchDocuments,
} from "@/Lib/searchIndex";
import styles from "./SearchOverlay.module.css";

/*
 * Site-wide search.
 *
 * Opens on Ctrl/Cmd+K or from the header trigger, renders through a portal on
 * document.body (so the blur backdrop sits over the whole page rather than
 * inside the nav's stacking context), and hands the chosen result a ?q= so the
 * destination page can highlight the term — see SearchHighlight.
 */

function Highlighted({ snippet }) {
  if (!snippet) return null;
  if (!snippet.match) return <>{snippet.before}</>;

  return (
    <>
      {snippet.before}
      <mark className={styles.mark}>{snippet.match}</mark>
      {snippet.after}
    </>
  );
}

export default function SearchOverlay({ open, onClose, t, lang }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [docs, setDocs] = useState(null);
  const [state, setState] = useState("idle"); // idle | loading | ready | error

  const copy = useMemo(() => {
    const s = t?.search || {};
    return {
      label: s.label || "Search",
      placeholder: s.placeholder || "Search the site…",
      hint: s.hint || "Search projects, specs, journal entries and the team.",
      loading: s.loading || "Building index…",
      error:
        s.error || "Search is unavailable right now. Please try again shortly.",
      empty: s.empty || "No matches.",
      emptyFor: s.empty_for || "No matches for",
      resultsCount: s.results_count || "results",
      resultCount: s.result_count || "result",
      close: s.close || "Close search",
      navigate: s.navigate || "to navigate",
      select: s.select || "to open",
      dismiss: s.dismiss || "to dismiss",
    };
  }, [t]);

  /*
   * The index is assembled the first time the overlay opens and rebuilt when
   * the language changes (labels and section names come from the dictionary).
   * Nothing about it touches first paint.
   *
   * The guard is a ref rather than component state on purpose: deriving it
   * from `state` would put `state` in the dependency list, so setting it to
   * "loading" would re-run the effect and its cleanup would cancel the very
   * fetch it just started.
   */
  const builtForRef = useRef(null);

  useEffect(() => {
    if (!open || builtForRef.current === lang) return undefined;

    let cancelled = false;
    setDocs(null);
    setState("loading");

    (async () => {
      try {
        const [projects, blogs, teams] = await Promise.all(
          ["projects", "blogs", "teams"].map(async (resource) => {
            const res = await fetch(`/api/${resource}`, { cache: "no-store" });
            if (!res.ok) throw new Error(`${resource}: ${res.status}`);
            const data = await res.json();
            return Array.isArray(data) ? data : (data?.[resource] ?? []);
          })
        );

        if (cancelled) return;
        builtForRef.current = lang;
        setDocs(buildSearchIndex({ projects, blogs, teams, t }));
        setState("ready");
      } catch {
        if (cancelled) return;
        // Static page copy still searches without the API, so fall back to it
        // rather than showing nothing at all.
        builtForRef.current = lang;
        setDocs(buildSearchIndex({ projects: [], blogs: [], teams: [], t }));
        setState("error");
      }
    })();

    // Closing mid-flight leaves builtForRef unset, so the next open retries.
    return () => {
      cancelled = true;
    };
  }, [open, lang, t]);

  const results = useMemo(
    () => (docs ? searchDocuments(docs, query) : []),
    [docs, query]
  );
  const groups = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => groups.flatMap((group) => group.hits), [groups]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActive(0);
    // Focus after the panel has mounted so the caret lands in the field.
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const go = useCallback(
    (hit) => {
      if (!hit) return;
      const separator = hit.url.includes("?") ? "&" : "?";
      const [path, hash] = hit.url.split("#");
      const target = `${path}${separator}q=${encodeURIComponent(query)}${hash ? `#${hash}` : ""}`;
      onClose();
      router.push(target);
    },
    [onClose, query, router]
  );

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!flat.length) return;
        setActive((current) => {
          const next = event.key === "ArrowDown" ? current + 1 : current - 1;
          return (next + flat.length) % flat.length;
        });
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        go(flat[active]);
      }
    },
    [active, flat, go, onClose]
  );

  // Keep the highlighted row inside the scroll viewport during arrow paging.
  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current
      .querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  if (!open || typeof document === "undefined") return null;

  const showEmpty =
    state !== "loading" && query.trim().length >= 2 && flat.length === 0;
  let cursor = -1;

  return createPortal(
    <div className={styles.root} role="presentation" onMouseDown={onClose}>
      <div className={styles.backdrop} aria-hidden="true" />

      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={copy.label}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.field}>
          <svg
            className={styles.fieldIcon}
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <circle
              cx="9"
              cy="9"
              r="6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M13.5 13.5 L17.5 17.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>

          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={query}
            placeholder={copy.placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            aria-label={copy.label}
            aria-controls="search-results"
            autoComplete="off"
            spellCheck="false"
          />

          <button
            type="button"
            className={styles.escape}
            onClick={onClose}
            aria-label={copy.close}
          >
            ESC
          </button>
        </div>

        <div
          className={styles.results}
          id="search-results"
          ref={listRef}
          role="listbox"
          aria-label={copy.label}
        >
          {state === "loading" && <p className={styles.note}>{copy.loading}</p>}

          {state === "error" && <p className={styles.note}>{copy.error}</p>}

          {state !== "loading" && query.trim().length < 2 && (
            <p className={styles.note}>{copy.hint}</p>
          )}

          {showEmpty && (
            <p className={styles.note}>
              {copy.emptyFor}{" "}
              <span className={styles.noteTerm}>“{query.trim()}”</span>
            </p>
          )}

          {groups.map((group) => (
            <section key={group.pageUrl} className={styles.group}>
              <header className={styles.groupHead}>
                <span className={styles.groupKind}>{group.kind}</span>
                <span className={styles.groupPage}>{group.page}</span>
              </header>

              {group.hits.map((hit) => {
                cursor += 1;
                const index = cursor;

                return (
                  <button
                    key={hit.id}
                    type="button"
                    data-index={index}
                    role="option"
                    aria-selected={index === active}
                    className={`${styles.hit} ${index === active ? styles.hitActive : ""}`}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(hit)}
                  >
                    <span className={styles.hitMeta}>
                      {hit.section && (
                        <span className={styles.hitSection}>{hit.section}</span>
                      )}
                      {hit.label && (
                        <span className={styles.hitLabel}>
                          <Highlighted snippet={hit.labelSnippet} />
                        </span>
                      )}
                    </span>
                    <span className={styles.hitBody}>
                      <Highlighted snippet={hit.snippet} />
                    </span>
                  </button>
                );
              })}
            </section>
          ))}
        </div>

        <footer className={styles.foot}>
          <span>
            <kbd className={styles.kbd}>↑</kbd>
            <kbd className={styles.kbd}>↓</kbd> {copy.navigate}
          </span>
          <span>
            <kbd className={styles.kbd}>↵</kbd> {copy.select}
          </span>
          <span>
            <kbd className={styles.kbd}>esc</kbd> {copy.dismiss}
          </span>
          {flat.length > 0 && (
            <span className={styles.count}>
              {flat.length}{" "}
              {flat.length === 1 ? copy.resultCount : copy.resultsCount}
            </span>
          )}
        </footer>
      </div>
    </div>,
    document.body
  );
}
