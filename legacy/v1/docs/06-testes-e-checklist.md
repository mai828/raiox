# Y · Checklist técnico e simulações obrigatórias

## Y · Checklist técnico antes da publicação

### Conteúdo
- [ ] Todas as 21 perguntas e alternativas conferidas contra `data/quiz.json` (texto exato, ordem de exibição, nenhuma sequência 0-1-2-3 visível).
- [ ] Interstitials nas posições corretas (antes de Q02, Q05, Q07, Q11, Q15, Q18 e captura).
- [ ] Nenhuma menção a "diagnóstico" como promessa; aviso de ferramenta de reflexão na abertura, na captura e no rodapé do resultado.
- [ ] Nenhuma frase que prometa cura, salvar casamento, mudar o parceiro, resultado garantido ou prazo.
- [ ] "Ponto cego" não aparece em título, categoria, CTA nem mais de uma vez em todo o resultado.
- [ ] Textos de perfil, faixa, ponto de atenção e pilares revisados em voz alta: soam falados, não acadêmicos nem "texto de IA".
- [ ] Variante do Perfil D para IRC ≥ 75 funcionando.
- [ ] Bloco de segurança com os números corretos (180, 190, 188, 192) e sem CTA comercial.

### Lógica
- [ ] Acumuladores por pilar conferem com os máximos (6.00 / 6.00 / 11.25 / 9.75 / 6.75).
- [ ] Rodar os 8 cenários abaixo no formulário publicado e comparar com a saída de `python3 scripts/score.py` (pilares, IRC, perfil, ponto de atenção, prontidão, flags, rota). Divergência zero.
- [ ] Testar empate de ponto de atenção (cenário 1 e 5) e empate de perfil (criar um caso forçado com afinidades iguais e verificar o critério 3).
- [ ] Q08 exclusiva ("Nada estruturado") desmarca as outras e zera a contagem.
- [ ] Q18 aceita 0 e 10 e o critério vira em 7.
- [ ] Safety flag em Q09 ou Q10 remove blocos 8 e 9 e mostra 0 e 8-S.
- [ ] Baixa aderência troca a variante do bloco 8 e mantém IRC inalterado.
- [ ] `lead_route` correto nos quatro casos.
- [ ] Reprocessamento: alterar um peso em staging, reprocessar um lead e confirmar que `raw_answers` reproduz o resultado.

### Captura e dados
- [ ] Captura aparece só depois da Q21.
- [ ] WhatsApp com máscara e validação de DDD; normalização E.164 no CRM.
- [ ] E-mail opcional de verdade (envio funciona sem ele).
- [ ] Checkbox de consentimento obrigatório, com link para Política de Privacidade; `consent_timestamp` e `consent_text_version` gravados.
- [ ] UTMs e `source_channel` chegando ao CRM em um envio de teste com URL completa e em outro sem UTM.
- [ ] Deduplicação por WhatsApp em 90 dias testada.
- [ ] Tags aplicadas corretamente para cada cenário.

### Tracking
- [ ] `quiz_view`, `quiz_start`, `question_answered` (com `question_id`), `quiz_complete`, `lead_capture_complete`, `result_view`, `cta_click` disparando no GTM preview.
- [ ] `quiz_abandon` disparando ao fechar a aba após a Q03.
- [ ] `result_view` carregando `dominant_profile`, `main_attention_point`, `commercial_classification`, `lead_route`.
- [ ] Evento `qualified_lead` via CAPI apenas para `sales_triage`.
- [ ] Nenhum evento de conversão comercial disparado para `safety`.

### Experiência
- [ ] Tempo total em teste com 5 pessoas da persona: entre 7 e 10 minutos.
- [ ] Mobile: todas as alternativas legíveis sem rolagem horizontal; alternativas longas (Q14e, Q16e) não quebram o layout.
- [ ] Link do WhatsApp com mensagem pré-preenchida abrindo corretamente em iOS e Android.
- [ ] Página de resultado com URL permanente e reabrível.
- [ ] Teste de leitura: três pessoas da persona respondem "esse texto parece ter sido escrito sobre mim?" para o perfil recebido. Meta: 3 de 3 sim.

