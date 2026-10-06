export type DimensionKey = "connection" | "conversation" | "partnership" | "affection" | "respect_future";
export type ProfileKey = "overload" | "demand_withdraw" | "emotional_baggage" | "knows_but_repeats";
export type SegmentKey = "context_connection" | "conversation" | "partnership" | "intimacy_future" | "repetition" | "direction";

export type QuestionId =
  | "Q01" | "Q02" | "Q03" | "Q04" | "Q05" | "Q06" | "Q07" | "Q08" | "Q09" | "Q10"
  | "Q11" | "Q12" | "Q13" | "Q14" | "Q15" | "Q16" | "Q17" | "Q18" | "Q19" | "Q20"
  | "Q21" | "Q22" | "Q23" | "Q24" | "Q25" | "Q26" | "Q27" | "Q28" | "Q29" | "Q30" | "Q31";

export type AnswerValue = string | string[] | number;
export type QuizAnswers = Partial<Record<QuestionId, AnswerValue>>;

export type QuestionType = "single" | "multi" | "scale";

export interface DimensionEffect {
  dimension: DimensionKey;
  /** null = a resposta é removida do numerador e do denominador. */
  score: number | null;
}

export interface QuestionOption {
  id: string;
  label: string;
  /** Pontuação de 0 a 4 por dimensão. Uma opção pode pontuar em mais de uma dimensão (Q10). */
  dimensions?: DimensionEffect[];
  profileEffects?: Partial<Record<ProfileKey, number>>;
  /** Marca o eixo "adaptativo" (respostas que mostram recurso sem pontuar perfil). */
  adaptive?: number;
  flags?: string[];
  /** Em multi-select: não pode ser combinada com outras. */
  exclusive?: boolean;
  /** Em multi-select: tag do recurso preservado ou da tentativa. */
  tag?: string;
}

export interface QuestionConfig {
  id: QuestionId;
  field: string;
  segment: SegmentKey;
  type: QuestionType;
  text: string;
  helper?: string;
  /** Texto exibido acima da pergunta (ex.: aviso antes da pergunta de segurança). */
  preface?: string;
  options?: QuestionOption[];
  scale?: { min: number; max: number; minLabel: string; maxLabel: string };
  /** Dimensões em que a pergunta participa, com peso. */
  dimensions?: { dimension: DimensionKey; weight: number }[];
  /** Exige botão Continuar mesmo sendo single-select. */
  requireConfirm?: boolean;
  /** Permite seguir sem responder (campo opcional). */
  optional?: boolean;
}

export type DimensionScores = Record<DimensionKey, number | null>;
export type ProfileScores = Record<ProfileKey, number>;

export interface StrainResult {
  axes: DimensionKey[]; // 1 ou 2 (empate real)
  tied: boolean;
}

export interface ProfileResult {
  dominant: ProfileKey | null;
  secondary: ProfileKey | null; // quando duas dinâmicas aparecem muito próximas
  scores: ProfileScores;
  threshold: number;
}

export interface CommercialReadiness {
  score: number;
  classification: "LOW" | "MEDIUM" | "QUALIFIED" | "HIGH";
  criteria: Record<string, boolean>;
}

export interface SafetyFlags {
  safety_flag: boolean;
  safety_history_flag: boolean;
  safety_preflag: boolean;
  low_adherence: boolean;
}

export interface CycleNode {
  label: string;
  sourceQuestions: QuestionId[];
}

export interface CycleResult {
  kind: "demand_withdraw" | "overload" | "avoidance" | "escalation" | null;
  nodes: CycleNode[];
}

export interface PreservedResourcesResult {
  tags: string[];
  count: number;
  headline: string;
  hardToSee: boolean;
}

export interface ResultSummary {
  dimensions: DimensionScores;
  index: number;
  indexBand: { range: string; label: string };
  strain: StrainResult;
  preservedAxis: DimensionKey[];
  profiles: ProfileResult;
  resources: PreservedResourcesResult;
  commercial: CommercialReadiness;
  safety: SafetyFlags;
  cycle: CycleResult;
  hypothesis: string[];
  headline: string;
  goal90: string | null;
  attemptsCount: number;
}

export interface Lead {
  name: string;
  whatsapp: string;
  email: string | null;
  consent: boolean;
  consentAt: string | null;
}

export interface UtmData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  source_channel: string | null;
  referrer: string | null;
  landing_path: string | null;
}

export interface QuizSession {
  session_id: string;
  quiz_version: string;
  created_at: string;
  current_screen: number;
  answers: QuizAnswers;
  lead: Lead;
  utm: UtmData;
}

export interface CRMLeadPayload {
  session_id: string;
  quiz_version: string;
  created_at: string;
  lead_name: string;
  lead_whatsapp: string;
  lead_email: string | null;
  relationship_status: string | null;
  relationship_years: string | null;
  has_children_context: string | null;
  connection_score: number | null;
  conversation_score: number | null;
  partnership_score: number | null;
  affection_score: number | null;
  respect_future_score: number | null;
  relationship_reorganization_index: number;
  main_strain_axis: string;
  preserved_axis: string;
  dominant_profile: string | null;
  dominant_profile_score: number;
  preserved_resources: string[];
  preserved_resources_count: number;
  goal_90_days: string | null;
  problem_duration: string | null;
  previous_attempts: string[];
  previous_attempts_count: number;
  urgency_score: number | null;
  start_readiness: string | null;
  investment_capacity: string | null;
  commercial_readiness: number;
  commercial_classification: string;
  safety_flag: boolean;
  safety_history_flag: boolean;
  answers: QuizAnswers;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  source_channel: string | null;
  referrer: string | null;
  landing_path: string | null;
  event: "lead_capture_complete" | "cta_click";
}
