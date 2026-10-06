/**
 * Abstração de analytics. Nunca envia respostas brutas sensíveis para terceiros:
 * apenas IDs de tela, categorias e scores agregados.
 */
type Payload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

const SAFE_KEYS = new Set([
  "screen", "question_id", "segment", "insight_id", "variant", "dominant_profile", "main_strain_axis", "index_band",
  "commercial_classification", "safety", "has_email", "cta", "quiz_version", "session_id", "attempts_count", "resumed",
]);

export function trackEvent(name: string, payload: Payload = {}) {
  if (typeof window === "undefined") return;
  const safe: Payload = {};
  for (const [k, v] of Object.entries(payload)) if (SAFE_KEYS.has(k) && v !== undefined) safe[k] = v;
  try {
    (window.dataLayer = window.dataLayer || []).push({ event: name, ...safe });
    if (window.gtag && process.env.NEXT_PUBLIC_GA_ID) window.gtag("event", name, safe);
    if (window.fbq && process.env.NEXT_PUBLIC_META_PIXEL_ID) window.fbq("trackCustom", name, safe);
  } catch { /* analytics nunca quebra a experiência */ }
  if (process.env.NODE_ENV === "development") console.debug("[track]", name, safe);
}
