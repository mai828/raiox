import type { QuestionConfig, DimensionKey, SegmentKey } from "@/types";

export const QUIZ_VERSION = "2.0.0";

export const DIMENSION_LABELS: Record<DimensionKey, string> = {
  connection: "Conexão e presença",
  conversation: "Conversa e reparação",
  partnership: "Parceria e reciprocidade",
  affection: "Afeto e intimidade",
  respect_future: "Respeito, confiança e futuro",
};

export const SEGMENTS: { key: SegmentKey; label: string }[] = [
  { key: "context_connection", label: "Contexto e conexão" },
  { key: "conversation", label: "Conversa" },
  { key: "partnership", label: "Parceria" },
  { key: "intimacy_future", label: "Intimidade e futuro" },
  { key: "repetition", label: "Repetição" },
  { key: "direction", label: "Direção" },
];

const d = (dimension: DimensionKey, score: number | null) => [{ dimension, score }];

export const QUESTIONS: QuestionConfig[] = [
  // ---------------------------------------------------------------- CONTEXTO
  {
    id: "Q01", field: "relationship_status", segment: "context_connection", type: "single",
    text: "Qual dessas situações descreve melhor vocês hoje?",
    options: [
      { id: "A", label: "Casados ou morando juntos" },
      { id: "B", label: "Juntos, mas morando separados" },
      { id: "C", label: "Separados, mas ainda decidindo o futuro da relação" },
      { id: "D", label: "Não estou em um relacionamento hoje", flags: ["not_in_relationship"] },
    ],
  },
  {
    id: "Q02", field: "relationship_years", segment: "context_connection", type: "single",
    text: "Há quanto tempo vocês estão juntos?",
    helper: "Tempo de relação não diz sozinho como um casal está. Mas muda muito a quantidade de história que existe entre duas pessoas.",
    options: [
      { id: "lt2", label: "Menos de 2 anos" },
      { id: "2_5", label: "2 a 5 anos" },
      { id: "6_10", label: "6 a 10 anos" },
      { id: "11_20", label: "11 a 20 anos" },
      { id: "gt20", label: "Mais de 20 anos" },
    ],
  },
  {
    id: "Q03", field: "has_children_context", segment: "context_connection", type: "single",
    text: "Vocês têm filhos?",
    options: [
      { id: "no", label: "Não" },
      { id: "yes_home", label: "Sim, moram conosco" },
      { id: "yes_away", label: "Sim, mas não moram conosco" },
      { id: "previous", label: "Temos filhos de relações anteriores" },
      { id: "na", label: "Prefiro não responder" },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 1 · CONEXÃO
  {
    id: "Q04", field: "connection_moments", segment: "context_connection", type: "single",
    text: "Pensando nos últimos 7 dias, quantas vezes vocês tiveram um momento juntos que não era para resolver filho, casa, dinheiro, trabalho ou algum problema?",
    dimensions: [{ dimension: "connection", weight: 1 }],
    options: [
      { id: "none", label: "Nenhuma", dimensions: d("connection", 0) },
      { id: "one", label: "Uma vez", dimensions: d("connection", 1) },
      { id: "two_three", label: "Duas ou três vezes", dimensions: d("connection", 3) },
      { id: "four_plus", label: "Quatro vezes ou mais", dimensions: d("connection", 4) },
      { id: "together_distant", label: "Tivemos momentos juntos, mas mesmo assim senti distância", dimensions: d("connection", 1) },
    ],
  },
  {
    id: "Q05", field: "emotional_access", segment: "context_connection", type: "single",
    text: "Quando alguma coisa importante acontece com você, quanto seu parceiro costuma saber do que realmente está se passando?",
    dimensions: [{ dimension: "connection", weight: 1 }],
    options: [
      { id: "knows", label: "Normalmente ele sabe e eu consigo conversar sobre isso.", dimensions: d("connection", 4) },
      { id: "part", label: "Sabe uma parte, mas muita coisa eu guardo.", dimensions: d("connection", 3) },
      { id: "facts", label: "Eu conto os fatos, mas quase nunca como aquilo me afetou.", dimensions: d("connection", 2) },
      { id: "solve_first", label: "Eu normalmente resolvo primeiro e conto depois, se contar.", dimensions: d("connection", 1) },
      { id: "rarely", label: "Hoje quase não dividimos esse tipo de coisa.", dimensions: d("connection", 0) },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 2 · CONVERSA
  {
    id: "Q06", field: "conflict_entry", segment: "conversation", type: "single",
    text: "Pensa nas últimas três conversas importantes que terminaram mal. Como elas normalmente começaram?",
    options: [
      { id: "me", label: "Eu trouxe alguma coisa que estava me incomodando." },
      { id: "him", label: "Ele trouxe alguma coisa que estava incomodando." },
      { id: "practical", label: "Um problema prático acabou virando uma discussão maior." },
      { id: "small_old", label: "Uma coisa pequena abriu assuntos antigos." },
      { id: "no_pattern", label: "Não consigo encontrar um padrão claro." },
    ],
  },
  {
    id: "Q07", field: "conflict_derail", segment: "conversation", type: "single",
    text: "Quando vocês percebem que a conversa está saindo do lugar, o que costuma acontecer primeiro?",
    dimensions: [{ dimension: "conversation", weight: 1.25 }],
    options: [
      { id: "A", label: "Eu continuo puxando a conversa porque não consigo deixar pela metade.", dimensions: d("conversation", 1), profileEffects: { demand_withdraw: 2 } },
      { id: "B", label: "Ele se fecha ou começa a responder cada vez menos.", dimensions: d("conversation", 1), profileEffects: { demand_withdraw: 2 } },
      { id: "C", label: "Um de nós encerra a conversa, sai ou muda completamente de assunto.", dimensions: d("conversation", 0) },
      { id: "D", label: "O assunto vira uma lista de coisas antigas.", dimensions: d("conversation", 0) },
      { id: "E", label: "O tom sobe dos dois lados.", dimensions: d("conversation", 0) },
      { id: "F", label: "Conseguimos parar antes de piorar e retomar depois.", dimensions: d("conversation", 4) },
    ],
  },
  {
    id: "Q08", field: "conflict_repair", segment: "conversation", type: "single",
    text: "Depois de uma discussão importante, como vocês normalmente voltam um para o outro?",
    dimensions: [{ dimension: "conversation", weight: 1.25 }],
    options: [
      { id: "resumed", label: "Um de nós procura o outro e o assunto é realmente retomado.", dimensions: d("conversation", 4) },
      { id: "peace_unresolved", label: "Fazemos as pazes, mas o assunto quase nunca é resolvido.", dimensions: d("conversation", 2) },
      { id: "time_passes", label: "O tempo passa e voltamos ao normal sem conversar.", dimensions: d("conversation", 1) },
      { id: "me_first", label: "Eu normalmente procuro primeiro.", dimensions: d("conversation", 2), profileEffects: { demand_withdraw: 1 } },
      { id: "him_first", label: "Ele normalmente procura primeiro.", dimensions: d("conversation", 2) },
      { id: "days_apart", label: "Às vezes ficamos dias emocionalmente afastados.", dimensions: d("conversation", 0) },
    ],
  },
  {
    id: "Q09", field: "conflict_repetition", segment: "conversation", type: "single",
    text: "Qual dessas situações mais se parece com as discussões que vocês têm hoje?",
    dimensions: [{ dimension: "conversation", weight: 1 }],
    options: [
      { id: "same_fight", label: "Os assuntos mudam, mas a discussão parece sempre a mesma.", dimensions: d("conversation", 0), profileEffects: { demand_withdraw: 1 } },
      { id: "one_two_themes", label: "Existe um ou dois temas específicos que nunca terminam.", dimensions: d("conversation", 1), profileEffects: { demand_withdraw: 1 } },
      { id: "many", label: "Brigamos por várias coisas diferentes.", dimensions: d("conversation", 1) },
      { id: "avoid", label: "As discussões diminuíram porque evitamos certos assuntos.", dimensions: d("conversation", 0) },
      { id: "resolve", label: "Conseguimos resolver boa parte do que aparece.", dimensions: d("conversation", 4) },
    ],
  },
  {
    id: "Q10", field: "conflict_respect", segment: "conversation", type: "single",
    text: "Mesmo nas discussões mais difíceis, qual dessas situações está mais próxima da realidade de vocês?",
    dimensions: [{ dimension: "conversation", weight: 1 }, { dimension: "respect_future", weight: 1 }],
    options: [
      { id: "respect", label: "Conseguimos discordar sem humilhar ou ameaçar um ao outro.", dimensions: [{ dimension: "conversation", score: 4 }, { dimension: "respect_future", score: 4 }] },
      { id: "irony", label: "Às vezes aparecem ironias, deboche ou frases que machucam.", dimensions: [{ dimension: "conversation", score: 2 }, { dimension: "respect_future", score: 2 }] },
      { id: "insults", label: "Insultos ou humilhações acontecem com alguma frequência.", dimensions: [{ dimension: "conversation", score: 1 }, { dimension: "respect_future", score: 1 }] },
      { id: "my_fear", label: "Eu evito falar determinadas coisas porque tenho medo da reação dele.", dimensions: [{ dimension: "conversation", score: 0 }, { dimension: "respect_future", score: 0 }], flags: ["safety_preflag"] },
      { id: "his_fear", label: "Ele evita falar determinadas coisas porque parece ter medo da minha reação.", dimensions: [{ dimension: "conversation", score: 0 }, { dimension: "respect_future", score: 0 }] },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 3 · PARCERIA
  {
    id: "Q11", field: "responsibility_split", segment: "partnership", type: "single",
    text: "Na prática, como as responsabilidades da vida de vocês são divididas hoje?",
    helper: "Pensa em casa, rotina, decisões, {filhos}compromissos e tudo que precisa acontecer para a vida funcionar.",
    dimensions: [{ dimension: "partnership", weight: 1.25 }],
    options: [
      { id: "balanced", label: "Existe uma divisão relativamente equilibrada.", dimensions: d("partnership", 4) },
      { id: "areas", label: "Cada um cuida de áreas diferentes, mas algumas pesam muito mais.", dimensions: d("partnership", 3) },
      { id: "me_more", label: "Eu faço uma parte maior.", dimensions: d("partnership", 2), profileEffects: { overload: 2 } },
      { id: "me_almost_all", label: "Eu faço quase tudo.", dimensions: d("partnership", 0), profileEffects: { overload: 3 } },
      { id: "him_more", label: "Ele faz uma parte maior.", dimensions: d("partnership", 2) },
    ],
  },
  {
    id: "Q12", field: "mental_load", segment: "partnership", type: "single",
    text: "Mesmo quando ele faz alguma tarefa, com que frequência você ainda precisa lembrar, organizar, pedir, acompanhar ou conferir?",
    dimensions: [{ dimension: "partnership", weight: 1.25 }],
    options: [
      { id: "rarely", label: "Quase nunca.", dimensions: d("partnership", 4) },
      { id: "sometimes", label: "Às vezes.", dimensions: d("partnership", 3) },
      { id: "often", label: "Com frequência.", dimensions: d("partnership", 2), profileEffects: { overload: 2 } },
      { id: "almost_always", label: "Quase sempre.", dimensions: d("partnership", 0), profileEffects: { overload: 3 } },
      { id: "na", label: "Essa situação não se aplica muito à nossa rotina.", dimensions: d("partnership", null) },
    ],
  },
  {
    id: "Q13", field: "delegation_response", segment: "partnership", type: "single",
    text: "Quando seu parceiro assume alguma coisa, mas faz de um jeito diferente do que você faria, o que costuma acontecer?",
    dimensions: [{ dimension: "partnership", weight: 1 }],
    options: [
      { id: "let_go", label: "Eu deixo com ele, mesmo que faça diferente.", dimensions: d("partnership", 4) },
      { id: "guide", label: "Dou algumas orientações, mas consigo soltar.", dimensions: d("partnership", 3) },
      { id: "monitor", label: "Acabo acompanhando para garantir que dê certo.", dimensions: d("partnership", 2), profileEffects: { overload: 1 } },
      { id: "redo", label: "Muitas vezes refaço ou assumo de volta.", dimensions: d("partnership", 0), profileEffects: { overload: 2 } },
      { id: "depends", label: "Depende muito do que está em jogo.", dimensions: d("partnership", 2) },
    ],
  },
  {
    id: "Q14", field: "asking_for_support", segment: "partnership", type: "single",
    text: "Quando você está sobrecarregada e precisa de ajuda, o que normalmente acontece?",
    dimensions: [{ dimension: "partnership", weight: 1 }],
    options: [
      { id: "ask_clearly", label: "Eu peço claramente o que preciso.", dimensions: d("partnership", 4) },
      { id: "wait_notice", label: "Eu espero que ele perceba e fico frustrada quando não percebe.", dimensions: d("partnership", 1) },
      { id: "ask_at_limit", label: "Eu peço quando já estou no limite.", dimensions: d("partnership", 1), profileEffects: { overload: 1 } },
      { id: "do_alone", label: "Faço sozinha porque explicar ou pedir parece dar mais trabalho.", dimensions: d("partnership", 0), profileEffects: { overload: 2 } },
      { id: "ask_no_result", label: "Eu peço, mas frequentemente não acontece.", dimensions: d("partnership", 1), profileEffects: { overload: 1 } },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 4 · AFETO, INTIMIDADE E FUTURO
  {
    id: "Q15", field: "affection", segment: "intimacy_future", type: "single",
    text: "Pensando no último mês, como está o carinho entre vocês fora dos momentos sexuais?",
    dimensions: [{ dimension: "affection", weight: 1 }],
    options: [
      { id: "natural", label: "Acontece naturalmente no dia a dia.", dimensions: d("affection", 4) },
      { id: "less", label: "Existe, mas diminuiu bastante.", dimensions: d("affection", 3) },
      { id: "one_sided", label: "Normalmente parte mais de um de nós.", dimensions: d("affection", 2) },
      { id: "almost_gone", label: "Quase desapareceu.", dimensions: d("affection", 1) },
      { id: "forced", label: "Hoje o carinho muitas vezes parece estranho ou forçado.", dimensions: d("affection", 0) },
    ],
  },
  {
    id: "Q16", field: "sexual_intimacy", segment: "intimacy_future", type: "single",
    text: "Em relação à vida íntima de vocês, qual frase está mais perto da realidade hoje?",
    dimensions: [{ dimension: "affection", weight: 1 }],
    options: [
      { id: "good", label: "Está boa para os dois.", dimensions: d("affection", 4) },
      { id: "less", label: "Existe, mas menos do que eu gostaria.", dimensions: d("affection", 3) },
      { id: "desire_gap", label: "Existe uma diferença grande de desejo entre nós.", dimensions: d("affection", 2) },
      { id: "rare", label: "Virou algo raro.", dimensions: d("affection", 1) },
      { id: "none", label: "Praticamente deixou de existir.", dimensions: d("affection", 0) },
      { id: "na", label: "Prefiro não responder.", dimensions: d("affection", null) },
    ],
  },
  {
    id: "Q17", field: "feeling_seen", segment: "intimacy_future", type: "single",
    text: "Qual foi a última vez em que você sentiu que ele realmente percebeu alguma coisa importante em você sem você precisar pedir?",
    dimensions: [{ dimension: "connection", weight: 1 }],
    options: [
      { id: "days", label: "Nos últimos dias.", dimensions: d("connection", 4) },
      { id: "weeks", label: "Nas últimas semanas.", dimensions: d("connection", 3) },
      { id: "months", label: "Nos últimos meses.", dimensions: d("connection", 2) },
      { id: "long", label: "Faz bastante tempo.", dimensions: d("connection", 1) },
      { id: "cant_remember", label: "Não consigo lembrar.", dimensions: d("connection", 0) },
    ],
  },
  {
    id: "Q18", field: "admiration", segment: "intimacy_future", type: "single",
    text: "Hoje, quando você olha para o seu parceiro, qual dessas frases está mais perto do que sente?",
    dimensions: [{ dimension: "respect_future", weight: 1 }],
    options: [
      { id: "admire", label: "Ainda admiro muito quem ele é.", dimensions: d("respect_future", 4) },
      { id: "less", label: "Ainda existe admiração, mas ela diminuiu.", dimensions: d("respect_future", 3) },
      { id: "care_lost", label: "Tenho carinho, mas perdi parte da admiração.", dimensions: d("respect_future", 2) },
      { id: "flaws", label: "Hoje vejo mais defeitos do que aquilo que admiro.", dimensions: d("respect_future", 1) },
      { id: "tired", label: "Estou tão cansada da relação que tenho dificuldade de responder.", dimensions: d("respect_future", 0) },
    ],
  },
  {
    id: "Q19", field: "future_orientation", segment: "intimacy_future", type: "single",
    text: "Quando vocês falam sobre os próximos anos, o que acontece?",
    dimensions: [{ dimension: "respect_future", weight: 1 }],
    options: [
      { id: "built_together", label: "Temos planos que realmente construímos juntos.", dimensions: d("respect_future", 4) },
      { id: "intention", label: "Existem planos, mas quase sempre ficam no campo da intenção.", dimensions: d("respect_future", 3) },
      { id: "separate", label: "Cada um parece pensar mais no próprio futuro.", dimensions: d("respect_future", 2) },
      { id: "avoid", label: "Evitamos conversar sobre futuro.", dimensions: d("respect_future", 1) },
      { id: "cant_imagine", label: "Hoje eu nem sei se consigo imaginar esse futuro juntos.", dimensions: d("respect_future", 0) },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 5 · REPETIÇÃO
  {
    id: "Q20", field: "distance_response", segment: "repetition", type: "single",
    text: "Quando você percebe seu parceiro mais distante, qual costuma ser sua primeira reação?",
    options: [
      { id: "ask_directly", label: "Pergunto diretamente o que está acontecendo." },
      { id: "approach", label: "Tento me aproximar mais.", profileEffects: { demand_withdraw: 1 } },
      { id: "demand", label: "Cobro atenção ou uma resposta.", profileEffects: { demand_withdraw: 2 } },
      { id: "withdraw", label: "Também me afasto.", profileEffects: { demand_withdraw: 1 } },
      { id: "pretend", label: "Finjo que não me importo, mas fico remoendo.", profileEffects: { emotional_baggage: 1 } },
      { id: "depends", label: "Depende muito da situação." },
    ],
  },
  {
    id: "Q21", field: "disappointment_response", segment: "repetition", type: "single",
    text: "Quando ele não faz algo que você esperava, o que mais costuma acontecer?",
    options: [
      { id: "say_clearly", label: "Eu falo claramente sobre aquilo.", adaptive: 1 },
      { id: "explain_repeat", label: "Tento explicar várias vezes até ele entender.", profileEffects: { demand_withdraw: 2 } },
      { id: "do_myself", label: "Faço eu mesma.", profileEffects: { overload: 2 } },
      { id: "keep_change", label: "Guardo, mas fico diferente com ele.", profileEffects: { emotional_baggage: 1 } },
      { id: "bring_old", label: "Acabo trazendo outras coisas que já aconteceram.", profileEffects: { demand_withdraw: 1 } },
      { id: "evaluate", label: "Consigo avaliar se aquilo precisa mesmo virar uma conversa.", adaptive: 2 },
    ],
  },
  {
    id: "Q22", field: "childhood_conflict_pattern", segment: "repetition", type: "single",
    text: "Na casa onde você cresceu, quando havia conflito entre os adultos, o que você mais via acontecer?",
    options: [
      { id: "agreement", label: "Conversavam até chegar a algum acordo." },
      { id: "talk_close", label: "Um falava muito e o outro se fechava." },
      { id: "silence", label: "As pessoas paravam de se falar." },
      { id: "ceding", label: "Um acabava cedendo para a briga terminar." },
      { id: "escalation", label: "Havia gritos ou discussões fortes." },
      { id: "hidden", label: "Os problemas eram escondidos ou fingiam que nada aconteceu." },
      { id: "no_pattern", label: "Não consigo identificar um padrão." },
    ],
  },
  {
    id: "Q23", field: "letting_go_fear", segment: "repetition", type: "single",
    text: "Se durante uma semana você parasse de antecipar, lembrar, resolver e segurar tudo que normalmente segura, o que mais te preocuparia?",
    options: [
      { id: "not_done", label: "As coisas simplesmente não seriam feitas.", profileEffects: { overload: 2 } },
      { id: "partner_not_assume", label: "Meu parceiro não assumiria.", profileEffects: { overload: 2 } },
      { id: "chaos", label: "Tudo viraria uma bagunça.", profileEffects: { overload: 1 } },
      { id: "guilt", label: "Eu me sentiria culpada.", profileEffects: { emotional_baggage: 2 } },
      { id: "anxiety", label: "Eu ficaria ansiosa sem saber se daria certo.", profileEffects: { emotional_baggage: 2 } },
      { id: "would_work", label: "Sinceramente, acho que as coisas continuariam funcionando.", adaptive: 1 },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 6 · RECURSOS E TENTATIVAS
  {
    id: "Q24", field: "preserved_resources", segment: "repetition", type: "multi",
    text: "Mesmo com os problemas atuais, o que ainda existe entre vocês?",
    helper: "Pode marcar mais de uma.",
    options: [
      { id: "humor", label: "Ainda conseguimos rir e nos divertir.", tag: "humor" },
      { id: "affection", label: "Existe carinho.", tag: "affection" },
      { id: "respect", label: "Existe respeito.", tag: "respect" },
      { id: "partnership", label: "Somos parceiros em momentos difíceis.", tag: "partnership" },
      { id: "desire", label: "Existe desejo ou atração.", tag: "desire" },
      { id: "projects", label: "Temos projetos importantes em comum.", tag: "projects" },
      { id: "my_will", label: "Eu ainda sinto vontade real de reconstruir.", tag: "my_will" },
      { id: "his_will", label: "Ele demonstra vontade de melhorar.", tag: "his_will" },
      { id: "hard_to_see", label: "Hoje tenho dificuldade de enxergar algo preservado.", exclusive: true, tag: "hard_to_see" },
    ],
  },
  {
    id: "Q25", field: "previous_attempts", segment: "repetition", type: "multi",
    text: "O que você já tentou fazer para melhorar essa relação?",
    helper: "Pode marcar mais de uma.",
    options: [
      { id: "talk_differently", label: "Conversar de outro jeito.", tag: "talk_differently" },
      { id: "demand_less", label: "Cobrar menos.", tag: "demand_less" },
      { id: "demand_clearly", label: "Cobrar mais claramente.", tag: "demand_clearly" },
      { id: "therapy_individual", label: "Terapia individual.", tag: "therapy_individual" },
      { id: "therapy_couple", label: "Terapia de casal.", tag: "therapy_couple" },
      { id: "course_book", label: "Curso, livro ou conteúdo.", tag: "course_book" },
      { id: "give_space", label: "Dar mais espaço.", tag: "give_space" },
      { id: "do_more", label: "Fazer mais para tentar melhorar o ambiente.", tag: "do_more" },
      { id: "change_self", label: "Mudar meu próprio comportamento.", tag: "change_self" },
      { id: "considered_leaving", label: "Já pensei seriamente em terminar ou me separar.", tag: "considered_leaving" },
      { id: "nothing", label: "Ainda não tentei muita coisa.", exclusive: true, tag: "nothing" },
    ],
  },
  // ---------------------------------------------------------------- MOVIMENTO 7 · DIREÇÃO
  {
    id: "Q26", field: "goal_90_days", segment: "direction", type: "single",
    text: "Se daqui a 90 dias uma única coisa estivesse realmente diferente entre vocês, qual mudança faria mais diferença para você?",
    options: [
      { id: "conversation", label: "Conseguir conversar sem acabar sempre no mesmo lugar." },
      { id: "partnership", label: "Sentir que tenho um parceiro e não mais uma responsabilidade." },
      { id: "affection", label: "Voltar a sentir proximidade e intimidade." },
      { id: "respect_future", label: "Voltar a admirar e me sentir admirada." },
      { id: "clarity", label: "Ter clareza se ainda existe casamento para reconstruir." },
      { id: "both_trying", label: "Sentir que nós dois estamos realmente tentando." },
    ],
  },
  {
    id: "Q27", field: "problem_duration", segment: "direction", type: "single",
    text: "Há quanto tempo você sente que o relacionamento está preso nesse lugar?",
    options: [
      { id: "lt3m", label: "Menos de 3 meses" },
      { id: "3_6m", label: "3 a 6 meses" },
      { id: "6m_1y", label: "6 meses a 1 ano" },
      { id: "1_3y", label: "1 a 3 anos" },
      { id: "gt3y", label: "Mais de 3 anos" },
    ],
  },
  {
    id: "Q28", field: "urgency_score", segment: "direction", type: "scale",
    text: "Se nada mudar, quanto isso te preocupa hoje?",
    scale: { min: 0, max: 10, minLabel: "Consigo conviver com isso", maxLabel: "Me preocupa muito" },
  },
  {
    id: "Q29", field: "start_readiness", segment: "direction", type: "single",
    text: "Se você entendesse com clareza o que precisa mudar e tivesse um caminho para trabalhar isso, qual frase mais parece com o seu momento?",
    options: [
      { id: "now", label: "Eu começaria agora." },
      { id: "weeks", label: "Eu começaria nas próximas semanas." },
      { id: "organize", label: "Eu gostaria, mas precisaria me organizar." },
      { id: "unsure", label: "Ainda não sei se quero mexer nisso." },
      { id: "understand_only", label: "Hoje eu só quero entender melhor o que está acontecendo." },
    ],
  },
  {
    id: "Q30", field: "investment_capacity", segment: "direction", type: "single", requireConfirm: true,
    text: "Se depois de entender o seu caso fizer sentido começar um processo individual, qual dessas frases representa melhor seu momento hoje?",
    options: [
      { id: "can", label: "Consigo investir R$ 2.500 se enxergar que faz sentido para mim." },
      { id: "organize", label: "Eu precisaria me organizar, mas poderia considerar esse investimento." },
      { id: "no_budget", label: "Hoje R$ 2.500 não cabe no meu orçamento." },
      { id: "no_intent", label: "Neste momento não pretendo investir em acompanhamento." },
    ],
  },
  {
    id: "Q31", field: "safety_status", segment: "direction", type: "single", requireConfirm: true,
    preface: "Antes de fechar sua leitura, preciso checar uma coisa importante.",
    text: "Hoje existe ameaça, agressão, coerção ou medo real de que uma conversa, decisão ou reação do seu parceiro possa colocar você ou alguém da casa em risco?",
    options: [
      { id: "yes", label: "Sim, isso existe hoje.", flags: ["safety_flag"] },
      { id: "past", label: "Já aconteceu, mas não é a situação atual.", flags: ["safety_history_flag"] },
      { id: "no", label: "Não." },
    ],
  },
];

export const QUESTION_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q])) as Record<string, QuestionConfig>;

export function optionLabel(qid: string, optionId: string | undefined | null): string | null {
  if (!optionId) return null;
  return QUESTION_BY_ID[qid]?.options?.find((o) => o.id === optionId)?.label ?? null;
}
