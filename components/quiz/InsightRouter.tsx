"use client";
import InsightScreen from "./InsightScreen";
import ConnectionLineViz from "@/components/visualizations/ConnectionLineViz";
import ConflictMotionViz, { type ConflictMode } from "@/components/visualizations/ConflictMotionViz";
import LoadBalanceViz from "@/components/visualizations/LoadBalanceViz";
import { buildInsight1, buildInsight2, buildInsight3, buildInsight4, buildInsight5, calculateDimensionScores, calculateProfiles, calculateMainStrain, dimensionAnswerScore } from "@/lib/scoring";
import type { QuizAnswers } from "@/types";

export default function InsightRouter({ id, answers, onContinue }: { id: 1 | 2 | 3 | 4 | 5; answers: QuizAnswers; onContinue: () => void }) {
  const dims = calculateDimensionScores(answers);
  if (id === 1) {
    const ins = buildInsight1(answers);
    return <InsightScreen insight={ins} visual={<ConnectionLineViz variant={ins.variant as "low" | "mid" | "high"} className="w-full" />} onContinue={onContinue} />;
  }
  if (id === 2) {
    const ins = buildInsight2(answers, dims);
    return <InsightScreen insight={ins} visual={<ConflictMotionViz mode={ins.variant as ConflictMode} className="w-full" />} onContinue={onContinue} />;
  }
  if (id === 3) {
    const ins = buildInsight3(answers, dims);
    // carga "você" derivada de Q11/Q12; "parceiro" é o complemento, pelas respostas.
    const split = dimensionAnswerScore(answers, "Q11", "partnership");
    const load = dimensionAnswerScore(answers, "Q12", "partnership");
    const himMore = answers.Q11 === "him_more";
    const you = himMore ? 0.4 : split === null ? 0.5 : 0.5 + ((4 - split) / 4) * 0.4 + (load !== null ? ((4 - load) / 4) * 0.1 : 0);
    const partner = himMore ? 0.7 : Math.max(0.15, 1 - you);
    return <InsightScreen insight={ins} visual={<LoadBalanceViz you={Math.min(1, you)} partner={partner} className="w-full" />} onContinue={onContinue} />;
  }
  if (id === 4) {
    const strain = calculateMainStrain(dims, answers);
    const prof = calculateProfiles(answers, dims, strain);
    return <InsightScreen insight={buildInsight4(answers, prof.scores.overload)} onContinue={onContinue} />;
  }
  return <InsightScreen insight={buildInsight5(answers, dims)} onContinue={onContinue} />;
}
