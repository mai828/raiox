import { QUESTION_BY_ID } from "@/config/questions";
import type { QuestionId, QuizAnswers, QuestionOption, DimensionKey } from "@/types";

export function getOption(answers: QuizAnswers, qid: QuestionId): QuestionOption | null {
  const v = answers[qid];
  if (typeof v !== "string") return null;
  return QUESTION_BY_ID[qid]?.options?.find((o) => o.id === v) ?? null;
}

export function getMulti(answers: QuizAnswers, qid: QuestionId): string[] {
  const v = answers[qid];
  return Array.isArray(v) ? v : [];
}

export function getNumber(answers: QuizAnswers, qid: QuestionId): number | null {
  const v = answers[qid];
  return typeof v === "number" ? v : null;
}

export function is(answers: QuizAnswers, qid: QuestionId, ...ids: string[]): boolean {
  const v = answers[qid];
  return typeof v === "string" && ids.includes(v);
}

/** Score 0–4 que a resposta deu em uma dimensão; null quando não respondida ou "não se aplica". */
export function dimensionAnswerScore(answers: QuizAnswers, qid: QuestionId, dimension: DimensionKey): number | null {
  const opt = getOption(answers, qid);
  if (!opt) return null;
  const eff = opt.dimensions?.find((e) => e.dimension === dimension);
  return eff ? eff.score : null;
}
