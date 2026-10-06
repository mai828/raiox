#!/usr/bin/env python3
"""Gera docs/02-perguntas.md e preenche blocos <!-- GEN:... --> em outros docs a partir de data/quiz.json."""
import json, os, re, io, contextlib
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
import sys; sys.path.insert(0, HERE)
import score as eng

Q = eng.QUIZ; META = Q["meta"]
PN = {k: v["name"] for k, v in META["pillars"].items()}
PROF = {k: v["name"] for k, v in META["profiles"].items()}
PHASES = {1: "Fase 1 · Reconhecimento", 2: "Fase 2 · Repetição", 3: "Fase 3 · Custo",
          4: "Fase 4 · O que pode estar por trás", 5: "Fase 5 · Possibilidade", 6: "Fase 6 · Prontidão"}
KIND = {"diagnostic": "Leitura estratégica", "context": "Contexto", "commercial": "Qualificação comercial"}
TYPE = {"single": "Múltipla escolha (1 resposta)", "multi": "Múltipla escolha (várias respostas)", "scale_0_10": "Escala 0 a 10"}
CRIT = {1: "Critério 1 · problema há 6 meses ou mais", 2: "Critério 2 · duas ou mais soluções tentadas",
        3: "Critério 3 · urgência 7/10 ou maior", 4: "Critério 4 · aceita investigar a própria participação",
        5: "Critério 5 · disponibilidade em 30 dias", 6: "Critério 6 · capacidade de investir ~R$ 7.500",
        7: "Critério 7 · quer agir e construir, não só validação"}

def prof_str(p):
    return ", ".join(f"{k}+{v}" for k, v in (p or {}).items()) or "—"

def flags_str(fl):
    out = []
    for f in fl or []:
        m = META["risk_flags"][f]
        tag = "SAFETY" if m.get("safety") else ("BAIXA ADERÊNCIA" if m.get("low_adherence") else "risco")
        out.append(f"`{f}` ({tag})")
    return ", ".join(out) or "—"

def phase_label(q):
    if q["kind"] == "context": return "Fase 1 · Contexto"
    return PHASES[q["phase"]]

def gen_questions_doc():
    L = []
    L.append("# B e C · As 21 perguntas, em ordem\n")
    L.append("> Gerado automaticamente por `scripts/build_docs.py` a partir de `data/quiz.json`. Para alterar texto, score ou afinidade, edite o JSON e rode o script.\n")
    L.append("## B · Tabela-resumo\n")
    L.append("Estrutura: 14 perguntas de leitura estratégica (12 pontuam pilares; Q07 e Q08 medem repetição e alimentam a prontidão), 4 de qualificação comercial e 3 de contexto. Tempo-alvo: 7 a 10 minutos.\n")
    L.append("| # | Fase | Tipo | Pergunta (resumo) | Pilar | Peso | Alimenta |")
    L.append("|---|------|------|-------------------|-------|------|----------|")
    for q in Q["questions"]:
        feeds = []
        if q.get("commercial_criterion"): feeds.append(f"Crit. {q['commercial_criterion']}")
        if q["kind"] == "context": feeds.append("Contexto")
        if any(o.get("flags") for o in q.get("options", [])):
            fl = sorted({f for o in q["options"] for f in o.get("flags", [])})
            if any(META["risk_flags"][f].get("safety") for f in fl): feeds.append("Safety")
            if any(META["risk_flags"][f].get("low_adherence") for f in fl): feeds.append("Aderência")
        if q["kind"] == "diagnostic" and q.get("pillar"): feeds.append("Perfis")
        L.append(f"| {q['id']} | {phase_label(q)} | {KIND[q['kind']]} | {q['text']} | {q.get('pillar') or '—'} | {q.get('weight') or '—'} | {', '.join(feeds) or '—'} |")
    L.append("")
    L.append("### Telas de transição (interstitials)\n")
    L.append("Telas curtas, sem botão extra além de \"Continuar\". Elas sustentam a narrativa e sinalizam que o quiz não é um cadastro.\n")
    L.append("| Antes de | Texto da tela |")
    L.append("|---|---|")
    L.append("| Q01 (abertura) | **RAIO-X DO SEU RELACIONAMENTO**<br>Descubra o que pode estar mantendo seu relacionamento no mesmo lugar, mesmo depois de tudo que você já tentou.<br><br>21 perguntas. Entre 7 e 10 minutos. Não existe resposta certa; existe a resposta que mais parece com você. Ao final você recebe uma leitura dos padrões que apareceram nas suas respostas. Isso não é um diagnóstico psicológico: é um mapa para você pensar com mais clareza. |")
    L.append("| Q02 | Três cliques rápidos para a leitura ser sobre a sua vida, e não sobre uma mulher genérica. |")
    L.append("| Q05 | Agora, de volta ao que importa. |")
    L.append("| Q07 | Até aqui você descreveu o que aparece. Agora vamos olhar há quanto tempo isso aparece. |")
    L.append("| Q11 | Você já viu o que acontece e há quanto tempo acontece. As próximas perguntas são sobre a parte menos visível: o que pode estar sustentando essa repetição. Nenhuma delas é sobre culpa. |")
    L.append("| Q15 | Últimas perguntas da leitura. Elas são sobre a distância entre saber e conseguir fazer diferente. |")
    L.append("| Q18 | Quase lá. As quatro próximas perguntas não mudam a sua leitura. Elas me ajudam a entender em que momento você está, para o que vem depois fazer sentido para você. |")
    L.append("| Captura | Seu Raio-X está pronto. Preencha seus dados para acessar a leitura completa. |")
    L.append("")
    L.append("## C · Ficha completa de cada pergunta\n")
    for q in Q["questions"]:
        L.append(f"### {q['id']} · {phase_label(q)}\n")
        L.append(f"**Texto exato:** {q['text']}\n")
        L.append(f"**Objetivo estratégico:** {q['goal']}\n")
        L.append(f"**Tipo:** {TYPE[q['type']]}  ")
        L.append(f"**Classificação:** {KIND[q['kind']]}  ")
        L.append(f"**Campo:** `{q['field']}`" + (f" (deriva: {', '.join('`'+f+'`' for f in q['derived_fields'])})" if q.get("derived_fields") else "") + "  ")
        if q.get("pillar"):
            L.append(f"**Pilar afetado:** {q['pillar']} · {PN[q['pillar']]}  ")
            L.append(f"**Peso:** {q['weight']}  ")
        else:
            L.append("**Pilar afetado:** nenhum (não pontua pilares)  ")
        if q.get("commercial_criterion"):
            L.append(f"**Efeito sobre prontidão comercial:** {CRIT[q['commercial_criterion']]}  ")
        else:
            L.append("**Efeito sobre prontidão comercial:** nenhum  ")
        L.append("")
        if q["type"] == "scale_0_10":
            sc = q["scale"]
            L.append(f"Escala de {sc['min']} a {sc['max']}. Rótulo mínimo: \"{sc['min_label']}\". Rótulo máximo: \"{sc['max_label']}\". Critério atendido quando valor {q['criterion_rule']}.\n")
        else:
            is_diag = bool(q.get("pillar"))
            if is_diag:
                L.append("| Ordem na tela | Alternativa (texto exato) | Score | Afinidade de perfil | Flags |")
                L.append("|---|---|---|---|---|")
                for i, o in enumerate(q["options"], 1):
                    L.append(f"| {i} | {o['text']} | {o['score']} | {prof_str(o.get('profiles'))} | {flags_str(o.get('flags'))} |")
            elif q["kind"] == "context":
                L.append("| Ordem na tela | Alternativa (texto exato) | Valor armazenado |")
                L.append("|---|---|---|")
                for i, o in enumerate(q["options"], 1):
                    val = o.get("value") or ", ".join(f"{k}={v}" for k, v in (o.get("derive") or {}).items())
                    L.append(f"| {i} | {o['text']} | `{val}` |")
            else:
                L.append("| Ordem na tela | Alternativa (texto exato) | Valor | Critério atendido | Afinidade | Flags |")
                L.append("|---|---|---|---|---|---|")
                for i, o in enumerate(q["options"], 1):
                    if q["type"] == "multi":
                        crit = "exclusiva, zera contagem" if o.get("exclusive") else ("conta como solução" + (" · item de conhecimento" if o.get("knowledge_item") else ""))
                    else:
                        crit = "sim" if o.get("criterion_met") else "não"
                    L.append(f"| {i} | {o['text']} | `{o.get('value', o['id'])}` | {crit} | {prof_str(o.get('profiles'))} | {flags_str(o.get('flags'))} |")
            if q["type"] == "multi":
                r = q["multi_rules"]
                L.append("")
                L.append(f"Regras da multi-seleção: `previous_solutions_count` = quantidade marcada, excluindo a alternativa exclusiva. Afinidade de perfil: A, B e C somam o que está na tabela, com teto de {r['profile_cap']} pontos por perfil nesta pergunta. Perfil D: {r['profile_D_rule']}.")
            L.append("")
        L.append(f"**Por que está nesta posição:** {q['position_rationale']}\n")
    return "\n".join(L)

