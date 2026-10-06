# T a X · Fillout, CRM, tags, tracking e lógica condicional

## T · Estrutura de parâmetros e campos para Fillout

### Parâmetros de URL (capturados em campos ocultos na primeira tela)

| Parâmetro | Campo Fillout | Observação |
|---|---|---|
| `utm_source` | `utm_source` | ex.: instagram, meta, google, youtube, whatsapp, email |
| `utm_medium` | `utm_medium` | ex.: paid_social, organic, bio, story, email |
| `utm_campaign` | `utm_campaign` | ex.: raiox_lancamento_2026q4 |
| `utm_content` | `utm_content` | criativo / variação |
| `utm_term` | `utm_term` | termo ou público |
| `src` | `source_channel` | canal consolidado quando não há UTM (ex.: bio_instagram, palestra, indicacao) |
| — | `entry_date` | preenchido com data/hora de início (ISO 8601, fuso America/Sao_Paulo) |
| — | `quiz_version` | fixo "1.0.0" |
| — | `respondent_id` | id anônimo gerado pelo Fillout, usado para abandono |

### Campos de resposta (um por pergunta)

| Pergunta | Campo | Tipo Fillout | Valores |
|---|---|---|---|
| Q01 | `q01_symptom` | Multiple choice | a–e (id da alternativa) |
| Q02 | `relationship_context` → deriva `relationship_status`, `relationship_years` | Multiple choice | ver ficha |
| Q03 | `has_children` | Multiple choice | yes_home / yes_adult / no |
| Q04 | `age_range` | Multiple choice | <=34 / 35-44 / 45-52 / >=53 |
| Q05 | `q05_loneliness` | Multiple choice | a–e |
| Q06 | `q06_load` | Multiple choice | a–e |
| Q07 | `problem_duration` | Multiple choice | <6m / 6m-2y / 2-5y / >5y / always |
| Q08 | `previous_solutions` (checkboxes) → deriva `previous_solutions_count` | Checkboxes | a–h |
| Q09 | `q09_conversation_end` | Multiple choice | a–f |
| Q10 | `q10_cost` | Multiple choice | a–f |
| Q11 | `q11_withdraw_reaction` | Multiple choice | a–f |
| Q12 | `q12_family_of_origin` | Multiple choice | a–f |
| Q13 | `q13_pattern_transfer` | Multiple choice | a–e |
| Q14 | `q14_blame_responsibility` | Multiple choice | a–f |
| Q15 | `q15_knowing_vs_doing` | Multiple choice | a–e |
| Q16 | `q16_explanation` | Multiple choice | a–e |
| Q17 | `self_reflection_openness` | Multiple choice | open / open_conditional / knows_part / his_turn / closed |
| Q18 | `urgency_score` | Opinion scale 0–10 | 0–10 |
| Q19 | `start_availability` | Multiple choice | now / 30d / 1-3m / unsure / not_looking |
| Q20 | `investment_capacity` | Multiple choice | fits / fits_with_planning / fits_shared_decision / does_not_fit / no_answer |
| Q21 | `action_intent` | Multiple choice | act / decide / understand_only / validation / fix_partner / guarantee |
| Captura | `lead_name`, `lead_whatsapp`, `lead_email`, `consent_contact` | Short text / Phone / Email / Checkbox | |
| Captura | `consent_timestamp`, `consent_text_version` | Hidden | para LGPD |

### Campos calculados (Fillout "Calculations" ou webhook)

Recomendação de implementação: o Fillout armazena todas as respostas e os campos de pontuação por alternativa; o cálculo final (normalização, desempates, perfil, rota) roda em um webhook (Make, n8n ou função serverless) usando a lógica de `scripts/score.py`, e grava de volta no CRM. Se for necessário fazer tudo dentro do Fillout, a seção X descreve como cada regra se traduz em cálculos nativos.

Campos de pontuação bruta (acumuladores):

```
raw_p1, raw_p2, raw_p3, raw_p4, raw_p5          soma de score × peso por pilar
zeros_p1 … zeros_p5                             respostas com score 0 por pilar
zero_weight_p1 … zero_weight_p5                 peso das respostas com score 0
crit_p1 … crit_p5                               sinais críticos por pilar
aff_a, aff_b, aff_c, aff_d                      afinidade de perfil
aff_heavy_a … aff_heavy_d                       afinidade vinda de perguntas peso 1.25
aff_strong_a … aff_strong_d                     quantidade de +2 por perfil
crit_1 … crit_7                                 critérios comerciais (0/1)
```

Campos finais:

