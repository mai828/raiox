#!/usr/bin/env python3
"""
Motor de scoring do RAIO-X DO SEU RELACIONAMENTO.

Uso:
    python3 scripts/score.py            # roda as simulações obrigatórias
    python3 scripts/score.py --json     # imprime os resultados em JSON

A função `score(answers)` recebe um dicionário {question_id: option_id | [option_ids] | int}
e devolve o resultado completo (pilares, IRC, perfil, ponto de atenção, prontidão, flags).
Esta é a referência de implementação para a lógica condicional do Fillout / automações.
"""
import json
import os
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
QUIZ = json.load(open(os.path.join(HERE, "..", "data", "quiz.json"), encoding="utf-8"))
META = QUIZ["meta"]
QBY = {q["id"]: q for q in QUIZ["questions"]}
PILLARS = ["P1", "P2", "P3", "P4", "P5"]
PROFILES = ["A", "B", "C", "D"]


def _opt(q, oid):
    for o in q["options"]:
        if o["id"] == oid:
            return o
    raise KeyError(f"{q['id']}: alternativa '{oid}' não existe")


def pillar_max():
    """Máximo ponderado por pilar (soma de peso x 3)."""
    mx = defaultdict(float)
    for q in QUIZ["questions"]:
        if q.get("pillar"):
            mx[q["pillar"]] += q["weight"] * 3
    return dict(mx)


