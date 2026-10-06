import { QUESTIONS } from "@/config/questions";
import type { DimensionKey, DimensionScores, QuizAnswers } from "@/types";
import { getOption } from "./answers";

export const DIMENSIONS: DimensionKey[] = ["connection", "conversation", "partnership", "affection", "respect_future"];
const MAX_SCORE = 4;

/**
 * dimensionScore = sum(answerScore * weight) / sum(maxScore * weight) * 100
 * Respostas null (não se aplica / prefiro não responder) e perguntas não respondidas saem do numerador e do denominador.
 */
export function calculateDimensionScores(answers: QuizAnswers): DimensionScores {
  const out: DimensionScores = { connection: null, conversation: null, partnership: null, affection: null, respect_future: null };
  for (const dim of DIMENSIONS) {
    let num = 0, den = 0;
    for (const q of QUESTIONS) {
      const w = q.dimensions?.find((d) => d.dimension === dim)?.weight;
      if (!w) continue;
      const opt = getOption(answers, q.id);
      if (!opt) continue;
      const eff = opt.dimensions?.find((e) => e.dimension === dim);
      if (!eff || eff.score === null) continue;
      num += eff.score * w;
      den += MAX_SCORE * w;
    }
    out[dim] = den > 0 ? Math.round((num / den) * 100) : null;
  }
  return out;
}

export function calculateOverallIndex(dims: DimensionScores): number {
  const vals = DIMENSIONS.map((d) => dims[d]).filter((v): v is number => v !== null);
  if (!vals.length) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

export function indexBand(index: number): { range: string; label: string } {
  if (index <= 24) return { range: "0–24", label: "Poucos recursos acessíveis agora" };
  if (index <= 49) return { range: "25–49", label: "Tensão ocupando um espaço relevante" };
  if (index <= 74) return { range: "50–74", label: "Recursos preservados com pontos importantes de repetição" };
  return { range: "75–100", label: "Base relacional relativamente preservada" };
}

export function scoreBand(score: number): 0 | 1 | 2 | 3 {
  if (score <= 24) return 0;
  if (score <= 49) return 1;
  if (score <= 74) return 2;
  return 3;
}