```
pillar_clarity_score, pillar_history_score, pillar_relationship_score,
pillar_boundaries_score, pillar_action_score          0–100
relationship_reorganization_index                      0–100
irc_band                                               automatic | emerging | aware_but_repeating | hands_on_wheel
dominant_profile                                       profile_overload | profile_demand_withdraw | profile_emotional_baggage | profile_knows_but_repeats
main_attention_point                                   clarity | history | relationship | boundaries | action
pillar_most_aware, pillar_most_possible                mesmo domínio de main_attention_point
commercial_readiness                                   0–7
commercial_classification                              low | medium | qualified | high
low_adherence                                          true/false
low_adherence_flags                                    lista
safety_flag                                            true/false
safety_flags                                           lista (safety_violence, safety_acute_distress)
risk_flags                                             lista
lead_route                                             safety | nurture_low_adherence | sales_triage | nurture
tags                                                   lista
completion_seconds                                     inteiro
```

## U · Estrutura de dados para CRM

Objeto Lead (um registro por respondente; chave `lead_whatsapp` normalizado E.164).

| Campo | Tipo | Origem |
|---|---|---|
| `lead_name` | texto | captura |
| `lead_whatsapp` | telefone E.164 | captura |
| `lead_email` | e-mail (opcional) | captura |
| `consent_contact` | booleano | captura |
| `consent_timestamp` | datetime | captura |
| `age_range` | enum | Q04 |
| `relationship_status` | enum | derivado Q02 |
| `relationship_years` | enum | derivado Q02 |
| `has_children` | enum | Q03 |
| `problem_duration` | enum | Q07 |
| `previous_solutions` | lista | Q08 |
| `previous_solutions_count` | inteiro | derivado Q08 |
| `urgency_score` | inteiro 0–10 | Q18 |
| `self_reflection_openness` | enum | Q17 |
| `start_availability` | enum | Q19 |
| `investment_capacity` | enum | Q20 |
| `action_intent` | enum | Q21 |
| `pillar_clarity_score` | inteiro 0–100 | cálculo |
| `pillar_history_score` | inteiro 0–100 | cálculo |
| `pillar_relationship_score` | inteiro 0–100 | cálculo |
| `pillar_boundaries_score` | inteiro 0–100 | cálculo |
| `pillar_action_score` | inteiro 0–100 | cálculo |
| `relationship_reorganization_index` | inteiro 0–100 | cálculo |
| `irc_band` | enum | cálculo |
| `dominant_profile` | enum | cálculo |
| `main_attention_point` | enum | cálculo |
| `pillar_most_aware` | enum | cálculo |
| `pillar_most_possible` | enum | cálculo |
| `commercial_readiness` | inteiro 0–7 | cálculo |
| `commercial_classification` | enum | cálculo |
| `low_adherence` | booleano | cálculo |
| `low_adherence_flags` | lista | cálculo |
| `safety_flag` | booleano | cálculo |
| `safety_flags` | lista | cálculo |
| `safety_contact_ok` | booleano | tela de resultado (fluxo de segurança) |
| `risk_flags` | lista | cálculo |
| `lead_route` | enum | cálculo |
| `nurture_opt_in` | booleano | CTA secundário |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term` | texto | URL |
| `source_channel` | texto | URL ou padrão |
| `entry_date` | datetime | início do quiz |
| `completion_date` | datetime | envio |
| `completion_seconds` | inteiro | derivado |
| `quiz_version` | texto | fixo |
| `result_url` | URL | link permanente do resultado |
| `pipeline_stage` | enum | `result_viewed` → `whatsapp_started` → `triage` → `application_scheduled` → `application_attended` → `offer_made` → `won` / `lost` / `nurturing` |
| `owner` | usuário | atribuição comercial |
| `raw_answers` | JSON | todas as respostas, para reprocessamento quando o modelo mudar |

Regra de deduplicação: mesmo `lead_whatsapp` em até 90 dias atualiza o registro e preserva o histórico de resultados em `raw_answers_history`. Um lead que refaz o quiz não volta ao início do pipeline se já estiver em `triage` ou além.

## V · Tags

Somente tags que mudam uma ação ou um filtro.

| Tag | Quando | Para que serve |
|---|---|---|
| `PROFILE_OVERLOADED` / `PROFILE_DEMAND_WITHDRAW` / `PROFILE_EMOTIONAL_BAGGAGE` / `PROFILE_KNOWS_BUT_REPEATS` | perfil predominante | personalizar sequência de nutrição e abertura da triagem |
| `ATTENTION_CLARITY` / `ATTENTION_HISTORY` / `ATTENTION_RELATIONSHIP` / `ATTENTION_BOUNDARIES` / `ATTENTION_ACTION` | principal ponto de atenção | roteiro da conversa de aplicação; conteúdo de nutrição |
| `READINESS_LOW` / `READINESS_MEDIUM` / `READINESS_QUALIFIED` / `READINESS_HIGH` | classificação comercial | prioridade de atendimento e SLA |
| `LOW_ADHERENCE` | qualquer flag de baixa aderência | retira da sequência comercial automática; abordagem manual |
| `SAFETY_FLAG` | qualquer flag de segurança | bloqueia automações comerciais; revisão humana em 24h úteis |
| `DECISION_SHARED` | investimento envolve o marido | roteiro de triagem prevê a conversa sobre decisão compartilhada |
| `REPETITION_INTENSE` | problema há mais de 5 anos ou "desde sempre" | prioridade na nutrição; conteúdo sobre padrão de longa duração |
| `PERSONA_CORE` | 35–52 e casada/morando junto | análise de aderência de mídia à persona; não altera atendimento |
| `IRC_AUTOMATIC` / `IRC_EMERGING` / `IRC_AWARE` / `IRC_HANDS_ON` | faixa do índice | só para segmentação de conteúdo; opcional |

## W · Eventos de tracking

Implementar via GTM + GA4 e Meta Pixel/CAPI (eventos customizados), com `respondent_id` como chave e todas as UTMs como parâmetros em todos os eventos.

| Evento | Disparo | Parâmetros principais |
|---|---|---|
| `quiz_view` | carregamento da tela de abertura | utm_*, source_channel |
| `quiz_start` | clique em "Começar" | utm_* |
| `question_answered` | cada resposta | question_id, phase, seconds_on_question |
| `quiz_abandon` | saída sem envio após ≥1 resposta (beacon on unload ou timeout de 30 min) | last_question_id, phase |
| `quiz_complete` | envio da Q21 | completion_seconds |
| `lead_capture_complete` | envio da captura | has_email, consent |
| `result_view` | render da tela de resultado | dominant_profile, main_attention_point, irc_band, commercial_classification, lead_route, safety_flag, low_adherence |
| `cta_click` | clique no CTA principal | cta_variant, lead_route |
| `nurture_opt_in` | clique no CTA secundário | lead_route |
| `whatsapp_start` | primeira mensagem recebida no WhatsApp (webhook da API/CRM) | lead_route |
| `application_start` | triagem concluída, conversa de aplicação proposta | — |
| `application_booked` | conversa de aplicação agendada | — |
| `call_attended` | conversa realizada | — |
| `offer_made` | oferta do Compatíveis apresentada | — |
| `sale_completed` | contrato/pagamento | value |

Conversão principal para otimização de mídia: `whatsapp_start` filtrado por `commercial_classification ∈ {qualified, high}` e `lead_route = sales_triage` (enviar como evento `qualified_lead` via CAPI). `quiz_complete` e `lead_capture_complete` são conversões secundárias.

Painel mínimo:

| Métrica | Fórmula |
|---|---|
| Taxa de início | quiz_start / quiz_view |
| Taxa de conclusão | quiz_complete / quiz_start |
| Abandono por pergunta | quiz_abandon agrupado por last_question_id |
| Taxa de captura | lead_capture_complete / quiz_complete |
| % leads qualificadas | (qualified + high) / lead_capture_complete |
| **KPI principal: taxa de avanço comercial** | whatsapp_start (qualificadas) / lead_capture_complete (qualificadas) |
| Custo por lead qualificada | investimento / leads qualificadas |
| Custo por conversa de aplicação | investimento / application_booked |
| Distribuição de perfis | dominant_profile (alerta se um perfil > 55%) |
| Distribuição de pontos de atenção | main_attention_point |
| % safety / % low adherence | para calibrar criativos e perguntas |

## X · Lógica condicional necessária para implementação

### 1. Navegação

- Fluxo linear, Q01 → Q21, com interstitials antes de Q02, Q05, Q07, Q11, Q15, Q18 e antes da captura (textos em `02-perguntas.md`).
- Q08: alternativa "Nada estruturado ainda" é exclusiva (desmarca as outras). `previous_solutions_count = quantidade marcada − (1 se "h" marcada)`.
- Q03 = "Não": a alternativa b da Q10 já é genérica ("as pessoas que eu amo"); nenhum ajuste necessário. Opcional: trocar "filhos" por "família" no texto da Q06 quando `has_children = no`.
- Captura só aparece depois da Q21. Nenhum campo de contato antes disso.

### 2. Acumuladores por alternativa

Para cada alternativa de pergunta com pilar, ao ser selecionada:

```
raw_{pilar}        += score × peso
zeros_{pilar}      += 1            se score = 0
zero_weight_{pilar}+= peso         se score = 0
crit_{pilar}       += nº de flags de risco da alternativa (excluindo flags safety_*)
aff_{perfil}       += pontos de afinidade da alternativa, por perfil
aff_heavy_{perfil} += mesmos pontos, apenas se peso = 1.25
aff_strong_{perfil}+= 1            se a alternativa dá +2 ao perfil
```

Q08 (multi): `aff_a`, `aff_b`, `aff_c` somam o que a ficha indica, com teto 2 por perfil nesta pergunta; `aff_d += 1` se marcou 1 item de conhecimento (b, c, d, e), `aff_d += 2` se marcou 2 ou mais.

### 3. Normalização

```
pillar_clarity_score      = round(raw_p1 / 6.00  × 100)
pillar_history_score      = round(raw_p2 / 6.00  × 100)
pillar_relationship_score = round(raw_p3 / 11.25 × 100)
pillar_boundaries_score   = round(raw_p4 / 9.75  × 100)
pillar_action_score       = round(raw_p5 / 6.75  × 100)
relationship_reorganization_index = round(média dos cinco)
irc_band = faixa por tabela E
```

Se o número de perguntas ou os pesos mudarem, os denominadores mudam: usar sempre `soma(peso × 3)` das perguntas do pilar.

### 4. Principal Ponto de Atenção

```
menor = min(P1..P5)
candidatos = pilares com score − menor ≤ 5
se 1 candidato → fim
senão filtrar sucessivamente por: max(crit_), max(zeros_), max(zero_weight_), ordem [P3, P4, P5, P1, P2]
```

### 5. Perfil

```
candidatos = perfis com aff máxima
se 1 → fim
senão filtrar por: max(aff_heavy_), max(aff_strong_), mapeamento do ponto de atenção {clarity:B, history:C, relationship:B, boundaries:A, action:D}
```

### 6. Prontidão

```
crit_1 = problem_duration ≠ "<6m"
crit_2 = previous_solutions_count ≥ 2
crit_3 = urgency_score ≥ 7
crit_4 = self_reflection_openness ∈ {open, open_conditional, knows_part}
crit_5 = start_availability ∈ {now, 30d}
crit_6 = investment_capacity ∈ {fits, fits_with_planning, fits_shared_decision}
crit_7 = action_intent ∈ {act, decide}
commercial_readiness = soma
commercial_classification: 0–2 low · 3 medium · 4–5 qualified · 6–7 high
```

### 7. Flags e rota

```
low_adherence = q14 ∈ {a, f} OR q17 = d OR q21 ∈ {d, e}
safety_flag   = q09 = e OR q10 = f
lead_route    = safety_flag ? "safety"
              : low_adherence ? "nurture_low_adherence"
              : commercial_readiness ≥ 4 ? "sales_triage"
              : "nurture"
