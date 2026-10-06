# D a K · Scoring, índice, ponto de atenção, perfis, prontidão, aderência e segurança

A referência executável de tudo que está aqui é `scripts/score.py`. Se este documento e o script divergirem, o script vence e o documento deve ser corrigido.

## D · Tabela completa de scoring dos cinco pilares

Escala-base por alternativa: 0 = padrão muito comprometido / baixa reorganização; 1 = comprometimento relevante; 2 = consciência ou reorganização intermediária; 3 = maior consciência / capacidade de reorganização. A disposição na tela nunca segue a ordem 0-1-2-3 (ver coluna "ordem da tela": as letras são o id interno da alternativa, a sequência é a ordem exibida).

Pesos: 1.0 como padrão; 1.25 para os sinais de maior peso diagnóstico (solidão emocional, repetição das mesmas discussões, ciclo cobrança-afastamento, dificuldade grave de limites, distância entre compreender e agir). Nenhum peso acima de 1.5.

<!-- GEN:SCORING_TABLE -->
| Pilar | Pergunta | Peso | Alternativas e scores (ordem da tela) | Máximo ponderado |
|---|---|---|---|---|
| **P1** · Clareza sobre o problema e consciência do padrão | Q01 | 1.0 | C=1 · A=0 · D=1 · B=2 · E=1 | **6** |
|  | Q16 | 1.0 | B=1 · A=0 · D=2 · C=1 · E=3 |  |
| **P2** · História, família de origem e mochila emocional | Q12 | 1.0 | A=1 · E=2 · B=1 · F=3 · C=1 · D=0 | **6** |
|  | Q13 | 1.0 | B=1 · A=0 · D=3 · C=2 · E=0 |  |
| **P3** · Dinâmica relacional, presença e conexão | Q05 | 1.25 | B=1 · A=0 · E=3 · C=0 · D=2 | **11.25** |
|  | Q09 | 1.25 | B=1 · A=0 · F=3 · D=2 · C=1 · E=0 |  |
|  | Q11 | 1.25 | C=1 · A=0 · E=2 · B=1 · F=3 · D=1 |  |
| **P4** · Responsabilidade, limites e papéis | Q06 | 1.0 | B=1 · E=3 · A=0 · C=2 · D=0 | **9.75** |
|  | Q14 | 1.25 | B=0 · C=1 · A=0 · E=3 · D=2 · F=0 |  |
|  | Q17 | 1.0 | B=2 · D=0 · A=3 · E=2 · C=1 |  |
| **P5** · Reorganização, decisão e capacidade de agir | Q10 | 1.0 | C=1 · A=0 · E=3 · B=1 · D=2 · F=0 | **6.75** |
|  | Q15 | 1.25 | B=1 · D=3 · A=0 · E=1 · C=2 |  |
<!-- /GEN:SCORING_TABLE -->

Perguntas que **não** pontuam pilares: Q02–Q04 (contexto), Q07 e Q08 (repetição e tentativas, alimentam prontidão e flags), Q18–Q21 (prontidão).

### Normalização de cada pilar (0 a 100)

```
pillar_score = round( soma(score_da_alternativa × peso_da_pergunta) / máximo_ponderado_do_pilar × 100 )
```

| Pilar | Perguntas | Máximo ponderado | Granularidade |
|---|---|---|---|
| P1 Clareza | Q01, Q16 | 6.00 | passos de ~17 |
| P2 História | Q12, Q13 | 6.00 | passos de ~17 |
| P3 Dinâmica relacional | Q05, Q09, Q11 | 11.25 | passos de ~11 |
| P4 Limites e papéis | Q06, Q14, Q17 | 9.75 | passos de ~10 a 13 |
| P5 Reorganização e ação | Q10, Q15 | 6.75 | passos de ~15 a 19 |

Quanto **maior** o score, maior a capacidade atual de consciência e reorganização naquele pilar. Quanto **menor**, maior a presença de padrões que merecem atenção.

## E · Índice de Reorganização Relacional (IRC)

```
IRC = round( (P1 + P2 + P3 + P4 + P5) / 5 )
```

Pesos iguais na versão 1. O IRC não é nota de casamento bom ou ruim. É uma leitura da capacidade atual de reconhecer padrões e reorganizar respostas dentro do contexto avaliado. Faixas:

| Faixa | Nome (campo `irc_band`) | Leitura interna |
|---|---|---|
| 0–24 | **No automático** (`automatic`) | Padrões muito ativos, baixa capacidade atual de reorganização. |
| 25–49 | **Começando a enxergar** (`emerging`) | Consciência emergente, porém grande repetição. |
| 50–74 | **Enxergando, mas ainda repetindo** (`aware_but_repeating`) | Consciência relevante com pontos importantes ainda presos ao padrão. |
| 75–100 | **Com a mão no volante** (`hands_on_wheel`) | Maior capacidade de percepção, limites e ação. |

