import type { QuizAnswers, SafetyFlags } from "@/types";
import { is } from "./answers";

export function calculateSafetyFlags(answers: QuizAnswers): SafetyFlags {
  return {
    safety_flag: is(answers, "Q31", "yes"),
    safety_history_flag: is(answers, "Q31", "past"),
    safety_preflag: is(answers, "Q10", "my_fear"),
    // Baixa aderência explícita só existe hoje para quem não está em um relacionamento (Q01 D).
    low_adherence: is(answers, "Q01", "D"),
  };
}
