import { QUESTIONS, SEGMENTS } from "@/config/questions";
import type { QuestionId, QuizAnswers, SegmentKey } from "@/types";

export type Screen =
  | { kind: "hero" }
  | { kind: "how" }
  | { kind: "question"; qid: QuestionId }
  | { kind: "insight"; id: 1 | 2 | 3 | 4 | 5 }
  | { kind: "partial" }
  | { kind: "pre_result" }
  | { kind: "capture_name" }
  | { kind: "capture_phone" }
  | { kind: "capture_email" }
  | { kind: "processing" }
  | { kind: "result" }
  | { kind: "not_in_relationship" };

const q = (qid: QuestionId): Screen => ({ kind: "question", qid });

/** Sequência completa. O único desvio é Q01 = D (não está em relacionamento). */
export function buildFlow(answers: QuizAnswers): Screen[] {
  const flow: Screen[] = [{ kind: "hero" }, { kind: "how" }, q("Q01")];
  if (answers.Q01 === "D") return [...flow, { kind: "not_in_relationship" }];
  flow.push(
    q("Q02"), q("Q03"), q("Q04"), q("Q05"), { kind: "insight", id: 1 },
    q("Q06"), q("Q07"), q("Q08"), q("Q09"), q("Q10"), { kind: "insight", id: 2 },
    q("Q11"), q("Q12"), q("Q13"), q("Q14"), { kind: "insight", id: 3 },
    q("Q15"), q("Q16"), q("Q17"), q("Q18"), q("Q19"), { kind: "partial" },
    q("Q20"), q("Q21"), q("Q22"), q("Q23"), { kind: "insight", id: 4 },
    q("Q24"), q("Q25"), { kind: "insight", id: 5 },
    q("Q26"), q("Q27"), q("Q28"), q("Q29"), q("Q30"), q("Q31"),
    { kind: "pre_result" }, { kind: "capture_name" }, { kind: "capture_phone" }, { kind: "capture_email" },
    { kind: "processing" }, { kind: "result" },
  );
  return flow;
}

const QUESTION_SEGMENT = Object.fromEntries(QUESTIONS.map((x) => [x.id, x.segment])) as Record<QuestionId, SegmentKey>;

/** Segmento (0–5) e fração interna, para a barra segmentada. */
export function progressFor(flow: Screen[], index: number): { segment: number; fraction: number } | null {
  const s = flow[index];
  if (!s || s.kind === "hero" || s.kind === "how" || s.kind === "not_in_relationship") return null;
  if (s.kind === "result" || s.kind === "processing") return { segment: 5, fraction: 1 };
  const segKey = screenSegment(flow, index);
  const segIdx = SEGMENTS.findIndex((x) => x.key === segKey);
  const inSeg = flow.map((sc, i) => ({ sc, i })).filter(({ i }) => screenSegment(flow, i) === segKey);
  const pos = inSeg.findIndex(({ i }) => i === index);
  return { segment: segIdx, fraction: inSeg.length ? (pos + 1) / inSeg.length : 1 };
}

export function screenSegment(flow: Screen[], index: number): SegmentKey {
  const s = flow[index];
  if (s.kind === "question") return QUESTION_SEGMENT[s.qid];
  // Telas não-pergunta herdam o segmento da última pergunta anterior.
  for (let i = index - 1; i >= 0; i--) {
    const p = flow[i];
    if (p.kind === "question") return QUESTION_SEGMENT[p.qid];
  }
  return "context_connection";
}

export function screenId(s: Screen): string {
  if (s.kind === "question") return s.qid;
  if (s.kind === "insight") return `insight_${s.id}`;
  return s.kind;
}
