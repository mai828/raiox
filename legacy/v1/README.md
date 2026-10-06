# RAIO-X DO SEU RELACIONAMENTO

> Descubra o que pode estar mantendo seu relacionamento no mesmo lugar, mesmo depois de tudo que você já tentou.

Especificação completa do quiz de qualificação para o **Compatíveis**, de Márcio Conceição: estratégia, perguntas, scoring, perfis, copy de resultado, dados, automação, tracking e testes.

Não é diagnóstico psicológico, psiquiátrico, médico ou clínico. É ferramenta de reflexão, leitura de padrões e orientação.

## Estrutura

| Arquivo | Blocos do briefing | Conteúdo |
|---|---|---|
| `docs/01-visao-estrategica.md` | A | Jornada, arco de consciência, mecanismo, rotas, KPI |
| `docs/02-perguntas.md` | B, C | Tabela das 21 perguntas, interstitials e ficha completa de cada uma (gerado do JSON) |
| `docs/03-scoring-e-regras.md` | D, E, F, G, H, I, J, K | Scoring dos pilares, IRC, ponto de atenção, perfis, desempates, prontidão, baixa aderência, segurança |
| `docs/04-copy-resultados.md` | L, M, N, O, P, Q, R, S | Textos de perfil, faixas, pontos de atenção, pilares, captura, tela de resultado, Compatíveis, CTA |
| `docs/05-dados-automacao-tracking.md` | T, U, V, W, X | Campos Fillout, CRM, tags, eventos, lógica condicional e automações |
| `docs/06-testes-e-checklist.md` | Y, seção 28 | Checklist técnico e oito simulações com resultados |
| `data/quiz.json` | — | Fonte única: perguntas, alternativas, scores, pesos, afinidades, flags |
| `scripts/score.py` | — | Motor de scoring de referência e simulações |
| `scripts/build_docs.py` | — | Regenera `docs/02` e os blocos gerados de `docs/03` e `docs/06` |

## Como usar

```bash
python3 scripts/score.py          # roda as simulações e imprime pilares, IRC, perfil, atenção, prontidão, flags
python3 scripts/score.py --json   # mesma saída em JSON
python3 scripts/build_docs.py     # regenera a documentação a partir de data/quiz.json
```

Para alterar uma pergunta, score, peso ou afinidade: edite `data/quiz.json`, rode `build_docs.py` e `score.py`, e confira se as simulações continuam fazendo sentido.

## Resumo da arquitetura

- **21 perguntas**: 14 de leitura estratégica (12 pontuam pilares), 4 de qualificação comercial, 3 de contexto. 7 a 10 minutos.
- **Cinco pilares** (0 a 100 cada): clareza, história, dinâmica relacional, limites e papéis, capacidade de agir.
- **Índice de Reorganização Relacional**: média dos cinco, em quatro faixas com nomes humanos.
- **Principal Ponto de Atenção**: pilar mais baixo, com desempate em quatro etapas.
- **Quatro perfis** por afinidade independente: Sobrecarregada, Cobrança-afastamento, Mochila emocional, Já entendeu mas repete.
- **Prontidão comercial** separada (0 a 7); pelo menos 4 para conversa.
- **Flags** de baixa aderência e segurança mudam a rota, não o índice.
- **CTA**: "Quero entender o que está por trás disso." → WhatsApp → triagem → conversa de aplicação → Compatíveis.

## Versão web funcional

A pasta `web/` contém o quiz pronto para uso, com as 21 perguntas, telas de transição, captura, cálculo e tela de resultado, usando `data/quiz.json` como fonte.

| Arquivo | Uso |
|---|---|
| `web/index.html` | Abra direto no navegador (duplo clique) ou hospede em qualquer servidor estático. Arquivo único, sem dependências além das fontes do Google. |
| `web/artifact.html` | Mesma página sem o esqueleto HTML, para publicação como artefato. |
| `web/src/` | Fontes: `app.js` (motor de scoring portado de `scripts/score.py` + interface), `copy.js` (textos do resultado), `styles.css`, `page.html`. |
| `scripts/build_web.py` | Regenera as duas versões a partir de `web/src/` e `data/quiz.json`. |

Antes de publicar para o público:
1. Em `web/src/app.js`, troque `CONFIG.whatsappNumber` pelo número da equipe (55 + DDD + número) e rode `python3 scripts/build_web.py`.
2. Remova ou esconda o bloco "Dados gerados para o CRM" no fim do resultado (ele existe para validar a integração).
3. Ligue o envio dos dados: a função `track()` já empurra eventos para `window.dataLayer` (GTM); o objeto `payload` no resultado é o que deve ir para o CRM via webhook.

Verificação: o motor em JavaScript foi comparado ao Python nos oito cenários de `scripts/score.py` (pilares, IRC, perfil, ponto de atenção, leitura, prontidão, rota, flags e tags), com resultado idêntico.
