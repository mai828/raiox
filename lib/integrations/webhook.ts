import type { CRMLeadPayload } from "@/types";

/** Envia o payload para a rota interna, que repassa ao webhook configurado. Nunca lança. */
export async function sendLeadPayload(payload: CRMLeadPayload): Promise<{ ok: boolean; delivered: boolean }> {
  try {
    const res = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
    if (!res.ok) return { ok: false, delivered: false };
    return (await res.json()) as { ok: boolean; delivered: boolean };
  } catch {
    return { ok: false, delivered: false };
  }
}