## F · Regra do Principal Ponto de Atenção

Regra padrão: o pilar com **menor** score.

Empate: quando dois ou mais pilares estão a 5 pontos ou menos do menor, todos entram como candidatos e passam, nesta ordem, pelos critérios:

1. **Intensidade dos sinais críticos**: quantidade de flags de risco disparadas em perguntas daquele pilar (cada flag conta 1; flags de segurança não contam aqui; `repetition_intense` não pertence a pilar). Vence quem tem mais.
2. **Quantidade de respostas com score 0** no pilar. Vence quem tem mais.
3. **Peso diagnóstico das perguntas** em que a pessoa pontuou 0 (soma dos pesos). Vence quem tem mais.
4. **Impacto sobre a dinâmica relacional atual**, ordem fixa: P3 > P4 > P5 > P1 > P2.

No resultado, apresentado sempre como leitura, nunca como diagnóstico: "Pelas suas respostas, este parece ser o ponto que mais merece atenção agora." Nunca "seu problema é".

Campo: `main_attention_point` ∈ {`clarity`, `history`, `relationship`, `boundaries`, `action`}. Tag correspondente `ATTENTION_*`.

### Leitura complementar dos pilares (usada na tela de resultado)

- **Ponto de maior repetição** = Principal Ponto de Atenção.
- **Ponto de maior consciência** = pilar com maior score (empate: o de menor impacto relacional, para não repetir o eixo principal).
- **Ponto de maior possibilidade de reorganização** = entre os pilares intermediários (nem o menor, nem o maior), o que tem menos sinais críticos; em empate, o de maior score; depois, ordem de impacto. É onde a alavanca é mais acessível.

## G · Regra dos quatro perfis

Sistema **separado** dos pilares. Cada alternativa pode dar 0, 1 ou 2 pontos a um ou mais perfis (ver fichas em `02-perguntas.md`). Somas:

| Campo | Perfil | Sinais que alimentam |
|---|---|---|
| `profile_overload` | A · A Sobrecarregada | Faço tudo sozinha (Q01), irritação ao vê-lo descansar (Q05), carrego tudo / só se eu pedir / assumi para não brigar (Q06), compenso cuidando mais (Q11), mãe que carregava tudo (Q12), "é o meu jeito em todo lugar" (Q13), "já olhei demais para mim" (Q17). |
| `profile_demand_withdraw` | B · Presa no ciclo cobrança-afastamento | Ele não muda (Q01, Q16), solidão / cada um no seu canto / já sei como termina (Q05), ele se fecha e eu insisto (Q09), vou atrás e cobro (Q11), culpa dele / só se ele mudar primeiro (Q14), DRs e ultimatos (Q08). |
| `profile_emotional_baggage` | C · Repetindo a mochila emocional | Talvez o problema seja eu (Q01), "não lembro de ter sido diferente" (Q07), mudar meu jeito/ceder (Q08), me fecho / remoendo / compenso (Q11), cenas de origem (Q12), nunca olhei isso (Q13), a culpa é minha (Q14, Q16). |
| `profile_knows_but_repeats` | D · A que já entendeu, mas continua repetindo | Sei explicar mas não consigo fazer diferente (Q01), terapia/cursos/mentoria (Q08), voltamos ao mesmo lugar (Q09), "havia algo que eu podia ter feito" (Q10), percebo o ciclo (Q11), nomear eu consigo (Q12), o automático vence (Q13), vai e volta / controlo a parte dele (Q14), na hora H some (Q15), "já sei a minha parte" (Q17). |

O perfil predominante é o de maior pontuação. Cada pessoa recebe **um** perfil.

## H · Regras de desempate (perfil)

Em empate na pontuação de perfil:

1. **Pontos obtidos em perguntas de peso 1.25** (Q05, Q09, Q11, Q14, Q15). Vence quem tem mais.
2. **Quantidade de sinais fortes**: alternativas que deram +2 àquele perfil. Vence quem tem mais.
3. **Perfil que melhor explica o Principal Ponto de Atenção** identificado no Raio-X, por mapeamento fixo: `clarity` → B; `history` → C; `relationship` → B; `boundaries` → A; `action` → D.

O desempate do Ponto de Atenção está em F. Os dois sistemas se encontram apenas no critério 3 acima, e só como último recurso.

## I · Scoring de prontidão comercial

Score **separado** do sofrimento emocional. Sete critérios binários, cada um vale 1:

