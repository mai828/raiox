import { DIMENSION_LABELS, optionLabel } from "@/config/questions";
import { HYPOTHESIS_AXIS, HYPOTHESIS_PROFILE, RESOURCE_BRIDGE } from "@/config/resultCopy";
import type { PreservedResourcesResult, ProfileResult, QuizAnswers, StrainResult } from "@/types";
import { attemptsCount } from "./profiles";

const BRIDGE_PRIORITY = ["affection", "respect", "humor", "partnership", "desire", "projects", "my_will", "his_will"];

/** Hipótese determinística montada por módulos: eixo → perfil → recurso → tentativas → objetivo → ressalva. */
export function buildHypothesis(answers: QuizAnswers, strain: StrainResult, profiles: ProfileResult, resources: PreservedResourcesResult): string[] {
  const parts: string[] = [];
  const main = strain.axes[0];
  if (main) {
    parts.push(strain.tied && strain.axes[1]
      ? `${HYPOTHESIS_AXIS[main]} Ao mesmo tempo, ${DIMENSION_LABELS[strain.axes[1]].toLowerCase()} aparece com um peso muito parecido, o que sugere que as duas coisas estão ligadas.`
      : HYPOTHESIS_AXIS[main]);
  }
  parts.push(HYPOTHESIS_PROFILE[profiles.dominant ?? "none"]);
  const bridgeTag = BRIDGE_PRIORITY.find((t) => resources.tags.includes(t));
  if (bridgeTag) parts.push(RESOURCE_BRIDGE[bridgeTag]);
  else if (resources.hardToSee) parts.push("Você disse que hoje tem dificuldade de enxergar algo preservado, e isso também entra na leitura: o desgaste pode estar encobrindo recursos que ainda existem, ou pode ser um sinal de que a relação pede uma decisão mais do que um ajuste.");
  const n = attemptsCount(answers);
  if (n >= 3) parts.push("Você já tentou caminhos diferentes para mexer nisso. Quando tentativas distintas levam quase ao mesmo lugar, uma hipótese possível é que o alvo da mudança ainda não foi o ponto que sustenta a repetição.");
  else if (n >= 1) parts.push("Você já começou a mexer nessa dinâmica, e o que suas respostas sugerem é verificar se essas tentativas chegaram ao que de fato mantém a repetição.");
  else parts.push("Até aqui você tentou pouca coisa de forma estruturada, o que parece ter menos a ver com falta de vontade e mais com a ausência de uma leitura que dissesse onde mexer.");
  const goal = optionLabel("Q26", typeof answers.Q26 === "string" ? answers.Q26 : null);
  if (goal && main) parts.push(`Isso fica especialmente importante porque você disse que a mudança que mais faria diferença seria “${goal.replace(/\.$/, "")}”. Pelas suas respostas, esse objetivo passa primeiro por ${DIMENSION_LABELS[main].toLowerCase()}.`);
  parts.push("Isso é uma hipótese a partir das respostas de hoje, não um diagnóstico. Ela precisa ser verificada com a sua história real.");
  return parts;
}