## Simulações obrigatórias (seção 28)

Oito usuárias fictícias: as seis obrigatórias e duas de controle (alta consciência com baixa prontidão; sofrimento alto com baixa prontidão), para provar que sofrimento e qualificação comercial estão separados. Saída literal de `python3 scripts/score.py`.

<!-- GEN:SIMULATIONS -->
```text
====================================================================================================
1. Sobrecarregada (Renata, 44)
----------------------------------------------------------------------------------------------------
  Q01: Eu faço tudo sozinha. A casa, os filhos, a relação, tudo passa por mim.
  Q02: Casada ou morando junto há 11 a 20 anos
  Q03: Sim, crianças ou adolescentes em casa
  Q04: 35 a 44
  Q05: Irritação. Olho para ele descansando e penso em tudo que ficou nas minhas costas naquele dia.
  Q06: Eu. Se eu não puxar, simplesmente não acontece.
  Q07: Mais de 5 anos.
  Q08: Conversas sérias, DRs, ultimatos; Mudar o meu jeito: ceder mais, cobrar menos, engolir, me adaptar
  Q09: Ele concorda com tudo, promete, e em duas semanas está igual.
  Q10: Eu continuar esperando ele mudar enquanto a minha vida passa.
  Q11: Compenso. Cuido mais, resolvo mais, faço mais, esperando que ele volte.
  Q12: Quem cuidava carregava tudo sozinha e reclamava, mas ninguém dividia.
  Q13: Aparece em todo lugar: no trabalho, com os filhos, com as amigas. É o meu jeito, mesmo quando me custa.
  Q14: Eu me responsabilizo pela minha parte, mas na prática continuo tentando controlar a dele.
  Q15: Sinceramente, eu ainda não entendo o que acontece. Só sei que repete.
  Q16: A falta de comunicação. A gente não sabe conversar.
  Q17: Dependeria de como fosse dito. Mas sim, eu toparia olhar.
  Q18: 8/10
  Q19: Dentro das próximas semanas, até 30 dias.
  Q20: Cabe com planejamento ou parcelamento.
  Q21: Entender o que está por trás disso e agir sobre a minha parte, mesmo que dê trabalho.
----------------------------------------------------------------------------------------------------
  Pilares: P1=33  P2=33  P3=33  P4=46  P5=33
  IRC: 36  (Começando a enxergar)
  Perfil: A Sobrecarregada  afinidades={'profile_overload': 14, 'profile_demand_withdraw': 5, 'profile_emotional_baggage': 4, 'profile_knows_but_repeats': 2}
  Principal Ponto de Atenção: Dinâmica relacional, presença e conexão
     candidatos (diferença <= 5 do menor): ['P1', 'P2', 'P3', 'P5']
     1. sinais críticos: ['P1', 'P2', 'P3', 'P5'] -> ['P1', 'P2', 'P3', 'P5']
     2. respostas com score 0: ['P1', 'P2', 'P3', 'P5'] -> ['P1', 'P2', 'P3', 'P5']
     3. peso das perguntas com score 0: ['P1', 'P2', 'P3', 'P5'] -> ['P1', 'P2', 'P3', 'P5']
     4. impacto na dinâmica relacional: ['P1', 'P2', 'P3', 'P5'] -> ['P3']
  Leitura: repete=relationship consciência=boundaries possibilidade=action
  Prontidão comercial: 7/7  (Alta prioridade comercial)  critérios={1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1}
  low_adherence=False []   safety_flag=False []
  lead_route=sales_triage
  risk_flags=['overload', 'repetition_intense']
  tags=['PROFILE_OVERLOADED', 'ATTENTION_RELATIONSHIP', 'READINESS_HIGH', 'REPETITION_INTENSE', 'PERSONA_CORE']
====================================================================================================
2. Ciclo cobrança-afastamento (Patrícia, 39)
----------------------------------------------------------------------------------------------------
  Q01: Ele não muda. Já falei de todas as formas e nada.
  Q02: Casada ou morando junto há 5 a 10 anos
  Q03: Sim, crianças ou adolescentes em casa
  Q04: 35 a 44
  Q05: Uma solidão difícil de explicar. Ele está do meu lado e, mesmo assim, eu me sinto sozinha.
  Q06: O prático a gente divide. A parte invisível, lembrar, prever, resolver antes de virar problema, é minha.
  Q07: Entre 2 e 5 anos.
  Q08: Conversas sérias, DRs, ultimatos; Um tempo separados, ou a ameaça de separação; Livros, cursos, podcasts, conteúdos sobre relacionamento
  Q09: Ele fica na defensiva ou se fecha, eu insisto, e termina pior do que começou.
  Q10: Eu continuar esperando ele mudar enquanto a minha vida passa.
  Q11: Vou atrás. Pergunto o que houve, cobro, insisto, até que ele responda alguma coisa.
  Q12: Problemas ficavam no ar. Conflito era evitado, não resolvido.
  Q13: Não acho que tenha a ver. O que vivo hoje é sobre o meu casamento, não sobre o meu passado.
  Q14: Vai e volta. Um dia é ele, no outro sou eu. Nunca se resolve.
  Q15: Sinceramente, eu ainda não entendo o que acontece. Só sei que repete.
  Q16: A falta de comunicação. A gente não sabe conversar.
  Q17: Dependeria de como fosse dito. Mas sim, eu toparia olhar.
  Q18: 9/10
  Q19: Agora. Nos próximos dias.
  Q20: Cabe. Se fizer sentido, eu decido.
  Q21: Entender o que está por trás disso e agir sobre a minha parte, mesmo que dê trabalho.
----------------------------------------------------------------------------------------------------
  Pilares: P1=17  P2=17  P3=0  P4=54  P5=33
  IRC: 24  (No automático)
  Perfil: Presa no ciclo cobrança-afastamento  afinidades={'profile_overload': 1, 'profile_demand_withdraw': 14, 'profile_emotional_baggage': 2, 'profile_knows_but_repeats': 3}
  Principal Ponto de Atenção: Dinâmica relacional, presença e conexão
     candidatos (diferença <= 5 do menor): ['P3']
  Leitura: repete=relationship consciência=boundaries possibilidade=action
  Prontidão comercial: 7/7  (Alta prioridade comercial)  critérios={1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1}
  low_adherence=False []   safety_flag=False []
  lead_route=sales_triage
  risk_flags=['demand_withdraw', 'external_focus', 'history_unexamined', 'loneliness']
  tags=['PROFILE_DEMAND_WITHDRAW', 'ATTENTION_RELATIONSHIP', 'READINESS_HIGH', 'PERSONA_CORE']
====================================================================================================
3. Mochila emocional (Cláudia, 48)
----------------------------------------------------------------------------------------------------
  Q01: Talvez o problema seja eu. Talvez eu esteja exigindo demais, ou do jeito errado.
  Q02: Casada ou morando junto há mais de 20 anos
  Q03: Sim, já crescidos ou morando fora
  Q04: 45 a 52
  Q05: Irritação. Olho para ele descansando e penso em tudo que ficou nas minhas costas naquele dia.
  Q06: Eu, na maior parte. Ele até faz, mas só se eu pedir, lembrar e explicar como.
  Q07: Sinceramente, não lembro de ter sido muito diferente.
  Q08: Mudar o meu jeito: ceder mais, cobrar menos, engolir, me adaptar; Terapia individual
  Q09: Eu já nem falo. Cansei de ser a chata da casa.
  Q10: As pessoas que eu amo aprenderem comigo que relação é isso.
  Q11: Me fecho também. Fico fria e espero ele perceber.
  Q12: Eu aprendi cedo a me virar sozinha, a não dar trabalho e a agradar para ser vista.
  Q13: Nunca parei para olhar isso dessa forma.
  Q14: Em mim. Se eu fosse mais paciente, mais leve, menos cobrança, talvez ele estivesse mais presente.
  Q15: Consigo aplicar quando estou bem. Sob pressão, volto ao padrão.
  Q16: Eu. Deve ter alguma coisa errada comigo.
  Q17: Dependeria de como fosse dito. Mas sim, eu toparia olhar.
  Q18: 7/10
  Q19: Em 1 a 3 meses.
  Q20: Cabe, mas eu precisaria envolver meu marido na decisão.
  Q21: Entender melhor. Ainda não sei se quero mexer em alguma coisa.
----------------------------------------------------------------------------------------------------
  Pilares: P1=33  P2=17  P3=33  P4=31  P5=52
  IRC: 33  (Começando a enxergar)
  Perfil: Repetindo a mochila emocional  afinidades={'profile_overload': 7, 'profile_demand_withdraw': 2, 'profile_emotional_baggage': 11, 'profile_knows_but_repeats': 3}
  Principal Ponto de Atenção: História, família de origem e mochila emocional
     candidatos (diferença <= 5 do menor): ['P2']
  Leitura: repete=history consciência=action possibilidade=relationship
  Prontidão comercial: 5/7  (Lead qualificada)  critérios={1: 1, 2: 1, 3: 1, 4: 1, 5: 0, 6: 1, 7: 0}
  low_adherence=False []   safety_flag=False []
  lead_route=sales_triage
  risk_flags=['decision_shared', 'emotional_shutdown', 'history_unexamined', 'overload', 'repetition_intense', 'self_blame']
  tags=['PROFILE_EMOTIONAL_BAGGAGE', 'ATTENTION_HISTORY', 'READINESS_QUALIFIED', 'DECISION_SHARED', 'REPETITION_INTENSE', 'PERSONA_CORE']
====================================================================================================
4. Já entendeu, mas repete (Fernanda, 41)
----------------------------------------------------------------------------------------------------
  Q01: Eu sei explicar direitinho o que acontece entre a gente. Só não consigo fazer diferente na hora.
  Q02: Casada ou morando junto há 11 a 20 anos
  Q03: Sim, crianças ou adolescentes em casa
  Q04: 35 a 44
  Q05: Dá vontade de puxar assunto, mas eu já sei como termina. Então deixo quieto.
  Q06: O prático a gente divide. A parte invisível, lembrar, prever, resolver antes de virar problema, é minha.
  Q07: Mais de 5 anos.
  Q08: Terapia de casal; Terapia individual; Livros, cursos, podcasts, conteúdos sobre relacionamento; Mentoria, constelação, coaching ou outro processo com especialista; Conversas sérias, DRs, ultimatos
  Q09: Conseguimos conversar com calma às vezes, mas voltamos ao mesmo lugar quando a rotina aperta.
  Q10: Descobrir tarde demais que havia algo que eu podia ter feito diferente, e eu não vi.
  Q11: Percebo o ciclo começando e às vezes consigo não entrar nele. Nem sempre.
  Q12: Vejo semelhanças claras com o que vivo hoje. Nomear eu consigo; mudar é outra história.
  Q13: Aparece, e eu já percebi. Só que na hora da pressão, o automático vence.
  Q14: Eu me responsabilizo pela minha parte, mas na prática continuo tentando controlar a dele.
  Q15: Na hora H, some. Eu reajo igual e só depois lembro do que sabia.
  Q16: Uma dinâmica entre nós, alimentada por jeitos de funcionar que eu trouxe de antes e ainda não consegui mudar. Ele tem a parte dele; essa é a minha.
  Q17: Eu já sei qual é a minha parte. O que me falta é conseguir fazer diferente.
  Q18: 8/10
  Q19: Agora. Nos próximos dias.
  Q20: Cabe. Se fizer sentido, eu decido.
  Q21: Entender o que está por trás disso e agir sobre a minha parte, mesmo que dê trabalho.
----------------------------------------------------------------------------------------------------
  Pilares: P1=83  P2=67  P3=67  P4=67  P5=30
  IRC: 63  (Enxergando, mas ainda repetindo)
  Perfil: A que já entendeu, mas continua repetindo  afinidades={'profile_overload': 2, 'profile_demand_withdraw': 3, 'profile_emotional_baggage': 1, 'profile_knows_but_repeats': 18}
  Principal Ponto de Atenção: Reorganização, decisão e capacidade de agir
     candidatos (diferença <= 5 do menor): ['P5']
  Leitura: repete=action consciência=clarity possibilidade=relationship
  Prontidão comercial: 7/7  (Alta prioridade comercial)  critérios={1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1}
  low_adherence=False []   safety_flag=False []
  lead_route=sales_triage
  risk_flags=['knows_but_repeats', 'repetition_intense']
  tags=['PROFILE_KNOWS_BUT_REPEATS', 'ATTENTION_ACTION', 'READINESS_HIGH', 'REPETITION_INTENSE', 'PERSONA_CORE']
====================================================================================================
5. Baixa aderência (Simone, 46)
----------------------------------------------------------------------------------------------------
  Q01: Ele não muda. Já falei de todas as formas e nada.
  Q02: Casada ou morando junto há 11 a 20 anos
  Q03: Sim, crianças ou adolescentes em casa
  Q04: 45 a 52
  Q05: Uma solidão difícil de explicar. Ele está do meu lado e, mesmo assim, eu me sinto sozinha.
  Q06: Eu, na maior parte. Ele até faz, mas só se eu pedir, lembrar e explicar como.
  Q07: Entre 2 e 5 anos.
  Q08: Conversas sérias, DRs, ultimatos
  Q09: Ele concorda com tudo, promete, e em duas semanas está igual.
  Q10: Eu continuar esperando ele mudar enquanto a minha vida passa.
  Q11: Vou atrás. Pergunto o que houve, cobro, insisto, até que ele responda alguma coisa.
  Q12: Nunca tinha pensado na minha infância em relação ao meu casamento.
  Q13: Não acho que tenha a ver. O que vivo hoje é sobre o meu casamento, não sobre o meu passado.
  Q14: Nele. Quem precisa mudar aqui é ele, não eu.
  Q15: Sinceramente, eu ainda não entendo o que acontece. Só sei que repete.
  Q16: Ele. Se ele fosse diferente, nada disso estaria acontecendo.
  Q17: Não vejo nada que eu possa ou queira investigar em mim nessa história.
  Q18: 9/10
  Q19: Agora. Nos próximos dias.
  Q20: Cabe. Se fizer sentido, eu decido.
  Q21: Alguém que faça o meu marido mudar.
----------------------------------------------------------------------------------------------------
  Pilares: P1=0  P2=0  P3=11  P4=10  P5=33
  IRC: 11  (No automático)
  Perfil: Presa no ciclo cobrança-afastamento  afinidades={'profile_overload': 3, 'profile_demand_withdraw': 14, 'profile_emotional_baggage': 1, 'profile_knows_but_repeats': 0}
  Principal Ponto de Atenção: Clareza sobre o problema e consciência do padrão
     candidatos (diferença <= 5 do menor): ['P1', 'P2']
     1. sinais críticos: ['P1', 'P2'] -> ['P1', 'P2']
     2. respostas com score 0: ['P1', 'P2'] -> ['P1', 'P2']
     3. peso das perguntas com score 0: ['P1', 'P2'] -> ['P1', 'P2']
     4. impacto na dinâmica relacional: ['P1', 'P2'] -> ['P1']
  Leitura: repete=clarity consciência=action possibilidade=relationship
  Prontidão comercial: 4/7  (Lead qualificada)  critérios={1: 1, 2: 0, 3: 1, 4: 0, 5: 1, 6: 1, 7: 0}
  low_adherence=True ['partner_must_change', 'nothing_to_investigate', 'wants_partner_fixed']   safety_flag=False []
  lead_route=nurture_low_adherence
  risk_flags=['demand_withdraw', 'external_focus', 'history_unexamined', 'loneliness', 'nothing_to_investigate', 'overload', 'partner_must_change', 'wants_partner_fixed']
  tags=['PROFILE_DEMAND_WITHDRAW', 'ATTENTION_CLARITY', 'READINESS_QUALIFIED', 'LOW_ADHERENCE', 'PERSONA_CORE']
====================================================================================================
6. Safety flag (Juliana, 37)
----------------------------------------------------------------------------------------------------
  Q01: A gente mora junto, mas não se encontra mais. Ele está ali e eu me sinto sozinha.
  Q02: Casada ou morando junto há 5 a 10 anos
  Q03: Sim, crianças ou adolescentes em casa
  Q04: 35 a 44
  Q05: Uma solidão difícil de explicar. Ele está do meu lado e, mesmo assim, eu me sinto sozinha.
  Q06: Desisti de pedir. Assumi tudo porque dá menos briga.
  Q07: Entre 2 e 5 anos.
  Q08: Conversas sérias, DRs, ultimatos; Terapia individual
  Q09: Sai do controle: gritos, ameaças, coisas quebradas ou medo de verdade.
  Q10: Eu já estou no limite. Tem dias em que sinto que não aguento mais viver assim, e isso me assusta.
  Q11: Fico em silêncio por fora e remoendo por dentro, até explodir por algo pequeno.
  Q12: Problemas ficavam no ar. Conflito era evitado, não resolvido.
  Q13: Aparece em todo lugar: no trabalho, com os filhos, com as amigas. É o meu jeito, mesmo quando me custa.
  Q14: Em mim. Se eu fosse mais paciente, mais leve, menos cobrança, talvez ele estivesse mais presente.
  Q15: Sinceramente, eu ainda não entendo o que acontece. Só sei que repete.
  Q16: A falta de comunicação. A gente não sabe conversar.
  Q17: Dependeria de como fosse dito. Mas sim, eu toparia olhar.
  Q18: 10/10
  Q19: Agora. Nos próximos dias.
  Q20: Cabe com planejamento ou parcelamento.
  Q21: Entender o que está por trás disso e agir sobre a minha parte, mesmo que dê trabalho.
----------------------------------------------------------------------------------------------------
  Pilares: P1=33  P2=33  P3=11  P4=21  P5=19
  IRC: 23  (No automático)
  Perfil: Repetindo a mochila emocional  afinidades={'profile_overload': 3, 'profile_demand_withdraw': 6, 'profile_emotional_baggage': 7, 'profile_knows_but_repeats': 2}
  Principal Ponto de Atenção: Dinâmica relacional, presença e conexão
     candidatos (diferença <= 5 do menor): ['P3']
  Leitura: repete=relationship consciência=history possibilidade=action
  Prontidão comercial: 7/7  (Alta prioridade comercial)  critérios={1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1}
  low_adherence=False []   safety_flag=True ['safety_violence', 'safety_acute_distress']
  lead_route=safety
  risk_flags=['conflict_avoidance', 'loneliness', 'overload', 'safety_acute_distress', 'safety_violence', 'self_blame']
  tags=['PROFILE_EMOTIONAL_BAGGAGE', 'ATTENTION_RELATIONSHIP', 'READINESS_HIGH', 'SAFETY_FLAG', 'PERSONA_CORE']
====================================================================================================
7. Controle: alta consciência, baixa prontidão (Beatriz, 51)
----------------------------------------------------------------------------------------------------
  Q01: Eu sei explicar direitinho o que acontece entre a gente. Só não consigo fazer diferente na hora.
  Q02: Casada ou morando junto há mais de 20 anos
  Q03: Sim, já crescidos ou morando fora
  Q04: 45 a 52
  Q05: Consigo falar que senti falta dele no dia, sem virar briga. Não resolve tudo, mas aproxima.
  Q06: Hoje dividimos de verdade. Custou algumas conversas duras, mas mudou.
  Q07: Entre 6 meses e 2 anos.
  Q08: Terapia individual; Livros, cursos, podcasts, conteúdos sobre relacionamento
  Q09: Hoje consigo colocar o que sinto de um jeito que ele escuta. Nem sempre muda, mas a conversa anda.
  Q10: Já pesa hoje. Eu não quero esperar dois anos para mexer nisso.
  Q11: Consigo dizer "senti você longe" e perguntar o que está acontecendo com ele, sem virar acusação.
  Q12: Sei bem de onde vêm algumas das minhas reações e já consegui mudar várias delas.
  Q13: Aparece menos do que antes. Já consegui fazer diferente em algumas áreas; o casamento é onde está mais difícil.
  Q14: Separo o que é meu do que é dele e atuo no que está ao meu alcance. Dá trabalho, mas me tira do lugar de vítima ou de carrasco.
  Q15: Já mudei algumas reações de forma consistente. Outras ainda escapam.
  Q16: Uma dinâmica entre nós, alimentada por jeitos de funcionar que eu trouxe de antes e ainda não consegui mudar. Ele tem a parte dele; essa é a minha.
  Q17: Eu quero ver. Prefiro saber a continuar repetindo.
  Q18: 4/10
  Q19: Não estou procurando começar nada agora. Só queria entender.
  Q20: Hoje não cabe.
  Q21: Entender melhor. Ainda não sei se quero mexer em alguma coisa.
----------------------------------------------------------------------------------------------------
  Pilares: P1=83  P2=100  P3=100  P4=100  P5=100
  IRC: 97  (Com a mão no volante)
  Perfil: A que já entendeu, mas continua repetindo  afinidades={'profile_overload': 0, 'profile_demand_withdraw': 0, 'profile_emotional_baggage': 0, 'profile_knows_but_repeats': 7}
  Principal Ponto de Atenção: Clareza sobre o problema e consciência do padrão
     candidatos (diferença <= 5 do menor): ['P1']
  Leitura: repete=clarity consciência=history possibilidade=relationship
  Prontidão comercial: 3/7  (Prontidão intermediária)  critérios={1: 1, 2: 1, 3: 0, 4: 1, 5: 0, 6: 0, 7: 0}
  low_adherence=False []   safety_flag=False []
  lead_route=nurture
  risk_flags=[]
  tags=['PROFILE_KNOWS_BUT_REPEATS', 'ATTENTION_CLARITY', 'READINESS_MEDIUM', 'PERSONA_CORE']
====================================================================================================
8. Controle: sofrimento alto, prontidão baixa (Vanessa, 36)
----------------------------------------------------------------------------------------------------
  Q01: A gente mora junto, mas não se encontra mais. Ele está ali e eu me sinto sozinha.
  Q02: Casada ou morando junto há menos de 5 anos
  Q03: Não
  Q04: 35 a 44
  Q05: Uma solidão difícil de explicar. Ele está do meu lado e, mesmo assim, eu me sinto sozinha.
  Q06: Eu. Se eu não puxar, simplesmente não acontece.
  Q07: Menos de 6 meses. É algo recente.
  Q08: Nada estruturado ainda. Só fui levando.
  Q09: Ele fica na defensiva ou se fecha, eu insisto, e termina pior do que começou.
  Q10: Eu me acostumar. Parar de sentir e virar só mais um casal que divide a casa.
  Q11: Vou atrás. Pergunto o que houve, cobro, insisto, até que ele responda alguma coisa.
  Q12: Nunca tinha pensado na minha infância em relação ao meu casamento.
  Q13: Nunca parei para olhar isso dessa forma.
  Q14: Em mim. Se eu fosse mais paciente, mais leve, menos cobrança, talvez ele estivesse mais presente.
  Q15: Sinceramente, eu ainda não entendo o que acontece. Só sei que repete.
  Q16: A falta de comunicação. A gente não sabe conversar.
  Q17: Dependeria de como fosse dito. Mas sim, eu toparia olhar.
  Q18: 10/10
  Q19: Não sei. Depende de outras coisas antes.
  Q20: Hoje não cabe.
  Q21: Confirmar que eu não estou louca. Que o problema existe.
----------------------------------------------------------------------------------------------------
  Pilares: P1=33  P2=0  P3=0  P4=21  P5=19
  IRC: 15  (No automático)
  Perfil: Presa no ciclo cobrança-afastamento  afinidades={'profile_overload': 2, 'profile_demand_withdraw': 9, 'profile_emotional_baggage': 4, 'profile_knows_but_repeats': 0}
  Principal Ponto de Atenção: Dinâmica relacional, presença e conexão
     candidatos (diferença <= 5 do menor): ['P2', 'P3']
     1. sinais críticos: ['P2', 'P3'] -> ['P3']
  Leitura: repete=relationship consciência=clarity possibilidade=action
  Prontidão comercial: 2/7  (Baixa prontidão)  critérios={1: 0, 2: 0, 3: 1, 4: 1, 5: 0, 6: 0, 7: 0}
  low_adherence=False []   safety_flag=False []
  lead_route=nurture
  risk_flags=['demand_withdraw', 'history_unexamined', 'loneliness', 'overload', 'resignation', 'self_blame']
  tags=['PROFILE_DEMAND_WITHDRAW', 'ATTENTION_RELATIONSHIP', 'READINESS_LOW', 'PERSONA_CORE']
```
<!-- /GEN:SIMULATIONS -->

