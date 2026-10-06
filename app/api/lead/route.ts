import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  session_id: z.string().min(8),
  quiz_version: z.string(),
  lead_name: z.string().min(1),
  lead_whatsapp: z.string().min(10),
  event: z.enum(["lead_capture_complete", "cta_click"]),
}).passthrough();

async function postWithRetry(url: string, body: unknown, attempts = 3): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (res.ok) return true;
      console.warn(`[lead webhook] tentativa ${i + 1} respondeu ${res.status}`);
    } catch (err) {
      console.warn(`[lead webhook] tentativa ${i + 1} falhou`, err);
    }
    await new Promise((r) => setTimeout(r, 400 * 2 ** i));
  }
  return false;
}

/** Adapter genérico de webhook. Sem QUIZ_WEBHOOK_URL, registra no log e responde ok (modo local). */
export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "json_invalido" }, { status: 400 }); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "payload_invalido" }, { status: 400 });
  const url = process.env.QUIZ_WEBHOOK_URL;
  if (!url) {
    const p = parsed.data;
    console.info(`[lead webhook · modo local] ${p.event} · ${p.session_id} · ${p.lead_name} · strain=${String(p.main_strain_axis)} · readiness=${String(p.commercial_classification)}`);
    return NextResponse.json({ ok: true, delivered: false, mode: "local" });
  }
  const delivered = await postWithRetry(url, parsed.data);
  return NextResponse.json({ ok: true, delivered });
}
