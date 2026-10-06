import { QUESTIONS } from "@/config/questions";
import type { DimensionKey, DimensionScores, QuizAnswers, StrainResult } from "@/types";
import { DIMENSIONS } from "./dimensions";
import { getOption, is } from "./answers";

/** Quantidade de respostas 0 ou 1 e peso comprometido em um eixo. */
function strainEvidence(answers: QuizAnswers, dim: DimensionKey) {
  let lowCount = 0, compromisedWeight = 0;
  for (const q of QUESTIONS) {
    const w = q.dimensions?.find((d) => d.dimension === dim)?.weight;
    if (!w) continue;
    const eff = getOption(answers, q.id)?.dimensions?.find((e) => e.dimension === dim);
    if (!eff || eff.score === null) continue;
    if (eff.score <= 1) { lowCount += 1; compromisedWeight += (4 - eff.score) * w; }
  }
  return { lowCount, compromisedWeight };
}

/** Eixo relacionado ao objetivo de 90 dias (Q26). */
export function goalAxis(answers: QuizAnswers): DimensionKey | null {
  if (is(answers, "Q26", "conversation")) return "conversation";
  if (is(answers, "Q26", "partnership")) return "partnership";
  if (is(answers, "Q26", "affection")) return "affection";
  if (is(answers, "Q26", "respect_future", "clarity")) return "respect_future";
  if (is(answers, "Q26", "both_trying")) return "connection";
  return null;
}

/**
 * main_strain_axis = menor score. Se os dois menores estão a <= 5 pontos:
 * 1. mais respostas 0/1; 2. maior peso comprometido; 3. eixo do objetivo de 90 dias; 4. manter ambos.
 */
export function calculateMainStrain(dims: DimensionScores, answers: QuizAnswers): StrainResult {
  const scored = DIMENSIONS.filter((d) => dims[d] !== null).sort((a, b) => (dims[a] as number) - (dims[b] as number));
  if (!scored.length) return { axes: [], tied: false };
  const lowest = dims[scored[0]] as number;
  let cands = scored.filter((d) => (dims[d] as number) - lowest <= 5);
  if (cands.length === 1) return { axes: cands, tied: false };
  const ev = Object.fromEntries(cands.map((d) => [d, strainEvidence(answers, d)])) as Record<DimensionKey, { lowCount: number; compromisedWeight: number }>;
  const maxLow = Math.max(...cands.map((d) => ev[d].lowCount));
  cands = cands.filter((d) => ev[d].lowCount === maxLow);
  if (cands.length === 1) return { axes: cands, tied: false };
  const maxW = Math.max(...cands.map((d) => ev[d].compromisedWeight));
  cands = cands.filter((d) => ev[d].compromisedWeight === maxW);
  if (cands.length === 1) return { axes: cands, tied: false };
  const g = goalAxis(answers);
  if (g && cands.includes(g)) return { axes: [g], tied: false };
  return { axes: cands.slice(0, 2), tied: true };
}

export function calculatePreservedAxis(dims: DimensionScores): DimensionKey[] {
  const scored = DIMENSIONS.filter((d) => dims[d] !== null).sort((a, b) => (dims[b] as number) - (dims[a] as number));
  if (!scored.length) return [];
  const top = dims[scored[0]] as number;
  return scored.filter((d) => top - (dims[d] as number) <= 5).slice(0, 2);
}