def score(answers):
    pts = defaultdict(float)             # pontos ponderados por pilar
    zeros = defaultdict(int)             # respostas com score 0 por pilar
    zero_weight = defaultdict(float)     # peso das perguntas com score 0 por pilar
    crit_flags = defaultdict(int)        # sinais críticos por pilar
    prof = {p: 0 for p in PROFILES}      # afinidade de perfil
    prof_heavy = {p: 0 for p in PROFILES}  # afinidade vinda de perguntas peso 1.25
    prof_strong = {p: 0 for p in PROFILES}  # quantidade de sinais fortes (+2)
    flags = []
    criteria = {}
    fields = {}

    def add_profiles(q, o):
        w = q.get("weight") or 1.0
        for p, v in (o.get("profiles") or {}).items():
            prof[p] += v
            if w > 1.0:
                prof_heavy[p] += v
            if v >= 2:
                prof_strong[p] += 1

    def add_flags(o, q):
        for f in o.get("flags", []):
            flags.append(f)
            # sinais críticos contam para o pilar da PERGUNTA em que surgiram
            if q.get("pillar") and not META["risk_flags"][f].get("safety"):
                crit_flags[q["pillar"]] += 1

    for qid, ans in answers.items():
        q = QBY[qid]
        if q["type"] == "scale_0_10":
            fields[q["field"]] = ans
            if q.get("commercial_criterion"):
                criteria[q["commercial_criterion"]] = ans >= 7
            continue

        if q["type"] == "multi":
            chosen = [a for a in ans]
            opts = [_opt(q, a) for a in chosen]
            excl = set(q["multi_rules"]["count_excludes"])
            count = len([o for o in opts if o["id"] not in excl])
            fields[q["field"]] = chosen
            fields["previous_solutions_count"] = count
            if q.get("commercial_criterion"):
                criteria[q["commercial_criterion"]] = count >= 2
            # afinidades: A/B/C somadas (cap 2); D pela regra de knowledge_items
            tmp = defaultdict(int)
            for o in opts:
                for p, v in (o.get("profiles") or {}).items():
                    tmp[p] += v
            k_items = len([o for o in opts if o.get("knowledge_item")])
            if k_items >= 2:
                tmp["D"] = 2
            elif k_items == 1:
                tmp["D"] = 1
            cap = q["multi_rules"]["profile_cap"]
            for p, v in tmp.items():
                prof[p] += min(v, cap)
            continue

        o = _opt(q, ans)
        fields[q["field"]] = o.get("value", o["id"])
        for k, v in (o.get("derive") or {}).items():
            fields[k] = v
        if q.get("pillar"):
            w = q["weight"]
            pts[q["pillar"]] += o["score"] * w
            if o["score"] == 0:
                zeros[q["pillar"]] += 1
                zero_weight[q["pillar"]] += w
        if q.get("commercial_criterion") and "criterion_met" in o:
            criteria[q["commercial_criterion"]] = bool(o["criterion_met"])
        add_profiles(q, o)
        add_flags(o, q)

    # ---- Pilares normalizados 0-100
    mx = pillar_max()
    pillar_scores = {p: round(100 * pts[p] / mx[p]) for p in PILLARS}

    # ---- IRC: média simples dos cinco pilares
    irc = round(sum(pillar_scores.values()) / 5)
    band = next(b for b in META["irc_bands"] if b["min"] <= irc <= b["max"])

    # ---- Principal Ponto de Atenção: menor score, com desempate
    impact = META["pillar_impact_order"]
    lowest = min(pillar_scores.values())
    tied = [p for p in PILLARS if pillar_scores[p] - lowest <= 5]
    attention_trace = [f"candidatos (diferença <= 5 do menor): {tied}"]
    if len(tied) > 1:
        tied = _tiebreak(tied, [
            ("1. sinais críticos", lambda p: -crit_flags[p]),
            ("2. respostas com score 0", lambda p: -zeros[p]),
            ("3. peso das perguntas com score 0", lambda p: -zero_weight[p]),
            ("4. impacto na dinâmica relacional", lambda p: impact.index(p)),
        ], attention_trace)
    attention = tied[0]

    # ---- Perfil predominante com desempate
    top = max(prof.values())
    cands = [p for p in PROFILES if prof[p] == top]
    profile_trace = [f"afinidades: {prof}"]
    if len(cands) > 1:
        fallback = META["attention_to_profile_fallback"][attention]
        cands = _tiebreak(cands, [
            ("1. pontos em perguntas peso 1.25", lambda p: -prof_heavy[p]),
            ("2. sinais fortes (+2)", lambda p: -prof_strong[p]),
            ("3. perfil que melhor explica o ponto de atenção", lambda p: 0 if p == fallback else 1),
        ], profile_trace)
    profile = cands[0]

    # ---- Prontidão comercial (separada do sofrimento)
    readiness = sum(1 for c in range(1, 8) if criteria.get(c))
    cband = next(b for b in META["commercial_bands"] if b["min"] <= readiness <= b["max"])

    # ---- Flags agregadas
    low_adherence = [f for f in flags if META["risk_flags"][f].get("low_adherence")]
    safety = [f for f in flags if META["risk_flags"][f].get("safety")]

    if safety:
        route = "safety"
    elif low_adherence:
        route = "nurture_low_adherence"
    elif readiness >= 4:
        route = "sales_triage"
    else:
        route = "nurture"

    tags = [META["profiles"][profile]["tag"], META["pillars"][attention]["tag"], cband["tag"]]
    if low_adherence:
        tags.append("LOW_ADHERENCE")
    if safety:
        tags.append("SAFETY_FLAG")
    if "decision_shared" in flags:
        tags.append("DECISION_SHARED")
    if "repetition_intense" in flags:
        tags.append("REPETITION_INTENSE")
    if fields.get("age_range") in ("35-44", "45-52") and fields.get("relationship_status") == "married_or_cohabiting":
        tags.append("PERSONA_CORE")

    # ---- Leitura dos pilares para o resultado
    ordered = sorted(PILLARS, key=lambda p: (pillar_scores[p], -impact.index(p)))
    most_repeating = attention
    most_aware = max(PILLARS, key=lambda p: (pillar_scores[p], impact.index(p)))
    # maior possibilidade de reorganização: pilar intermediário (não o menor, não o maior)
    # com menor número de sinais críticos; onde a alavanca é mais acessível
    middle = [p for p in PILLARS if p not in (most_repeating, most_aware)]
    most_possible = min(middle, key=lambda p: (crit_flags[p], -pillar_scores[p], impact.index(p)))

    return {
        "fields": fields,
        "pillar_scores": {META["pillars"][p]["field"]: pillar_scores[p] for p in PILLARS},
        "pillar_scores_by_code": pillar_scores,
        "relationship_reorganization_index": irc,
        "irc_band": band["key"],
        "irc_band_name": band["name"],
        "dominant_profile": META["profiles"][profile]["key"],
        "dominant_profile_name": META["profiles"][profile]["name"],
        "profile_affinity": {META["profiles"][p]["key"]: prof[p] for p in PROFILES},
        "profile_trace": profile_trace,
        "main_attention_point": META["pillars"][attention]["key"],
        "main_attention_point_name": META["pillars"][attention]["name"],
        "attention_trace": attention_trace,
        "pillar_reading": {
            "most_repeating": META["pillars"][most_repeating]["key"],
            "most_aware": META["pillars"][most_aware]["key"],
            "most_possible": META["pillars"][most_possible]["key"],
        },
        "commercial_criteria": {c: bool(criteria.get(c)) for c in range(1, 8)},
        "commercial_readiness": readiness,
        "commercial_classification": cband["key"],
        "commercial_classification_name": cband["name"],
        "lead_route": route,
        "low_adherence": bool(low_adherence),
        "low_adherence_flags": low_adherence,
        "safety_flag": bool(safety),
        "safety_flags": safety,
        "risk_flags": sorted(set(flags)),
        "critical_signals_by_pillar": dict(crit_flags),
        "zeros_by_pillar": dict(zeros),
        "tags": tags,
    }


