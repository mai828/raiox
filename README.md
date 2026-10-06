# Raio-X do Seu Relacionamento

Aplicação web de diagnóstico relacional da marca Márcio Conceição. Porta de entrada para o processo individual **Compatíveis** (valor de referência R$ 2.500).

> Descubra o que pode estar mantendo seu relacionamento no mesmo lugar, mesmo depois de tudo que você já tentou.

Toda a lógica diagnóstica é determinística, auditável e baseada em configuração. Não há IA generativa em runtime.

## Instalação e execução

```bash
npm install
cp .env.example .env.local   # preencha o que tiver
npm run dev                  # http://localhost:3000
```

Produção:

```bash
npm run build
npm start
```

## Verificação

```bash
npm run lint        # ESLint (next/core-web-vitals + typescript)
npm run typecheck   # tsc --noEmit
npm run test        # Vitest: cenários de scoring (tests/unit)
npm run test:e2e    # Playwright: fluxo completo em viewport mobile (faz build e sobe em :3100)
npm run check       # lint + typecheck + unit
```

## Variáveis de ambiente

| Variável | Obrigatória | Efeito |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Para o CTA funcionar | Número internacional sem símbolos (ex. `5511999999999`). Sem ela, o resultado mostra um fallback com a mensagem pronta e botão de copiar. |
| `QUIZ_WEBHOOK_URL` | Não | URL que recebe o payload do lead via POST JSON. Sem ela, a rota `/api/lead` registra no log do servidor e responde `{ ok: true, delivered: false, mode: "local" }`. |
| `NEXT_PUBLIC_PRIVACY_POLICY_URL` | Recomendada | Link do consentimento. |
| `NEXT_PUBLIC_GA_ID` | Não | Carrega gtag e envia eventos. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Não | Carrega o Pixel e envia eventos customizados. |

Variáveis `NEXT_PUBLIC_*` são embutidas no build. Alterá-las exige novo `npm run build`.

## Estrutura

```
app/                      layout, página única, rota /api/lead (adapter de webhook)
components/quiz/          QuizShell (orquestração), SegmentedProgress, ScreenFrame, perguntas, insights, captura, processamento, segurança, retomada
components/visualizations ConnectionLineViz, ConflictMotionViz, LoadBalanceViz, CycleViz, PartialPortrait, ResultXRayGlyph, DimensionBars, XRayRing
components/result/        ResultDocument e seções (leitura geral, recursos, ponto de tensão, ciclo, hipótese, perfil, objetivo, índice, CTA)
config/questions.ts       as 31 perguntas: texto, opções, scores por dimensão, pesos, efeitos de perfil, flags
config/flow.ts            sequência de telas e progresso segmentado
config/resultCopy.ts      textos por eixo/faixa, ponto de tensão, módulos de hipótese, pontes de recurso, descrições de perfil
lib/scoring/              funções puras: dimensões, índice, tensão, perfis, recursos, prontidão, segurança, ciclo, hipótese, headline, insights
lib/store.ts              estado tipado (Zustand + persist em localStorage)
lib/analytics/track.ts    trackEvent(name, payload) com filtro de chaves seguras
lib/integrations/         whatsapp.ts (URL + mensagem), webhook.ts (cliente da rota interna)
lib/payload.ts            buildCRMPayload
types/index.ts            tipos do domínio
tests/unit, tests/e2e     Vitest e Playwright
legacy/v1/                especificação e protótipo anteriores (não usados pela aplicação)
```

## Modelo de scoring

Escala base 0–4 por resposta; quanto maior, mais recurso naquele eixo. Cada eixo é normalizado para 0–100:

```
dimensionScore = sum(answerScore × weight) / sum(4 × weight) × 100
```

Respostas `null` ("não se aplica", "prefiro não responder") saem do numerador e do denominador. Perguntas não respondidas também.

| Eixo | Perguntas (peso) |
|---|---|
| Conexão e presença | Q04, Q05, Q17 |
| Conversa e reparação | Q07 (1.25), Q08 (1.25), Q09, Q10 |
| Parceria e reciprocidade | Q11 (1.25), Q12 (1.25), Q13, Q14 |
| Afeto e intimidade | Q15, Q16 |
| Respeito, confiança e futuro | Q10, Q18, Q19 |

Q10 participa de dois eixos por desenho.

