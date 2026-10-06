"use client";
import { useState } from "react";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/lib/integrations/whatsapp";

export default function SpecialistCTA({ name, strainLabel, onClick }: { name: string; strainLabel: string; onClick: () => void }) {
  const message = buildWhatsappMessage(name, strainLabel);
  const url = buildWhatsappUrl(message);
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(message); setCopied(true); } catch { setCopied(false); } };
  return (
    <section className="flex flex-col gap-8 rounded-3xl bg-surface-strong p-7 md:p-10">
      <div className="flex flex-col gap-3">
        <h2 className="balance font-serif text-[28px] font-medium leading-tight text-ink md:text-[34px]">Seu Raio-X mostra onde a relação parece perder força. Agora existe uma segunda pergunta.</h2>
        <p className="pretty font-serif text-[24px] italic leading-snug text-wine-dark md:text-[30px]">Por que essa dinâmica se formou exatamente assim no seu caso, e o que precisaria mudar para ela não continuar se repetindo?</p>
      </div>
      <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-soft">
        <p>O Raio-X consegue organizar sinais.</p>
        <p>Ele não consegue reconstruir sozinho toda a história que produziu essa dinâmica.</p>
        <p>Um especialista da equipe do Márcio pode olhar essa leitura com você, entender melhor seu momento e avaliar se o Compatíveis faz sentido para aprofundar esse trabalho.</p>
        <p className="text-ink">O Compatíveis é o processo individual para entender o que está por trás da dinâmica que você está vivendo, reorganizar o que precisa mudar e construir um caminho de ação para a vida real.</p>
      </div>
      <div className="flex flex-col gap-3">
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full sm:w-auto" onClick={onClick} data-testid="cta-whatsapp">Quero conversar sobre o meu Raio-X</a>
        ) : (
          <div className="card flex flex-col gap-3 !bg-surface" data-testid="cta-fallback">
            <p className="text-[14px] font-semibold text-wine-dark">WhatsApp ainda não configurado (NEXT_PUBLIC_WHATSAPP_NUMBER).</p>
            <p className="whitespace-pre-line text-[15px] text-ink-soft">{message}</p>
            <div><button type="button" className="btn-primary" onClick={() => { onClick(); copy(); }}>{copied ? "Mensagem copiada" : "Copiar mensagem"}</button></div>
          </div>
        )}
        <p className="text-[13px] text-muted">A conversa é com uma pessoa da equipe. Não há checkout nem compromisso nesta etapa.</p>
      </div>
    </section>
  );
}
