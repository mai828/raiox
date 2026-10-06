import type { CommercialReadiness, QuizAnswers, SafetyFlags } from "@/types";
import { getNumber, is } from "./answers";
import { attemptsCount, problemDurationMonths } from "./profiles";

/**
 * Score separado de prontidão comercial (0–7). Nunca usa sofrimento ou scores relacionais.
 * Critério 4 (abertura): inferido; só cai quando há low_adherence explícita.
 * Critério 7 (intenção de agir): inferido de Q29 — qualquer resposta que fale em começar/organizar,
 * não apenas "entender melhor" ou "não sei".
 */
export function calculateCommercialReadiness(answers: QuizAnswers, safety: SafetyFlags): CommercialReadiness {
  const months = problemDurationMonths(answers);
  const urgency = getNumber(answers, "Q28");
  const criteria = {
    problem_duration_6m: months !== null && months >= 6,
    attempts_2plus: attemptsCount(answers) >= 2,
    urgency_7plus: urgency !== null && urgency >= 7,
    openness: !safety.low_adherence,
    start_soon: is(answers, "Q29", "now", "weeks"),
    investment_available: is(answers, "Q30", "can"),
    intent_to_act: is(answers, "Q29", "now", "weeks", "organize"),
  };
  const score = Object.values(criteria).filter(Boolean).length;
  const classification = score <= 2 ? "LOW" : score === 3 ? "MEDIUM" : score <= 5 ? "QUALIFIED" : "HIGH";
  return { score, classification, criteria };
}
