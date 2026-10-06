import type { UtmData } from "@/types";

export function captureUtm(): UtmData {
  if (typeof window === "undefined") return emptyUtm();
  const p = new URLSearchParams(window.location.search);
  const g = (k: string) => p.get(k) || null;
  return {
    utm_source: g("utm_source"), utm_medium: g("utm_medium"), utm_campaign: g("utm_campaign"),
    utm_content: g("utm_content"), utm_term: g("utm_term"),
    source_channel: g("source_channel") || g("src"),
    referrer: document.referrer || null,
    landing_path: window.location.pathname + window.location.search,
  };
}

export function emptyUtm(): UtmData {
  return { utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null, source_channel: null, referrer: null, landing_path: null };
}

/** Mantém o que já foi capturado; só preenche campos ainda vazios. */
export function mergeUtm(prev: UtmData, next: UtmData): UtmData {
  const out = { ...prev };
  for (const k of Object.keys(next) as (keyof UtmData)[]) if (!out[k] && next[k]) out[k] = next[k];
  return out;
}
