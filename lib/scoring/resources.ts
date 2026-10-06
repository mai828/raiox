import type { DimensionKey, PreservedResourcesResult, QuizAnswers } from "@/types";
import { getMulti } from "./answers";

export const RESOURCE_LABELS: Record<string, string> = {
  humor: "Leveza e humor",
  affection: "Carinho",
  respect: "Respeito",
  partnership: "Parceria nos momentos difíceis",
  desire: "Desejo e atração",
  projects: "Projetos em comum",
  my_will: "Sua vontade de reconstruir",
  his_will: "Disposição dele para melhorar",
};

export function calculatePreservedResources(answers: QuizAnswers, preservedAxis: DimensionKey[]): PreservedResourcesResult {
  const sel = getMulti(answers, "Q24");
  const hardToSee = sel.includes("hard_to_see");
  const tags = sel.filter((t) => t !== "hard_to_see");
  const count = tags.length;
  let headline: string;
  if (hardToSee || count === 0) headline = "Hoje os recursos da relação parecem menos acessíveis para você.";
  else if (count >= 3) headline = "Existe mais coisa preservada aqui do que o desgaste faz parecer.";
  else headline = "Alguns recursos importantes ainda aparecem.";
  void preservedAxis;
  return { tags, count, headline, hardToSee };
}
