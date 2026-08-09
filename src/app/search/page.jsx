"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { useLanguage } from "@/components/LanguageProvider";
import {
  buildSearchIndex,
  groupResults,
  searchDocuments,
} from "@/Lib/searchIndex";
import styles from "./SearchPage.module.css";

/*
 * Standalone results page. The overlay in the header is the primary way in;
 * this exists so a search is a shareable URL (/search?q=…) and so the route
 * listed in the sitemap resolves to a real page.
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

function SearchPageBody() {
  const { lang, setLang, t } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") || "";

  const [query, setQuery] = useState(initial);
  const [docs, setDocs] = useState(null);
  const [state, setState] = useState("loading");

  const copy = t?.search || {};

  useEffect(() => {
    setQuery(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;
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
        setDocs(buildSearchIndex({ projects, blogs, teams, t }));
        setState("ready");
      } catch {
        if (cancelled) return;
        setDocs(buildSearchIndex({ projects: [], blogs: [], teams: [], t }));
        setState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const results = useMemo(
    () => (docs ? searchDocuments(docs, query, 80) : []),
    [docs, query]
  );
  const groups = useMemo(() => groupResults(results), [results]);

  const onSubmit = (event) => {
    event.preventDefault();
    router.replace(
      query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"
    );
  };

  const hitUrl = (hit) => {
    const [path, hash] = hit.url.split("#");
    return `${path}?q=${encodeURIComponent(query.trim())}${hash ? `#${hash}` : ""}`;
  };

  return (
    <>
      <header role="banner">
        <Header t={t} lang={lang} setLang={setLang} />
      </header>

      <main role="main" className={styles.pageMain}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>{copy.label || "Search"}</p>
          <h1 className={styles.title}>{copy.page_title || "Search"}</h1>

          <form className={styles.form} onSubmit={onSubmit} role="search">
            <input
              className={styles.input}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.placeholder || "Search the site…"}
              aria-label={copy.label || "Search"}
              autoComplete="off"
            />
            <button type="submit" className={styles.submit}>
              {copy.submit || "Search"} →
            </button>
          </form>

          {state === "loading" && (
            <p className={styles.note}>{copy.loading || "Building index…"}</p>
          )}

          {state === "error" && (
            <p className={styles.note}>
              {copy.error ||
                "Search is unavailable right now. Please try again shortly."}
            </p>
          )}

          {state !== "loading" && query.trim().length >= 2 && (
            <p className={styles.count}>
              {results.length}{" "}
              {results.length === 1
                ? copy.result_count || "result"
                : copy.results_count || "results"}
            </p>
          )}

          {state !== "loading" &&
            query.trim().length >= 2 &&
            results.length === 0 && (
              <p className={styles.note}>
                {copy.empty_for || "No matches for"}{" "}
                <span className={styles.noteTerm}>“{query.trim()}”</span>
              </p>
            )}

          {query.trim().length < 2 && state !== "loading" && (
            <p className={styles.note}>
              {copy.hint ||
                "Search projects, specs, journal entries and the team."}
            </p>
          )}

          <div className={styles.groups}>
            {groups.map((group) => (
              <section key={group.pageUrl} className={styles.group}>
                <header className={styles.groupHead}>
                  <span className={styles.groupKind}>{group.kind}</span>
                  <span className={styles.groupPage}>{group.page}</span>
                </header>

                {group.hits.map((hit) => (
                  <Link key={hit.id} href={hitUrl(hit)} className={styles.hit}>
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
                  </Link>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>

      <Footer t={t} />
    </>
  );
}

export default function SearchPage() {
  // useSearchParams needs a Suspense boundary to keep the route prerenderable.
  return (
    <Suspense fallback={null}>
      <SearchPageBody />
    </Suspense>
  );
}