### Leitura das simulações e ajustes feitos

| Cenário | Esperado | Obtido | Veredito |
|---|---|---|---|
| 1 · Sobrecarregada | Perfil A, prontidão alta | Perfil A (14 vs 5), IRC 36, atenção em Dinâmica relacional (empate quádruplo resolvido pelo critério 4), prontidão 7/7, rota triagem | OK. A atenção cair em P3 e não em P4 faz sentido: ela assume responsabilidade (Q14, Q17 intermediárias) e o que sustenta a repetição é compensar e carregar a relação, que o briefing lista como sinal de P3. |
| 2 · Ciclo cobrança-afastamento | Perfil B, atenção em P3 | Perfil B (14), P3 = 0, IRC 24, prontidão 7/7 | OK. |
| 3 · Mochila emocional | Perfil C, atenção em História | Perfil C (11 vs 7), atenção História (P2 = 17), IRC 33, prontidão 5/7 (sem disponibilidade e sem intenção clara), flag `decision_shared` | OK. Na primeira rodada a atenção caiu em Limites por acúmulo de flags; o critério de sinais críticos passou a contar no pilar da pergunta de origem e o cenário foi revisado para respostas mais típicas da persona. |
| 4 · Já entendeu, mas repete | Perfil D, atenção em Ação, IRC médio-alto | Perfil D (18), P5 = 30 contra demais ≥ 67, IRC 63, prontidão 7/7 | OK. Mostra que IRC alto não impede ponto de atenção claro. |
| 5 · Baixa aderência | low_adherence, fora da rota comercial | Três flags de aderência, prontidão 4/7 (qualificada no número), rota `nurture_low_adherence`, IRC 11 inalterado pelas flags | OK. Qualificação numérica não vira abordagem comercial automática. |
| 6 · Safety flag | safety_flag, sem CTA | Duas flags de segurança, rota `safety`, prontidão 7/7 ignorada para fins de automação | OK. |
| 7 · Controle A | IRC alto, prontidão baixa | IRC 97, prontidão 3/7, rota nutrição | OK. Consciência alta não é qualificação. |
| 8 · Controle B | IRC baixo, prontidão baixa | IRC 15, prontidão 2/7, rota nutrição | OK. Sofrimento alto não é qualificação. |

Verificações do briefing:
- **Uma mesma resposta distorcendo o resultado?** A flag `repetition_intense` (Q07) puxava o desempate para P3 em qualquer pessoa com problema antigo. Foi desvinculada de pilar. Nenhuma alternativa isolada muda mais de 17 pontos em um pilar (granularidade de P1 e P2), o que é aceitável na versão 1; na versão 2, uma terceira pergunta em P1 e P2 reduziria isso.
- **Todos no mesmo perfil?** Não: A, B, C, D, B, C, D, B. O Perfil B aparece mais vezes porque dois cenários de controle foram desenhados com queixa externa; na operação, monitorar a distribuição e revisar se um perfil passar de 55%.
- **Sofrimento confundido com qualificação?** Não: cenários 7 e 8 provam a independência nas duas direções.

## Simulação adicional recomendada antes do lançamento

Rodar 20 respostas reais de pessoas da persona em modo teste, comparar o perfil recebido com a autoavaliação ("qual dos quatro parece mais com você?") e ajustar afinidades onde a concordância ficar abaixo de 70%.
