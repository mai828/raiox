"use client";
export default function SafetyScreen({ onViewSummary, showSummaryButton }: { onViewSummary: () => void; showSummaryButton: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      <p className="eyebrow">Antes de qualquer leitura</p>
      <h1 className="balance font-serif text-[30px] font-medium leading-tight text-ink md:text-[38px]">Sua segurança vem antes de qualquer leitura sobre dinâmica de relacionamento.</h1>
      <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-soft">
        <p>Este Raio-X não é adequado para avaliar situações de violência, ameaça ou risco.</p>
        <p>Procure apoio de alguém de confiança e de serviços ou profissionais preparados para lidar com segurança e violência.</p>
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="card !p-5"><dt className="text-[13px] uppercase tracking-wider text-muted">Emergência</dt><dd className="mt-1 font-sans text-[28px] font-semibold tabular-nums text-ink">190</dd></div>
        <div className="card !p-5"><dt className="text-[13px] uppercase tracking-wider text-muted">Central de Atendimento à Mulher</dt><dd className="mt-1 font-sans text-[28px] font-semibold tabular-nums text-ink">180</dd></div>
      </dl>
      {showSummaryButton ? (
        <div><button type="button" className="btn-ghost -ml-5" onClick={onViewSummary} data-testid="view-summary">Ver um resumo do meu Raio-X mesmo assim</button></div>
      ) : null}
    </div>
  );
}
