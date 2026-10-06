import type { DimensionScores, QuizAnswers } from "@/types";
import { dimensionAnswerScore, is } from "./answers";
import { childhoodOverlap, attemptsCount } from "./profiles";

export interface Insight {
  eyebrow?: string;
  headline: string;
  body: string[];
  cta: string;
  /** Variante usada pelas visualizações. */
  variant: string;
}

export function buildInsight1(answers: QuizAnswers): Insight {
  const a = dimensionAnswerScore(answers, "Q04", "connection") ?? 0;
  const b = dimensionAnswerScore(answers, "Q05", "connection") ?? 0;
  const avg = (a + b) / 2;
  if (avg <= 1.25) return {
    eyebrow: "uma coisa já começa a aparecer", variant: "low",
    headline: "A distância pode estar acontecendo antes mesmo das brigas.",
    body: ["Pelas suas respostas, menos coisas parecem estar chegando de um lado ao outro no cotidiano.", "Isso importa porque um casal pode continuar funcionando na rotina e, ainda assim, perder acesso à vida emocional um do outro.", "Agora quero entender o que acontece quando vocês tentam resolver alguma coisa."],
    cta: "Continuar a leitura",
  };
  if (avg < 3) return {
    variant: "mid",
    headline: "A conexão ainda aparece, mas parece oscilar.",
    body: ["Vocês ainda encontram alguns pontos de contato.", "O que preciso entender agora é o que acontece com essa conexão quando aparece tensão, frustração ou uma conversa difícil."],
    cta: "Continuar",
  };
  return {
    variant: "high",
    headline: "Existe conexão preservada aqui.",
    body: ["Se você sente que o relacionamento está em dificuldade, a explicação provavelmente não é simplesmente “a gente parou de conversar”.", "Isso muda a investigação.", "Agora quero ver o que acontece quando conversar fica difícil."],
    cta: "Ver essa parte",
  };
}

/** Modo da animação de conflito, derivado das respostas. */
export function conflictMotion(answers: QuizAnswers): "demand_withdraw" | "escalation" | "avoidance" | "repair" {
  if (is(answers, "Q07", "A", "B")) return "demand_withdraw";
  if (is(answers, "Q07", "E", "D")) return "escalation";
  if (is(answers, "Q07", "F")) return "repair";
  return "avoidance";
}

export function buildInsight2(answers: QuizAnswers, dims: DimensionScores): Insight {
  const repair = dimensionAnswerScore(answers, "Q08", "conversation");
  const derailAB = is(answers, "Q07", "A", "B");
  if (derailAB && repair !== null && repair <= 2) return {
    eyebrow: "tem uma sequência se formando aqui", variant: "demand_withdraw",
    headline: "O problema pode não ser apenas o assunto da discussão.",
    body: ["Pelas suas respostas, existe uma diferença entre a necessidade de resolver e a forma como cada um reage quando a conversa começa a pesar.", "Quanto mais um tenta chegar a uma resposta, menos o outro parece disponível para continuar.", "Ainda é cedo para concluir por quê.", "Quero descobrir se essa diferença aparece também fora das discussões."],
    cta: "Quero entender melhor",
  };
  if (repair !== null && repair <= 1) return {
    variant: conflictMotion(answers),
    headline: "O que acontece depois da briga chama mais atenção do que a briga em si.",
    body: ["Alguns conflitos parecem terminar sem realmente serem reparados.", "A rotina volta, mas parte do assunto pode continuar dentro da relação.", "Isso costuma produzir acúmulo mesmo quando o casal aparentemente “já passou” pela discussão."],
    cta: "Continuar a leitura",
  };
  if ((dims.conversation ?? 0) >= 75) return {
    variant: "repair",
    headline: "Vocês parecem preservar uma habilidade importante.",
    body: ["Mesmo quando existe tensão, suas respostas mostram alguma capacidade de voltar para a conversa e reparar.", "Se existe desgaste hoje, precisamos procurar onde ele está acontecendo apesar dessa habilidade."],
    cta: "Continuar",
  };
  // Caso intermediário: construir a partir do modo de conflito observado.
  const mode = conflictMotion(answers);
  const bodies: Record<string, string[]> = {
    escalation: ["Pelas suas respostas, quando a conversa pesa, o tom sobe ou o assunto puxa coisas antigas.", "Isso faz com que a discussão termine maior do que começou, e nem sempre o que importava fica resolvido.", "Quero ver se esse acúmulo aparece também na vida prática de vocês."],
    avoidance: ["Pelas suas respostas, quando a conversa pesa, alguém encerra, sai ou muda de assunto.", "Isso evita a escalada, mas pode deixar o tema sem fechamento.", "Quero ver se essa saída aparece também em outras áreas da relação."],
    demand_withdraw: ["Pelas suas respostas, quando a conversa pesa, um insiste e o outro reduz a resposta.", "Vocês conseguem voltar depois, o que é um recurso. Mas o movimento do meio merece atenção.", "Quero ver se ele aparece fora das discussões."],
    repair: ["Vocês conseguem parar antes de piorar, mas nem sempre o assunto volta a ser retomado.", "Isso preserva o clima e, ao mesmo tempo, pode deixar coisas em aberto.", "Quero ver onde isso pesa."],
  };
  return { variant: mode, headline: "A conversa entre vocês tem um movimento que se repete.", body: bodies[mode], cta: "Continuar a leitura" };
}