def _tiebreak(cands, rules, trace):
    for name, key in rules:
        best = min(key(c) for c in cands)
        nxt = [c for c in cands if key(c) == best]
        trace.append(f"{name}: {cands} -> {nxt}")
        cands = nxt
        if len(cands) == 1:
            break
    return cands


# ---------------------------------------------------------------------------
# Simulações obrigatórias (seção 28 do briefing)
# ---------------------------------------------------------------------------
SIMULATIONS = {
    "1. Sobrecarregada (Renata, 44)": {
        "Q01": "c", "Q02": "c", "Q03": "a", "Q04": "b", "Q05": "b", "Q06": "a",
        "Q07": "d", "Q08": ["a", "f"], "Q09": "b", "Q10": "c", "Q11": "c",
        "Q12": "a", "Q13": "b", "Q14": "d", "Q15": "e", "Q16": "b", "Q17": "b",
        "Q18": 8, "Q19": "b", "Q20": "b", "Q21": "a",
    },
    "2. Ciclo cobrança-afastamento (Patrícia, 39)": {
        "Q01": "a", "Q02": "b", "Q03": "a", "Q04": "b", "Q05": "a", "Q06": "c",
        "Q07": "c", "Q08": ["a", "g", "d"], "Q09": "a", "Q10": "c", "Q11": "a",
        "Q12": "b", "Q13": "a", "Q14": "c", "Q15": "e", "Q16": "b", "Q17": "b",
        "Q18": 9, "Q19": "a", "Q20": "a", "Q21": "a",
    },
    "3. Mochila emocional (Cláudia, 48)": {
        "Q01": "e", "Q02": "d", "Q03": "b", "Q04": "c", "Q05": "b", "Q06": "b",
        "Q07": "e", "Q08": ["f", "c"], "Q09": "c", "Q10": "b", "Q11": "b",
        "Q12": "c", "Q13": "e", "Q14": "b", "Q15": "c", "Q16": "c", "Q17": "b",
        "Q18": 7, "Q19": "c", "Q20": "c", "Q21": "b",
    },
    "4. Já entendeu, mas repete (Fernanda, 41)": {
        "Q01": "b", "Q02": "c", "Q03": "a", "Q04": "b", "Q05": "d", "Q06": "c",
        "Q07": "d", "Q08": ["b", "c", "d", "e", "a"], "Q09": "d", "Q10": "d", "Q11": "e",
        "Q12": "e", "Q13": "c", "Q14": "d", "Q15": "a", "Q16": "e", "Q17": "e",
        "Q18": 8, "Q19": "a", "Q20": "a", "Q21": "a",
    },
    "5. Baixa aderência (Simone, 46)": {
        "Q01": "a", "Q02": "c", "Q03": "a", "Q04": "c", "Q05": "a", "Q06": "b",
        "Q07": "c", "Q08": ["a"], "Q09": "b", "Q10": "c", "Q11": "a",
        "Q12": "d", "Q13": "a", "Q14": "a", "Q15": "e", "Q16": "a", "Q17": "d",
        "Q18": 9, "Q19": "a", "Q20": "a", "Q21": "d",
    },
    "6. Safety flag (Juliana, 37)": {
        "Q01": "d", "Q02": "b", "Q03": "a", "Q04": "b", "Q05": "a", "Q06": "d",
        "Q07": "c", "Q08": ["a", "c"], "Q09": "e", "Q10": "f", "Q11": "d",
        "Q12": "b", "Q13": "b", "Q14": "b", "Q15": "e", "Q16": "b", "Q17": "b",
        "Q18": 10, "Q19": "a", "Q20": "b", "Q21": "a",
    },
    "7. Controle: alta consciência, baixa prontidão (Beatriz, 51)": {
        "Q01": "b", "Q02": "d", "Q03": "b", "Q04": "c", "Q05": "e", "Q06": "e",
        "Q07": "b", "Q08": ["c", "d"], "Q09": "f", "Q10": "e", "Q11": "f",
        "Q12": "f", "Q13": "d", "Q14": "e", "Q15": "d", "Q16": "e", "Q17": "a",
        "Q18": 4, "Q19": "e", "Q20": "d", "Q21": "b",
    },
    "8. Controle: sofrimento alto, prontidão baixa (Vanessa, 36)": {
        "Q01": "d", "Q02": "a", "Q03": "c", "Q04": "b", "Q05": "a", "Q06": "a",
        "Q07": "a", "Q08": ["h"], "Q09": "a", "Q10": "a", "Q11": "a",
        "Q12": "d", "Q13": "e", "Q14": "b", "Q15": "e", "Q16": "b", "Q17": "b",
        "Q18": 10, "Q19": "d", "Q20": "d", "Q21": "c",
    },
}


