import { QUESTIONS } from "@/config/questions";
import type { DimensionKey, DimensionScores, ProfileKey, ProfileResult, ProfileScores, QuizAnswers, StrainResult } from "@/types";
import { getMulti, getOption, is } from "./answers";

export const PROFILE_THRESHOLD = 4;
export const PROFILE_KEYS: ProfileKey[] = ["overload", "demand_withdraw", "emotional_baggage", "knows_but_repeats"];

export const PROFILE_LABELS: Record<ProfileKey, string> = {
  overload: "A Sobrecarregada",
  demand_withdraw: "Presa no Ciclo Cobrança-Afastamento",
  emotional_baggage: "Repetindo a Mochila Emocional",
  knows_but_repeats: "A Que Já Entendeu, Mas Continua Repetindo",
};

/** Comportamentos atuais que podem sobrepor-se ao padrão da casa de origem. */
export function currentPatterns(answers: QuizAnswers) {
  const demandWithdraw = is(answers, "Q07", "A", "B") || is(answers, "Q20", "demand") || is(answers, "Q21", "explain_repeat");
  const silence = is(answers, "Q07", "C") || is(answers, "Q08", "days_apart", "time_passes") || is(answers, "Q09", "avoid") || is(answers, "Q20", "withdraw");
  const escalation = is(answers, "Q07", "E") || is(answers, "Q10", "insults", "irony");
  const suppression = is(answers, "Q20", "pretend") || is(answers, "Q21", "keep_change") || is(answers, "Q14", "do_alone") || is(answers, "Q10", "my_fear");
  return { demandWithdraw, silence, escalation, suppression };
}

/** Sobreposição história × presente. Retorna os pontos e o tipo de match, ou null. */
export function childhoodOverlap(answers: QuizAnswers): { points: number; kind: string } | null {
  const cur = currentPatterns(answers);
  if (is(answers, "Q22", "talk_close") && cur.demandWithdraw) return { points: 3, kind: "talk_close" };
  if (is(answers, "Q22", "silence", "hidden") && cur.silence) return { points: 3, kind: "silence" };
  if (is(answers, "Q22", "escalation") && cur.escalation) return { points: 3, kind: "escalation" };
  if (is(answers, "Q22", "ceding") && cur.suppression) return { points: 2, kind: "ceding" };
  return null;
}

export function attemptsCount(answers: QuizAnswers): number {
  return getMulti(answers, "Q25").filter((t) => t !== "nothing").length;
}

const DURATION_MONTHS: Record<string, number> = { lt3m: 1, "3_6m": 4, "6m_1y": 9, "1_3y": 24, gt3y: 48 };
export function problemDurationMonths(answers: QuizAnswers): number | null {
  const v = answers.Q27;
  return typeof v === "string" ? DURATION_MONTHS[v] ?? null : null;
}

export function calculateProfiles(answers: QuizAnswers, dims: DimensionScores, strain: StrainResult): ProfileResult {
  const scores: ProfileScores = { overload: 0, demand_withdraw: 0, emotional_baggage: 0, knows_but_repeats: 0 };
  const strongSignals: ProfileScores = { overload: 0, demand_withdraw: 0, emotional_baggage: 0, knows_but_repeats: 0 };
  // Efeitos declarados na configuração (single-select)
  for (const q of QUESTIONS) {
    const opt = getOption(answers, q.id);
    if (!opt?.profileEffects) continue;
    for (const [k, v] of Object.entries(opt.profileEffects) as [ProfileKey, number][]) {
      scores[k] += v;
      if (v >= 2) strongSignals[k] += 1;
    }
  }
  // Mochila emocional: só por sobreposição história × presente
  const overlap = childhoodOverlap(answers);
  if (overlap) { scores.emotional_baggage += overlap.points; strongSignals.emotional_baggage += 1; }
  // Já entendeu, mas repete
  const attempts = getMulti(answers, "Q25");
  const n = attemptsCount(answers);
  if (n >= 3) scores.knows_but_repeats += 1;
  if (attempts.some((t) => ["therapy_individual", "therapy_couple", "course_book"].includes(t))) { scores.knows_but_repeats += 1; strongSignals.knows_but_repeats += 1; }
  if (attempts.includes("change_self")) scores.knows_but_repeats += 1;
  const months = problemDurationMonths(answers);
  if (months !== null && months >= 12) scores.knows_but_repeats += 1;
  const strainScore = strain.axes.length ? (dims[strain.axes[0]] ?? 100) : 100;
  if (strainScore < 50) scores.knows_but_repeats += 1;
  const rep = getOption(answers, "Q09")?.dimensions?.[0]?.score;
  if (rep !== undefined && rep !== null && rep <= 1) scores.knows_but_repeats += 1;

  // Predominante com limiar de evidência
  const max = Math.max(...PROFILE_KEYS.map((k) => scores[k]));
  if (max < PROFILE_THRESHOLD) return { dominant: null, secondary: null, scores, threshold: PROFILE_THRESHOLD };
  let cands = PROFILE_KEYS.filter((k) => scores[k] === max);
  if (cands.length > 1) {
    const ms = Math.max(...cands.map((k) => strongSignals[k]));
    cands = cands.filter((k) => strongSignals[k] === ms);
  }
  if (cands.length > 1) {
    // sinal mais comportamental/recente: respostas do movimento 5 (Q20, Q21, Q23)
    const recent = (k: ProfileKey) => ["Q20", "Q21", "Q23"].reduce((s, q) => s + (getOption(answers, q as "Q20")?.profileEffects?.[k] ?? 0), 0);
    const mr = Math.max(...cands.map(recent));
    cands = cands.filter((k) => recent(k) === mr);
  }
  if (cands.length > 1 && strain.axes.length) {
    const related: Record<DimensionKey, ProfileKey[]> = {
      partnership: ["overload"], conversation: ["demand_withdraw", "emotional_baggage"], connection: ["demand_withdraw"],
      affection: ["emotional_baggage"], respect_future: ["knows_but_repeats"],
    };
    const rel = cands.filter((k) => related[strain.axes[0]].includes(k));
    if (rel.length === 1) cands = rel;
  }
  if (cands.length > 1) return { dominant: cands[0], secondary: cands[1], scores, threshold: PROFILE_THRESHOLD };
  return { dominant: cands[0], secondary: null, scores, threshold: PROFILE_THRESHOLD };
}