export function buildInsight3(answers: QuizAnswers, dims: DimensionScores): Insight {
  const split = dimensionAnswerScore(answers, "Q11", "partnership");
  const load = dimensionAnswerScore(answers, "Q12", "partnership");
  const deleg = dimensionAnswerScore(answers, "Q13", "partnership");
  const ps = dims.partnership ?? 0;
  if (split !== null && split <= 2 && load !== null && load <= 2 && deleg !== null && deleg <= 2) return {
    eyebrow: "aqui aparece uma contradição importante", variant: "contradiction",
    headline: "Dividir tarefas e conseguir dividir responsabilidade podem ser coisas diferentes.",
    body: ["Você pode estar realmente carregando mais do que gostaria.", "Ao mesmo tempo, parte da organização parece continuar passando por você mesmo quando o outro participa.", "Isso não transforma a sobrecarga em culpa sua.", "Só mostra que participação e responsabilidade real nem sempre são a mesma coisa."],
    cta: "Quero entender melhor",
  };
  if (split !== null && split <= 1 && deleg !== null && deleg >= 3) return {
    variant: "concrete",
    headline: "A sobrecarga aqui parece bastante concreta.",
    body: ["Suas respostas mostram uma diferença real no quanto cada um precisa sustentar para a vida funcionar.", "Nesse caso, não faz sentido reduzir tudo a “você precisa controlar menos”.", "Primeiro precisamos reconhecer a carga que existe de fato."],
    cta: "Continuar a leitura",
  };
  if (ps >= 70) return {
    variant: "balanced",
    headline: "Parceria prática não parece ser a principal perda de força entre vocês.",
    body: ["Isso elimina uma hipótese importante.", "Vamos continuar procurando onde a distância aparece."],
    cta: "Continuar",
  };
  const himMore = is(answers, "Q11", "him_more");
  return {
    variant: himMore ? "him_more" : "uneven",
    headline: himMore ? "A divisão prática pende para o lado dele, e isso também entra na leitura." : "A parceria funciona, mas pesa de forma desigual em alguns pontos.",
    body: himMore
      ? ["Pelas suas respostas, ele sustenta uma parte maior da vida prática.", "Isso não resolve, por si só, a distância que você sente. Mas tira a sobrecarga doméstica do centro da investigação.", "Quero ver agora como estão afeto, intimidade e a forma como vocês enxergam o futuro."]
      : ["Pelas suas respostas, a divisão existe, mas algumas áreas e parte da organização ainda pesam mais em você.", "Isso não parece ser o centro do desgaste, mas pode estar alimentando outras coisas.", "Quero ver agora como estão afeto, intimidade e a forma como vocês enxergam o futuro."],
    cta: "Continuar a leitura",
  };
}

export function buildInsight4(answers: QuizAnswers, overloadScore: number): Insight {
  const overlap = childhoodOverlap(answers);
  const guiltOrAnxiety = is(answers, "Q23", "guilt", "anxiety");
  if (overlap) return {
    eyebrow: "agora algumas peças começam a conversar", variant: "overlap",
    headline: "Uma resposta atual parece tocar numa lógica que já existia antes deste relacionamento.",
    body: ["A forma como você reage hoje quando sente distância, falta de resposta ou perda de controle se parece, em alguns pontos, com formas de lidar com tensão que você já viu ou viveu antes.", "Isso não prova que “o problema vem da sua infância”.", "Seria raso demais concluir isso daqui.", "Mas mostra que uma estratégia antiga pode estar participando de uma situação atual."],
    cta: "Continuar a leitura",
  };
  if (overloadScore >= 6 && guiltOrAnxiety) return {
    variant: "overload_cost",
    headline: "Talvez carregar tudo não seja apenas uma tarefa.",
    body: ["Pelas suas respostas, existe também um custo emocional em soltar.", "Isso pode fazer com que a responsabilidade continue voltando para você mesmo quando você está exausta dela."],
    cta: "Continuar a leitura",
  };
  return {
    variant: "no_overlap",
    headline: "Sua história não está aparecendo como explicação óbvia até aqui.",
    body: ["Isso também é uma descoberta.", "Pelas suas respostas, o peso parece estar mais na dinâmica que vocês construíram juntos do que numa repetição direta daquilo que você viveu antes."],
    cta: "Continuar",
  };
}

export function buildInsight5(answers: QuizAnswers, dims: DimensionScores): Insight {
  const n = attemptsCount(answers);
  const vals = Object.values(dims).filter((v): v is number => v !== null);
  const fragile = vals.some((v) => v < 50);
  if (n >= 3 && fragile) return {
    variant: "many",
    headline: "Falta de tentativa não parece ser o problema.",
    body: ["Você já mexeu em diferentes pontos da relação e, mesmo assim, algumas situações continuam voltando.", "Quando tentativas diferentes acabam produzindo praticamente o mesmo lugar, vale investigar se o alvo da mudança está correto."],
    cta: "Ver o que falta",
  };
  if (n >= 1 && n <= 2) return {
    variant: "some",
    headline: "Você já começou a mexer nessa dinâmica.",
    body: ["Agora o ponto é entender se essas tentativas atingiram aquilo que realmente mantém a repetição."],
    cta: "Continuar",
  };
  if (n >= 3) return {
    variant: "many_preserved",
    headline: "Você já tentou bastante coisa, e a relação preserva recursos.",
    body: ["Isso sugere que as tentativas tiveram efeito em parte do que importa.", "O que falta é localizar o ponto específico que ainda volta."],
    cta: "Continuar",
  };
  return {
    variant: "none",
    headline: "Até aqui, o problema parece mais claro do que o caminho.",
    body: ["Isso não significa falta de vontade.", "Pode significar que você ainda não encontrou uma leitura que faça sentido o suficiente para saber onde mexer."],
    cta: "Continuar",
  };
}