| # | Critério | Fonte | Regra |
|---|---|---|---|
| 1 | Problema ativo ou recorrente há 6 meses ou mais | Q07 | qualquer alternativa exceto "menos de 6 meses" |
| 2 | Já tentou pelo menos duas soluções | Q08 | `previous_solutions_count ≥ 2` |
| 3 | Urgência 7/10 ou maior | Q18 | `urgency_score ≥ 7` |
| 4 | Aceita investigar a própria participação | Q17 | "quero ver", "toparia olhar", "já sei a minha parte" |
| 5 | Disponibilidade para começar em 30 dias | Q19 | "agora" ou "até 30 dias" |
| 6 | Capacidade de investir ~R$ 7.500 | Q20 | "cabe", "cabe com planejamento", "cabe, envolvendo meu marido" (esta última gera a flag `decision_shared`) |
| 7 | Quer agir e construir, não só validação | Q21 | "entender e agir sobre a minha parte" ou "decidir se fico ou vou" (esta última gera `decision_stay_or_leave`) |

```
commercial_readiness = soma dos critérios atendidos (0 a 7)
```

| Score | `commercial_classification` | Tag | Rota padrão |
|---|---|---|---|
| 0–2 | `low` · Baixa prontidão | READINESS_LOW | nurture |
| 3 | `medium` · Prontidão intermediária | READINESS_MEDIUM | nurture (com chamada para conversa em 2 a 3 semanas) |
| 4–5 | `qualified` · Lead qualificada | READINESS_QUALIFIED | sales_triage |
| 6–7 | `high` · Alta prioridade comercial | READINESS_HIGH | sales_triage (prioridade de atendimento) |

Pronta para conversa comercial: pelo menos 4 dos 7 fatores. Flags de segurança e de baixa aderência sobrepõem a rota, nunca o score (ver J e K).

## J · Regras de baixa aderência

Flags independentes, disparadas por alternativas específicas. Não reduzem o IRC nem alteram perfil.

| Flag | Frase equivalente do briefing | Onde aparece |
|---|---|---|
| `partner_must_change` | "Meu parceiro precisa mudar. Eu não." | Q14 · "Nele. Quem precisa mudar aqui é ele, não eu." |
| `only_if_partner_first` | "Só faria alguma coisa se ele mudasse primeiro." | Q14 · "Eu só faria alguma coisa diferente se ele mudasse primeiro." |
| `wants_partner_fixed` | "Quero alguém que faça meu parceiro mudar." | Q21 · "Alguém que faça o meu marido mudar." |
| `guarantee_required` | "Só me interessa se houver garantia de salvar meu casamento." | Q21 · "Só me interessa se tiver garantia de salvar o meu casamento." |
| `nothing_to_investigate` | "Não vejo nada que eu possa ou queira investigar em mim." | Q17 · "Não vejo nada que eu possa ou queira investigar em mim nessa história." |

```
low_adherence = qualquer uma das cinco flags = true
low_adherence_flags = lista das flags disparadas
```

Efeitos:
- Tag `LOW_ADHERENCE`.
- `lead_route = nurture_low_adherence`, mesmo que `commercial_readiness ≥ 4`. O time comercial vê a tag e decide abordagem manual; nenhuma sequência de vendas automática.
- Tela de resultado completa e respeitosa. O bloco do Compatíveis usa a variante de copy para baixa aderência (ver `04-copy-resultados.md`, bloco R), que fala sobre a parte dela sem confronto direto e sem prometer mudança do parceiro.

## K · Fluxo de segurança

Flags `safety_violence` (Q09 · "Sai do controle: gritos, ameaças, coisas quebradas ou medo de verdade.") e `safety_acute_distress` (Q10 · "Eu já estou no limite. Tem dias em que sinto que não aguento mais viver assim, e isso me assusta.").

```
safety_flag = safety_violence OR safety_acute_distress
```

Regras:
1. A pessoa **continua o quiz normalmente** (interromper no meio exporia a situação e quebraria a confiança).
2. Na tela de resultado, antes de qualquer outra coisa, aparece o **bloco de orientação de segurança** (texto em `04-copy-resultados.md`, bloco K-copy). Variante por tipo de flag.
3. O bloco do Compatíveis e o CTA comercial **não aparecem**. No lugar, uma frase: "Quando você quiser, a gente conversa sobre o seu Raio-X. Mas primeiro, o que importa é você estar segura e amparada."
4. Nenhuma automação comercial (sem sequência de WhatsApp de vendas, sem remarketing de oferta). Tag `SAFETY_FLAG`, `lead_route = safety`.
5. Revisão humana em até 24h úteis por pessoa da equipe com roteiro específico (acolher, não diagnosticar, reforçar os canais de ajuda). O Compatíveis não é apresentado como substituto de atendimento médico, psicológico, psiquiátrico, serviços de emergência ou autoridades competentes.
6. Dados de contato continuam sendo coletados na captura (a pessoa pode precisar ser procurada), com o mesmo consentimento.

Canais citados na orientação (Brasil): Ligue 180 (Central de Atendimento à Mulher), 190 (Polícia Militar), CVV 188 (24h, gratuito, também por chat em cvv.org.br), SAMU 192, e a orientação de procurar um profissional de saúde ou psicólogo de confiança.
