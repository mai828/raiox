import type { DimensionKey, ProfileKey } from "@/types";

/** Texto por eixo e faixa (0: 0–24, 1: 25–49, 2: 50–74, 3: 75–100). */
export const AXIS_TEXTS: Record<DimensionKey, [string, string, string, string]> = {
  connection: [
    "Hoje parece existir menos acesso à vida emocional um do outro do que a rotina do casal pode fazer parecer.",
    "A conexão aparece, mas parece perder espaço com facilidade para rotina, silêncio ou desgaste.",
    "Vocês ainda preservam momentos de troca, embora nem sempre consigam sustentar isso quando a relação entra em tensão.",
    "Conexão e presença aparecem como um recurso importante entre vocês.",
  ],
  conversation: [
    "As conversas difíceis parecem terminar sem reparação, e o que fica dentro da relação pesa mais do que o assunto em si.",
    "Vocês conseguem falar, mas a conversa perde o rumo com frequência e nem sempre volta ao ponto que importava.",
    "Existe capacidade de conversar e reparar, com oscilações quando o tema é sensível ou antigo.",
    "Conversar e reparar aparecem como uma habilidade preservada entre vocês, mesmo com tensão.",
  ],
  partnership: [
    "A vida prática parece depender muito mais de um lado do que do outro, e isso ocupa espaço na experiência do casal.",
    "Existe divisão, mas a organização e a carga mental parecem continuar concentradas em você.",
    "A parceria funciona em boa parte do tempo, com alguns pontos em que a responsabilidade ainda pesa de forma desigual.",
    "Parceria e reciprocidade aparecem como um dos recursos mais sólidos entre vocês.",
  ],
  affection: [
    "O carinho e a intimidade parecem pouco acessíveis hoje, e o que existe pode parecer distante ou forçado.",
    "Afeto e intimidade existem, mas diminuíram de um jeito que você sente no dia a dia.",
    "Carinho e proximidade aparecem, com uma diferença entre o que existe e o que você gostaria.",
    "Afeto e intimidade aparecem preservados, mesmo com as dificuldades em outras áreas.",
  ],
  respect_future: [
    "Admiração, segurança para falar e visão de futuro parecem fragilizadas neste momento.",
    "Ainda existe respeito, mas a admiração e a ideia de um futuro em comum perderam força.",
    "Respeito e confiança se mantêm, com dúvidas sobre o futuro que ainda não foram conversadas.",
    "Respeito, confiança e uma ideia de futuro compartilhado aparecem como base preservada.",
  ],
};

export const STRAIN_TEXTS: Record<DimensionKey, string> = {
  connection: "A relação parece perder força no acesso emocional e no espaço de casal.",
  conversation: "O maior peso parece estar menos em “ter conflitos” e mais em como eles evoluem, terminam e ficam dentro da relação.",
  partnership: "A distribuição de responsabilidade e carga parece ocupar espaço demais na experiência de vocês.",
  affection: "A proximidade afetiva e íntima parece estar menos acessível do que você gostaria.",
  respect_future: "Admiração, segurança relacional ou visão compartilhada de futuro parecem estar fragilizadas.",
};

export const HYPOTHESIS_AXIS: Record<DimensionKey, string> = {
  connection: "Hoje, parte da dificuldade parece estar menos na quantidade de tempo juntos e mais no quanto um ainda consegue acessar o que acontece dentro do outro.",
  conversation: "Os conflitos parecem deixar mais resíduos do que deveriam, porque algumas conversas terminam antes de produzir reparação real.",
  partnership: "Existe um problema real de distribuição de responsabilidade, e suas respostas sugerem que parte dessa organização continua passando por você mesmo quando o outro participa.",
  affection: "A intimidade parece estar funcionando mais como consequência do estado da relação do que como um problema isolado.",
  respect_future: "O desgaste parece ter começado a alcançar a forma como você enxerga a relação e o futuro possível entre vocês.",
};

export const HYPOTHESIS_PROFILE: Record<ProfileKey | "none", string> = {
  overload: "Quando isso aperta, sua tendência parece ser assumir ainda mais para impedir que a vida pare. O risco é se tornar cada vez mais indispensável para uma estrutura que já está te cansando.",
  demand_withdraw: "Quando aparece distância, sua tentativa de conseguir resposta pode aumentar exatamente no momento em que o outro começa a reduzir presença. Isso cria uma sequência que alimenta a própria frustração.",
  emotional_baggage: "Algumas respostas atuais conversam com formas de lidar com tensão que já existiam antes deste relacionamento. Isso não determina seu comportamento, mas pode ajudar a explicar por que certas reações parecem tão automáticas.",
  knows_but_repeats: "Falta de informação não parece ser o problema. Você já entendeu e tentou coisas suficientes para saber que compreender intelectualmente não garante conseguir responder diferente quando a vida aperta.",
  none: "Não aparece uma única dinâmica explicando tudo. Isso sugere que o caso precisa ser lido menos como “um padrão seu” e mais como uma combinação de fatores da relação.",
};

export const RESOURCE_BRIDGE: Record<string, string> = {
  affection: "Isso acontece numa relação em que ainda existe carinho, o que muda bastante a leitura.",
  respect: "Apesar do desgaste, respeito ainda aparece como recurso.",
  humor: "Vocês ainda conseguem acessar leveza juntos, e isso é um recurso real.",
  partnership: "A relação ainda demonstra capacidade de funcionar como equipe em alguns momentos.",
  desire: "Atração ainda aparece, mesmo que outras áreas tenham perdido força.",
  projects: "A existência de projetos em comum mostra que ainda existe alguma construção de futuro compartilhada.",
  my_will: "Sua vontade de reconstruir está clara.",
  his_will: "Você também percebe sinais de disposição do outro, o que não pode ser ignorado.",
};

export const PROFILE_DESCRIPTIONS: Record<ProfileKey, string> = {
  overload: "Divisão desigual, carga mental alta, dificuldade de soltar o que o outro assume e a sensação de que, se você parar, tudo para. Nas suas respostas, essa é a forma que mais aparece quando a relação entra em tensão.",
  demand_withdraw: "Quando sente distância ou falta de resposta, você insiste, explica de novo ou cobra; ele responde com menos presença. Nas suas respostas, essa é a sequência que mais aparece quando a relação entra em tensão.",
  emotional_baggage: "Algumas reações suas de hoje coincidem com formas de lidar com conflito que você viu na casa em que cresceu. Nas suas respostas, essa coincidência aparece com clareza suficiente para merecer atenção.",
  knows_but_repeats: "Você já tentou caminhos diferentes, buscou ajuda ou conteúdo e entende boa parte do que acontece. Ainda assim, algumas respostas continuam voltando ao mesmo lugar. Nas suas respostas, essa distância entre entender e conseguir fazer diferente é o que mais aparece.",
};
