import type { CycleNode, CycleResult, ProfileResult, QuizAnswers, StrainResult } from "@/types";
import { is } from "./answers";

/**
 * Monta a sequência de repetição apenas com nós sustentados por respostas.
 * Se não houver pelo menos 4 nós com evidência, não há ciclo.
 */
export function buildCycle(answers: QuizAnswers, profiles: ProfileResult, strain: StrainResult): CycleResult {
  const candidates: CycleResult[] = [];

  // Cobrança-afastamento
  if (is(answers, "Q07", "A", "B")) {
    const nodes: CycleNode[] = [{ label: "tensão", sourceQuestions: ["Q06"] }, { label: "você tenta resolver", sourceQuestions: ["Q07"] }, { label: "ele se fecha", sourceQuestions: ["Q07"] }];
    if (is(answers, "Q20", "demand", "approach") || is(answers, "Q21", "explain_repeat")) nodes.push({ label: "você aumenta a pressão", sourceQuestions: ["Q20", "Q21"] });
    if (is(answers, "Q08", "peace_unresolved", "time_passes", "days_apart", "me_first")) nodes.push({ label: "o assunto termina sem reparação", sourceQuestions: ["Q08"] });
    nodes.push({ label: "a rotina volta", sourceQuestions: ["Q08"] });
    if (is(answers, "Q09", "same_fight", "one_two_themes")) nodes.push({ label: "a tensão reaparece", sourceQuestions: ["Q09"] });
    candidates.push({ kind: "demand_withdraw", nodes });
  }
  // Sobrecarga
  if (is(answers, "Q11", "me_more", "me_almost_all") && (is(answers, "Q12", "often", "almost_always") || is(answers, "Q13", "monitor", "redo") || is(answers, "Q14", "do_alone"))) {
    const nodes: CycleNode[] = [{ label: "sobrecarga", sourceQuestions: ["Q11"] }, { label: "você assume", sourceQuestions: ["Q11", "Q14"] }];
    if (is(answers, "Q12", "often", "almost_always") || is(answers, "Q23", "partner_not_assume")) nodes.push({ label: "ele participa menos", sourceQuestions: ["Q12", "Q23"] });
    if (is(answers, "Q13", "monitor", "redo")) nodes.push({ label: "você confia menos", sourceQuestions: ["Q13"] });
    if (is(answers, "Q13", "redo") || is(answers, "Q21", "do_myself")) nodes.push({ label: "assume novamente", sourceQuestions: ["Q13", "Q21"] });
    nodes.push({ label: "a sobrecarga aumenta", sourceQuestions: ["Q14", "Q23"] });
    candidates.push({ kind: "overload", nodes });
  }
  // Evitação
  if (is(answers, "Q07", "C") || is(answers, "Q09", "avoid") || is(answers, "Q08", "time_passes", "days_apart")) {
    const nodes: CycleNode[] = [{ label: "desconforto", sourceQuestions: ["Q06"] }];
    if (is(answers, "Q07", "C") || is(answers, "Q09", "avoid")) nodes.push({ label: "ambos evitam", sourceQuestions: ["Q07", "Q09"] });
    if (is(answers, "Q08", "time_passes", "days_apart")) nodes.push({ label: "o assunto some", sourceQuestions: ["Q08"] });
    if (is(answers, "Q04", "none", "one", "together_distant") || is(answers, "Q05", "solve_first", "rarely")) nodes.push({ label: "a distância permanece", sourceQuestions: ["Q04", "Q05"] });
    if (is(answers, "Q06", "small_old") || is(answers, "Q07", "D")) nodes.push({ label: "um novo conflito ativa o anterior", sourceQuestions: ["Q06", "Q07"] });
    candidates.push({ kind: "avoidance", nodes });
  }
  // Escalada
  if (is(answers, "Q07", "E", "D")) {
    const nodes: CycleNode[] = [{ label: "problema", sourceQuestions: ["Q06"] }, { label: "escalada dos dois", sourceQuestions: ["Q07"] }];
    if (is(answers, "Q08", "days_apart", "time_passes")) nodes.push({ label: "afastamento", sourceQuestions: ["Q08"] });
    if (is(answers, "Q08", "peace_unresolved", "me_first", "him_first")) nodes.push({ label: "reconciliação sem resolução", sourceQuestions: ["Q08"] });
    if (is(answers, "Q07", "D") || is(answers, "Q06", "small_old") || is(answers, "Q09", "same_fight", "one_two_themes")) nodes.push({ label: "o novo conflito acumula o anterior", sourceQuestions: ["Q06", "Q07", "Q09"] });
    candidates.push({ kind: "escalation", nodes });
  }

  const valid = candidates.filter((c) => c.nodes.length >= 4);
  if (!valid.length) return { kind: null, nodes: [] };
  // Prioriza o ciclo ligado ao perfil dominante; depois ao eixo de tensão; depois o mais longo.
  const byProfile: Record<string, CycleResult["kind"]> = { overload: "overload", demand_withdraw: "demand_withdraw" };
  const pref = profiles.dominant ? byProfile[profiles.dominant] : undefined;
  const fromProfile = valid.find((c) => c.kind === pref);
  if (fromProfile) return fromProfile;
  if (strain.axes[0] === "partnership") { const o = valid.find((c) => c.kind === "overload"); if (o) return o; }
  return valid.sort((a, b) => b.nodes.length - a.nodes.length)[0];
}
