import { optionLabel } from "@/config/questions";
import type { CRMLeadPayload, QuizSession, ResultSummary } from "@/types";

export function buildCRMPayload(session: QuizSession, result: ResultSummary, event: CRMLeadPayload["event"]): CRMLeadPayload {
  const a = session.answers;
  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const arr = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  return {
    session_id: session.session_id,
    quiz_version: session.quiz_version,
    created_at: session.created_at,
    lead_name: session.lead.name,
    lead_whatsapp: session.lead.whatsapp,
    lead_email: session.lead.email,
    relationship_status: str(a.Q01),
    relationship_years: str(a.Q02),
    has_children_context: str(a.Q03),
    connection_score: result.dimensions.connection,
    conversation_score: result.dimensions.conversation,
    partnership_score: result.dimensions.partnership,
    affection_score: result.dimensions.affection,
    respect_future_score: result.dimensions.respect_future,
    relationship_reorganization_index: result.index,
    main_strain_axis: result.strain.axes.join("+"),
    preserved_axis: result.preservedAxis.join("+"),
    dominant_profile: result.profiles.dominant,
    dominant_profile_score: result.profiles.dominant ? result.profiles.scores[result.profiles.dominant] : 0,
    preserved_resources: result.resources.tags,
    preserved_resources_count: result.resources.count,
    goal_90_days: optionLabel("Q26", str(a.Q26)),
    problem_duration: str(a.Q27),
    previous_attempts: arr(a.Q25),
    previous_attempts_count: result.attemptsCount,
    urgency_score: typeof a.Q28 === "number" ? a.Q28 : null,
    start_readiness: str(a.Q29),
    investment_capacity: str(a.Q30),
    commercial_readiness: result.commercial.score,
    commercial_classification: result.commercial.classification,
    safety_flag: result.safety.safety_flag,
    safety_history_flag: result.safety.safety_history_flag,
    answers: a,
    ...session.utm,
    event,
  };
}
