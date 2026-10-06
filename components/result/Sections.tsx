"use client";
import { DIMENSION_LABELS } from "@/config/questions";
import { AXIS_TEXTS, PROFILE_DESCRIPTIONS, STRAIN_TEXTS } from "@/config/resultCopy";
import { PROFILE_LABELS, RESOURCE_LABELS, scoreBand } from "@/lib/scoring";
import CycleViz from "@/components/visualizations/CycleViz";
import type { DimensionKey, DimensionScores, ResultSummary } from "@/types";

const ORDER: DimensionKey[] = ["connection", "conversation", "partnership", "affection", "respect_future"];

export function SectionTitle({ eyebrow, title }: { eyebrow?: string; title: string }) {
  return (
    <header className="mb-5 flex flex-col gap-2">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h2 className="balance font-serif text-[28px] font-medium leading-tight text-ink md:text-[34px]">{title}</h2>
    </header>
  );
}

export function GeneralReading({ dims }: { dims: DimensionScores }) {
  return (
    <section aria-labelledby="leitura-geral">
      <SectionTitle title="Como a relação funciona hoje" />
      <ul className="flex flex-col divide-y divide-line">
        {ORDER.map((k) => {
          const v = dims[k];
          return (
            <li key={k} className="flex flex-col gap-1 py-4">
              <span className="text-[13px] font-semibold uppercase tracking-wider text-muted">{DIMENSION_LABELS[k]}</span>
              <p className="pretty text-[17px] leading-relaxed text-ink">{v === null ? "Não houve respostas suficientes para ler este eixo." : AXIS_TEXTS[k][scoreBand(v)]}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PreservedResources({ result }: { result: ResultSummary }) {
  const { resources, preservedAxis, dimensions } = result;
  const axisChips = preservedAxis.filter((a) => (dimensions[a] ?? 0) >= 50);
  return (
    <section>
      <SectionTitle title="O que ainda existe a favor de vocês" />
      <p className="pretty mb-5 text-[17px] leading-relaxed text-ink-soft">{resources.headline}</p>
      {resources.tags.length || axisChips.length ? (
        <ul className="flex flex-wrap gap-2.5">
          {resources.tags.map((t) => <li key={t} className="rounded-full border border-wine-soft bg-surface px-4 py-2 text-[14px] font-medium text-wine-dark">{RESOURCE_LABELS[t] ?? t}</li>)}
          {axisChips.map((a) => <li key={a} className="rounded-full border border-line bg-surface-strong px-4 py-2 text-[14px] font-medium text-ink-soft">{DIMENSION_LABELS[a]}: eixo mais preservado</li>)}
        </ul>
      ) : (
        <p className="text-[15px] text-muted">Pelas suas respostas, o eixo menos desgastado hoje é {DIMENSION_LABELS[preservedAxis[0] ?? "connection"].toLowerCase()}. É pouco, mas não é nada. É por aí que uma leitura mais profunda começaria a procurar apoio.</p>
      )}
    </section>
  );
}

export function MainStrainCard({ result }: { result: ResultSummary }) {
  const axes = result.strain.axes;
  return (
    <section className="card !border-wine-soft">
      <SectionTitle eyebrow="Onde a relação perde mais força" title="O ponto que mais pesa hoje" />
      {result.strain.tied ? <p className="mb-3 text-[15px] text-muted">Dois pontos estão muito próximos nas suas respostas. Em vez de forçar um vencedor, mostro os dois.</p> : null}
      <div className="flex flex-col gap-4">
        {axes.map((a) => (
          <div key={a}>
            <p className="font-serif text-[24px] font-medium text-wine-dark">{DIMENSION_LABELS[a]}</p>
            <p className="pretty mt-1 text-[17px] leading-relaxed text-ink">{STRAIN_TEXTS[a]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CycleSection({ result }: { result: ResultSummary }) {
  const { cycle } = result;
  return (
    <section>
      <SectionTitle title="O que parece acontecer quando essa área entra em tensão" />
      {cycle.kind && cycle.nodes.length ? (
        <>
          <CycleViz nodes={cycle.nodes} className="mx-auto w-full max-w-[460px]" />
          <ol className="mt-4 flex flex-wrap gap-x-2 gap-y-1 text-[15px] text-ink-soft" aria-label="Sequência em texto">
            {cycle.nodes.map((n, i) => <li key={i}>{n.label}{i < cycle.nodes.length - 1 ? <span aria-hidden className="mx-1 text-wine-soft">→</span> : null}</li>)}
          </ol>
          <p className="mt-3 text-[14px] text-muted">Montado apenas com o que apareceu nas suas respostas sobre conflito, afastamento e divisão de responsabilidades.</p>
        </>
      ) : (
        <p className="pretty text-[17px] leading-relaxed text-ink-soft">Não apareceu uma sequência única e consistente nas suas respostas. Isso é melhor do que forçar uma: significa que a repetição, se existe, não está concentrada em um só movimento, e precisaria ser investigada caso a caso.</p>
      )}
    </section>
  );
}

export function HypothesisCard({ result }: { result: ResultSummary }) {
  return (
    <section className="rounded-3xl bg-ink p-7 text-surface md:p-10">
      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-wine-soft">Minha hipótese a partir das suas respostas</p>
      <div className="mt-5 flex flex-col gap-4 font-serif text-[21px] leading-snug md:text-[24px]">
        {result.hypothesis.map((p, i) => <p key={i} className={`pretty ${i === result.hypothesis.length - 1 ? "text-[16px] font-sans leading-relaxed text-surface/70 md:text-[16px]" : ""}`}>{p}</p>)}
      </div>
    </section>
  );
}

export function ProfileCard({ result }: { result: ResultSummary }) {
  const { dominant, secondary } = result.profiles;
  return (
    <section>
      <SectionTitle title="Uma dinâmica que aparece em você quando a relação entra em tensão" />
      {dominant ? (
        <div className="flex flex-col gap-4">
          <p className="font-serif text-[26px] font-medium text-wine-dark">{PROFILE_LABELS[dominant]}</p>
          {secondary ? <p className="text-[15px] text-muted">Duas dinâmicas aparecem muito próximas: {PROFILE_LABELS[dominant]} e {PROFILE_LABELS[secondary]}.</p> : null}
          <p className="pretty text-[17px] leading-relaxed text-ink">{PROFILE_DESCRIPTIONS[dominant]}</p>
          <p className="text-[14px] text-muted">Isso não é um rótulo de personalidade. É apenas a forma que mais apareceu nas respostas sobre o que você faz quando a relação entra em tensão.</p>
        </div>
      ) : (
        <p className="pretty text-[17px] leading-relaxed text-ink-soft">Seu padrão não aparece concentrado em uma única dinâmica. Pelas suas respostas, o que se repete parece depender mais da combinação de fatores da relação do que de um jeito só seu de reagir.</p>
      )}
    </section>
  );
}

export function GoalBridge({ result }: { result: ResultSummary }) {
  if (!result.goal90) return null;
  const main = result.strain.axes[0];
  const target = result.profiles.dominant === "overload" && main === "partnership" ? "na forma como a responsabilidade está distribuída e volta para você"
    : result.profiles.dominant === "demand_withdraw" ? "na sequência que se forma quando um insiste e o outro se fecha"
    : main ? DIMENSION_LABELS[main].toLowerCase() : "no ponto que mais pesa hoje";
  return (
    <section className="card">
      <SectionTitle eyebrow="O que você disse que mais gostaria de mudar" title={result.goal90.replace(/\.$/, "")} />
      <p className="pretty text-[17px] leading-relaxed text-ink">Seu Raio-X sugere que chegar a esse objetivo provavelmente exige mexer primeiro {target.startsWith("na ") ? target : `em ${target}`}, e não apenas tentar mais uma vez a mesma solução.</p>
    </section>
  );
}

export function IndexNote({ result }: { result: ResultSummary }) {
  return (
    <section className="flex flex-col gap-3 border-t border-line pt-8">
      <p className="text-[13px] font-semibold uppercase tracking-wider text-muted">Índice de Reorganização Relacional</p>
      <p className="font-sans text-[40px] font-semibold tabular-nums text-ink">{result.index}<span className="text-[18px] font-medium text-muted">/100</span></p>
      <p className="text-[15px] text-ink-soft">{result.indexBand.label}</p>
      <p className="pretty text-[14px] leading-relaxed text-muted">Esse índice não mede amor, compatibilidade ou chance de o casamento dar certo. Ele resume quanto recurso de consciência, reparação, reciprocidade e ação aparece disponível nas respostas de hoje.</p>
    </section>
  );
}