```

### 8. Tela de resultado (blocos condicionais)

```
bloco 0 (segurança)      se safety_flag; variante por safety_violence / safety_acute_distress (ambas se as duas)
bloco 2 (faixa)          texto por irc_band
bloco 3 (perfil)         texto por dominant_profile; variante D quando irc ≥ 75
bloco 4 (atenção)        texto por main_attention_point
bloco 5 (pilares)        texto de cada pilar por faixa 0–33 / 34–66 / 67–100; destaques por pillar_reading
bloco 7 (reflexão/ação)  reflexão por main_attention_point; ação por dominant_profile
bloco 8 (Compatíveis)    padrão se route ∈ {sales_triage, nurture}; variante se nurture_low_adherence; omitido se safety
bloco 9 (CTA)            principal sempre que não safety; secundário "mais conteúdo" se route ∈ {nurture, nurture_low_adherence}
bloco 8-S                somente se safety
```

### 9. Automações pós-envio

| Rota | Imediato | D+1 | D+3 | D+7 | D+14 |
|---|---|---|---|---|---|
| `safety` | resultado + e-mail com canais de ajuda; tarefa de revisão humana (24h úteis) | contato humano se `safety_contact_ok` | — | — | — |
| `sales_triage` (high) | resultado; notificação ao comercial; se não iniciou WhatsApp em 2h, mensagem proativa da equipe citando perfil e ponto de atenção | lembrete suave | conteúdo do ponto de atenção + convite | — | — |
| `sales_triage` (qualified) | resultado; se não iniciou WhatsApp em 24h, mensagem proativa | — | conteúdo do ponto de atenção + convite | nova chamada | — |
| `nurture` | resultado + e-mail/WhatsApp de boas-vindas | conteúdo do perfil | conteúdo do ponto de atenção | caso/história relacionada | nova chamada para conversa |
| `nurture_low_adherence` | resultado + boas-vindas | conteúdo "o que é meu e o que é dele" | conteúdo sobre participação própria sem culpa | — | nova chamada suave; revisão manual pelo comercial |

Mensagens de WhatsApp proativas sempre em nome da equipe, nunca automatizadas em tom de venda, e nunca para `safety`.

### 10. Reprocessamento

Guardar `raw_answers`. Quando pesos ou textos mudarem (nova `quiz_version`), reprocessar os leads históricos com a versão vigente para manter comparabilidade dos painéis, sem reenviar resultado para a pessoa.