- **Índice de Reorganização Relacional**: média simples dos eixos com dados. Mostrado só no fim do resultado, como informação secundária.
- **Ponto de maior tensão**: menor eixo. Empate (≤ 5 pontos) resolvido por: mais respostas 0/1 → maior peso comprometido → eixo do objetivo de 90 dias → mantém os dois ("dois pontos estão muito próximos").
- **Eixo mais preservado**: maior eixo; empate ≤ 5 mostra dois.
- **Perfis** (`overload`, `demand_withdraw`, `emotional_baggage`, `knows_but_repeats`): somas definidas em `config/questions.ts` (`profileEffects`) e regras em `lib/scoring/profiles.ts`. Mochila emocional pontua **apenas** por sobreposição entre Q22 (casa de origem) e o comportamento atual. Perfil só é exibido com ≥ 4 pontos; abaixo disso, "não aparece concentrado em uma única dinâmica".
- **Ciclo**: `buildCycle` monta nós apenas com evidência; com menos de 4 nós, mostra que não houve sequência consistente.
- **Hipótese**: `buildHypothesis` encadeia módulos (eixo → perfil → recurso preservado → tentativas → objetivo → ressalva).
- **Prontidão comercial** (0–7): duração ≥ 6 meses, ≥ 2 tentativas, urgência ≥ 7, abertura (sem baixa aderência explícita), começar agora/semanas, investimento disponível (só "consigo investir"), intenção de agir (Q29 ≠ "só entender"/"não sei"). Classes: 0–2 LOW, 3 MEDIUM, 4–5 QUALIFIED, 6–7 HIGH. Não altera nenhum score relacional.
- **Segurança**: Q31 "sim" → `safety_flag`, tela dedicada, sem CTA; "já aconteceu" → `safety_history_flag` no payload para revisão humana; Q10 "medo da reação dele" → `safety_preflag`.

## Como alterar

**Adicionar ou editar pergunta**: edite `config/questions.ts`. Cada pergunta declara `id`, `field`, `segment`, `type`, `text`, `helper`, `options` (com `dimensions`, `profileEffects`, `flags`, `exclusive`, `tag`), `dimensions` (peso por eixo) e `requireConfirm`. Para entrar no fluxo, adicione em `config/flow.ts`. Adicione o `QuestionId` em `types/index.ts`. Rode `npm run test` para conferir que os cenários continuam coerentes.

**Alterar copy de resultado**: `config/resultCopy.ts` (eixos por faixa, ponto de tensão, hipótese, pontes, perfis). Microdevolutivas: `lib/scoring/insights.ts`. Headline: `lib/scoring/headline.ts`.

**Webhook**: `app/api/lead/route.ts`. Valida o mínimo com Zod, repassa com 3 tentativas e backoff. O payload (`types/index.ts › CRMLeadPayload`) é enviado duas vezes: `lead_capture_complete` (após consentimento) e `cta_click` (ao clicar no CTA).

**WhatsApp**: `lib/integrations/whatsapp.ts`. Mensagem visível sem valores comerciais.

**UTM e origem**: `lib/utm.ts` captura `utm_*`, `source_channel` (ou `src`), `referrer` e `landing_path` no primeiro acesso e preserva na sessão.

**Analytics**: `lib/analytics/track.ts`. Eventos: `quiz_view`, `quiz_start`, `segment_started`, `question_viewed`, `question_answered`, `insight_viewed`, `partial_portrait_viewed`, `quiz_complete`, `lead_capture_started`, `lead_capture_complete`, `processing_started`, `result_view`, `cta_click`, `whatsapp_start`, `safety_flag_triggered`, `quiz_abandon`. Só chaves da lista segura chegam a GA/Pixel; nenhuma resposta bruta. Eventos pós-WhatsApp (`application_started`, `application_booked`, `call_attended`, `offer_made`, `sale_completed`) pertencem ao CRM.

## Privacidade

As respostas ficam só no navegador (localStorage) até o consentimento. O payload para o CRM é enviado apenas após o checkbox de consentimento, na última tela de captura. Nada pessoal é hardcoded. Política de retenção deve ser definida no destino do webhook.

## Deploy

Projeto Next.js 15 (App Router) sem dependências de servidor além da rota `/api/lead`. Funciona em Vercel, Netlify ou qualquer Node 18+. Configure as variáveis de ambiente no painel do provedor e refaça o build.
