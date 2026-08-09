"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";

const DICTIONARIES = { en, tr };
export const SUPPORTED_LANGUAGES = Object.keys(DICTIONARIES);

const STORAGE_KEY = "empaerial:lang";

/*
 * The default is a real value rather than null so consumers infer the
 * dictionary shape (a null default narrows `t` to `never` in the TS pages) and
 * so a component rendered outside the provider degrades to English instead of
 * throwing.
 */
const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: en,
});

function isSupported(value) {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(DICTIONARIES, value)
  );
}

/*
 * Applying the stored preference in a layout effect means it lands before the
 * browser paints, so a Turkish visitor never sees a frame of English on each
 * navigation. useLayoutEffect would warn during SSR, hence the swap.
 */
const useApplyPreference =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Holds the active language for the whole app.
 *
 * Every page used to keep its own `useState("en")`, so picking Turkish on the
 * home page and clicking through to /blogs silently dropped you back to
 * English. Keeping it here means one source of truth, a choice that survives
 * navigation and reloads, and an <html lang> that follows the content.
 */
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState("en");

  // Resolve the stored preference (or the browser's) after mount: the server
  // render has no access to either, so starting anywhere else would hydrate
  // mismatched markup.
  useApplyPreference(() => {
    let stored = null;
    try {
      stored = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // Private mode or blocked storage — fall through to the browser locale.
    }

    if (isSupported(stored)) {
      setLangState(stored);
      return;
    }

    setLangState(
      navigator.language?.toLowerCase().startsWith("tr") ? "tr" : "en"
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!isSupported(next)) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // A preference we cannot persist is still valid for this session.
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: DICTIONARIES[lang] ?? en }),
    [lang, setLang]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
