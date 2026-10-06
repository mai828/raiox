import { optionLabel } from "@/config/questions";
import type { QuizAnswers, ResultSummary } from "@/types";
import { calculateDimensionScores, calculateOverallIndex, indexBand } from "./dimensions";
import { calculateMainStrain, calculatePreservedAxis } from "./strain";
import { calculateProfiles, attemptsCount } from "./profiles";
import { calculatePreservedResources } from "./resources";
import { calculateCommercialReadiness } from "./commercial";
import { calculateSafetyFlags } from "./safety";
import { buildCycle } from "./cycle";
import { buildHypothesis } from "./hypothesis";
import { buildResultHeadline } from "./headline";

export * from "./dimensions";
export * from "./strain";
export * from "./profiles";
export * from "./resources";
export * from "./commercial";
export * from "./safety";
export * from "./cycle";
export * from "./hypothesis";
export * from "./headline";
export * from "./insights";
export * from "./answers";

/** Resultado completo, determinístico, a partir das respostas. */
export function summarize(answers: QuizAnswers): ResultSummary {
  const dimensions = calculateDimensionScores(answers);
  const index = calculateOverallIndex(dimensions);
  const strain = calculateMainStrain(dimensions, answers);
  const preservedAxis = calculatePreservedAxis(dimensions);
  const profiles = calculateProfiles(answers, dimensions, strain);
  const resources = calculatePreservedResources(answers, preservedAxis);
  const safety = calculateSafetyFlags(answers);
  const commercial = calculateCommercialReadiness(answers, safety);
  const cycle = buildCycle(answers, profiles, strain);
  const hypothesis = buildHypothesis(answers, strain, profiles, resources);
  const headline = buildResultHeadline(dimensions, strain);
  return {
    dimensions, index, indexBand: indexBand(index), strain, preservedAxis, profiles, resources, commercial, safety, cycle, hypothesis, headline,
    goal90: optionLabel("Q26", typeof answers.Q26 === "string" ? answers.Q26 : null),
    attemptsCount: attemptsCount(answers),
  };
}
