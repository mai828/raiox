"use client";
import ResultXRayGlyph from "@/components/visualizations/ResultXRayGlyph";
import DimensionBars from "@/components/visualizations/DimensionBars";
import { CycleSection, GeneralReading, GoalBridge, HypothesisCard, IndexNote, MainStrainCard, PreservedResources, ProfileCard } from "./Sections";
import SpecialistCTA from "./SpecialistCTA";
import { DIMENSION_LABELS } from "@/config/questions";
import type { ResultSummary } from "@/types";

export default function ResultDocument({ result, name, relationshipYears, hideCTA, onCtaClick }: { result: ResultSummary; name: string; relationshipYears: string | null; hideCTA: boolean; onCtaClick: () => void }) {
  const strainLabel = result.strain.axes.map((a) => DIMENSION_LABELS[a]).join(" e ");
  return (
    <article className="flex flex-col gap-14 md:gap-20" data-testid="result">
      <header className="flex flex-col gap-6">
        <p className="eyebrow">Seu Raio-X do Relacionamento</p>
        <h1 className="balance font-serif text-[36px] font-medium leading-[1.05] text-ink md:text-[56px]" data-testid="result-headline">{result.headline}</h1>
        <p className="pretty max-w-[60ch] text-[17px] leading-relaxed text-ink-soft">
          {name}, esta leitura foi montada só com o que você respondeu{relationshipYears ? ` sobre uma relação de ${relationshipYears}` : ""}. Ela organiza sinais. Não é um diagnóstico clínico e não decide nada por você.
        </p>
      </header>

      <section className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <ResultXRayGlyph dims={result.dimensions} className="mx-auto w-full max-w-[420px]" />
        <div className="flex flex-col gap-5">
          <DimensionBars dims={result.dimensions} highlight={result.strain.axes} />
          <p className="text-[13px] leading-relaxed text-muted">Esses números não medem se seu casamento é “bom” ou “ruim”. Eles organizam os recursos e tensões que apareceram nas suas respostas.</p>
        </div>
      </section>

      <GeneralReading dims={result.dimensions} />
      <PreservedResources result={result} />
      <MainStrainCard result={result} />
      <CycleSection result={result} />
      <HypothesisCard result={result} />
      <ProfileCard result={result} />
      <GoalBridge result={result} />
      <IndexNote result={result} />
      {hideCTA ? (
        <p className="pretty text-[16px] leading-relaxed text-ink-soft">Quando fizer sentido para você, a equipe pode olhar essa leitura junto. Mas isso vem depois da sua segurança, não no lugar dela.</p>
      ) : (
        <SpecialistCTA name={name} strainLabel={strainLabel} onClick={onCtaClick} />
      )}
      <footer className="border-t border-line pt-6 text-[13px] leading-relaxed text-muted">
        O Raio-X do Seu Relacionamento é uma ferramenta de leitura de padrões. Não é diagnóstico psicológico, psiquiátrico ou médico, não substitui acompanhamento profissional e não promete reconciliação ou qualquer resultado.
      </footer>
    </article>
  );
}