def gen_scoring_table():
    L = []
    L.append("| Pilar | Pergunta | Peso | Alternativas e scores (ordem da tela) | Máximo ponderado |")
    L.append("|---|---|---|---|---|")
    mx = eng.pillar_max()
    for p in ["P1", "P2", "P3", "P4", "P5"]:
        qs = [q for q in Q["questions"] if q.get("pillar") == p]
        for i, q in enumerate(qs):
            scores = " · ".join(f"{o['id'].upper()}={o['score']}" for o in q["options"])
            first = f"**{p}** · {PN[p]}" if i == 0 else ""
            last = f"**{mx[p]:g}**" if i == 0 else ""
            L.append(f"| {first} | {q['id']} | {q['weight']} | {scores} | {last} |")
    return "\n".join(L)

def gen_simulations():
    out = io.StringIO()
    with contextlib.redirect_stdout(out):
        for name, ans in eng.SIMULATIONS.items():
            eng.report(name, ans, eng.score(ans))
    txt = out.getvalue()
    return "```text\n" + txt + "```"

def fill(path, blocks):
    s = open(path, encoding="utf-8").read()
    for key, content in blocks.items():
        pat = re.compile(rf"(<!-- GEN:{key} -->).*?(<!-- /GEN:{key} -->)", re.S)
        if not pat.search(s):
            raise SystemExit(f"marcador GEN:{key} não encontrado em {path}")
        s = pat.sub(lambda m: m.group(1) + "\n" + content + "\n" + m.group(2), s)
    open(path, "w", encoding="utf-8").write(s)

if __name__ == "__main__":
    open(os.path.join(ROOT, "docs", "02-perguntas.md"), "w", encoding="utf-8").write(gen_questions_doc())
    for f, blocks in {
        "docs/03-scoring-e-regras.md": {"SCORING_TABLE": gen_scoring_table()},
        "docs/06-testes-e-checklist.md": {"SIMULATIONS": gen_simulations()},
    }.items():
        p = os.path.join(ROOT, f)
        if os.path.exists(p):
            fill(p, blocks)
        else:
            print("aviso: ainda não existe", f)
    print("docs gerados")