def _answer_text(qid, ans):
    q = QBY[qid]
    if q["type"] == "scale_0_10":
        return f"{ans}/10"
    if q["type"] == "multi":
        return "; ".join(_opt(q, a)["text"] for a in ans)
    return _opt(q, ans)["text"]


def report(name, answers, r):
    print("=" * 100)
    print(name)
    print("-" * 100)
    for qid, ans in answers.items():
        print(f"  {qid}: {_answer_text(qid, ans)}")
    print("-" * 100)
    ps = r["pillar_scores_by_code"]
    print("  Pilares: " + "  ".join(f"{p}={ps[p]}" for p in PILLARS))
    print(f"  IRC: {r['relationship_reorganization_index']}  ({r['irc_band_name']})")
    print(f"  Perfil: {r['dominant_profile_name']}  afinidades={r['profile_affinity']}")
    for t in r["profile_trace"][1:]:
        print(f"     desempate perfil -> {t}")
    print(f"  Principal Ponto de Atenção: {r['main_attention_point_name']}")
    for t in r["attention_trace"]:
        print(f"     {t}")
    print(f"  Leitura: repete={r['pillar_reading']['most_repeating']} "
          f"consciência={r['pillar_reading']['most_aware']} possibilidade={r['pillar_reading']['most_possible']}")
    print(f"  Prontidão comercial: {r['commercial_readiness']}/7  ({r['commercial_classification_name']})  "
          f"critérios={ {k: int(v) for k, v in r['commercial_criteria'].items()} }")
    print(f"  low_adherence={r['low_adherence']} {r['low_adherence_flags']}   safety_flag={r['safety_flag']} {r['safety_flags']}")
    print(f"  lead_route={r['lead_route']}")
    print(f"  risk_flags={r['risk_flags']}")
    print(f"  tags={r['tags']}")


if __name__ == "__main__":
    mx = pillar_max()
    if "--json" in sys.argv:
        out = {name: score(ans) for name, ans in SIMULATIONS.items()}
        print(json.dumps(out, ensure_ascii=False, indent=2))
        sys.exit(0)
    print("Máximo ponderado por pilar:", mx)
    for name, ans in SIMULATIONS.items():
        report(name, ans, score(ans))
