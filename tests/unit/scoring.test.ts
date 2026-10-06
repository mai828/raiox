import { describe, expect, it } from "vitest";
import { summarize, calculateDimensionScores, childhoodOverlap } from "@/lib/scoring";
import type { QuizAnswers } from "@/types";

const base: QuizAnswers = { Q01: "A", Q02: "11_20", Q03: "yes_home", Q26: "conversation", Q27: "1_3y", Q28: 8, Q29: "weeks", Q30: "can", Q31: "no" };

/** Cenário 1: relação preservada com problema localizado (intimidade). */
const preserved: QuizAnswers = {
  ...base, Q04: "four_plus", Q05: "knows", Q06: "practical", Q07: "F", Q08: "resumed", Q09: "resolve", Q10: "respect",
  Q11: "balanced", Q12: "rarely", Q13: "let_go", Q14: "ask_clearly", Q15: "less", Q16: "rare", Q17: "weeks", Q18: "admire", Q19: "built_together",
  Q20: "ask_directly", Q21: "say_clearly", Q22: "agreement", Q23: "would_work", Q24: ["humor", "affection", "respect", "partnership"], Q25: ["talk_differently"],
  Q26: "affection", Q27: "3_6m", Q28: 5, Q29: "organize", Q30: "organize",
};

/** Cenário 2: sobrecarga intensa. */
const overload: QuizAnswers = {
  ...base, Q04: "one", Q05: "solve_first", Q06: "practical", Q07: "C", Q08: "time_passes", Q09: "one_two_themes", Q10: "irony",
  Q11: "me_almost_all", Q12: "almost_always", Q13: "redo", Q14: "do_alone", Q15: "one_sided", Q16: "less", Q17: "months", Q18: "care_lost", Q19: "intention",
  Q20: "withdraw", Q21: "do_myself", Q22: "agreement", Q23: "partner_not_assume", Q24: ["respect", "projects"], Q25: ["talk_differently", "demand_clearly", "do_more"], Q26: "partnership",
};

/** Cenário 3: cobrança-afastamento. */
const demandWithdraw: QuizAnswers = {
  ...base, Q04: "two_three", Q05: "part", Q06: "me", Q07: "A", Q08: "me_first", Q09: "same_fight", Q10: "irony",
  Q11: "areas", Q12: "sometimes", Q13: "guide", Q14: "wait_notice", Q15: "less", Q16: "desire_gap", Q17: "months", Q18: "less", Q19: "intention",
  Q20: "demand", Q21: "explain_repeat", Q22: "agreement", Q23: "chaos", Q24: ["affection", "humor", "my_will"], Q25: ["talk_differently", "demand_less"], Q26: "conversation",
};

/** Cenário 4: baixa conexão emocional com parceria razoável. */
const lowConnection: QuizAnswers = {
  ...base, Q04: "none", Q05: "rarely", Q06: "no_pattern", Q07: "C", Q08: "time_passes", Q09: "avoid", Q10: "respect",
  Q11: "balanced", Q12: "sometimes", Q13: "let_go", Q14: "ask_clearly", Q15: "almost_gone", Q16: "rare", Q17: "cant_remember", Q18: "less", Q19: "separate",
  Q20: "withdraw", Q21: "keep_change", Q22: "agreement", Q23: "would_work", Q24: ["respect", "partnership"], Q25: ["give_space"], Q26: "affection",
};

/** Cenário 5a: história com sobreposição real (um falava, outro se fechava + cobrança-afastamento atual). */
const baggageMatch: QuizAnswers = { ...demandWithdraw, Q22: "talk_close", Q23: "guilt", Q25: ["talk_differently"] };
/** Cenário 5b: conflito na infância SEM sobreposição com o presente. */
const baggageNoMatch: QuizAnswers = { ...preserved, Q22: "escalation" };

/** Cenário 6: muitas tentativas e repetição. */
const knowsRepeats: QuizAnswers = {
  ...base, Q04: "one", Q05: "part", Q06: "small_old", Q07: "D", Q08: "peace_unresolved", Q09: "same_fight", Q10: "irony",
  Q11: "areas", Q12: "sometimes", Q13: "guide", Q14: "ask_clearly", Q15: "less", Q16: "less", Q17: "months", Q18: "less", Q19: "intention",
  Q20: "ask_directly", Q21: "evaluate", Q22: "no_pattern", Q23: "would_work", Q24: ["affection", "respect"],
  Q25: ["talk_differently", "demand_less", "therapy_individual", "therapy_couple", "course_book", "change_self"], Q27: "gt3y",
};

/** Cenário 7: safety flag. */
const safety: QuizAnswers = { ...demandWithdraw, Q10: "my_fear", Q31: "yes" };

describe("dimensões", () => {
  it("normaliza 0–100 e remove null do denominador", () => {
    const d = calculateDimensionScores({ Q15: "natural", Q16: "na" });
    expect(d.affection).toBe(100);
    const d2 = calculateDimensionScores({ Q15: "natural", Q16: "none" });
    expect(d2.affection).toBe(50);
    expect(d2.connection).toBeNull();
  });
  it("Q10 participa de conversa e de respeito/futuro", () => {
    const d = calculateDimensionScores({ Q10: "insults" });
    expect(d.conversation).toBe(25);
    expect(d.respect_future).toBe(25);
  });
  it("aplica peso 1.25 em Q07/Q08/Q11/Q12", () => {
    // Q07 = 0 (peso 1.25) e Q09 = 4 (peso 1): 4 / (5 + 4) = 44
    const d = calculateDimensionScores({ Q07: "C", Q09: "resolve" });
    expect(d.conversation).toBe(44);
  });
});

describe("cenário 1 · preservada com problema localizado", () => {
  const r = summarize(preserved);
  it("scores altos na maioria e tensão específica em afeto", () => {
    expect(r.dimensions.connection).toBeGreaterThanOrEqual(75);
    expect(r.dimensions.conversation).toBeGreaterThanOrEqual(75);
    expect(r.dimensions.partnership).toBeGreaterThanOrEqual(75);
    expect(r.strain.axes).toEqual(["affection"]);
    expect(r.index).toBeGreaterThanOrEqual(75);
  });
  it("nenhum perfil forte indevidamente", () => {
    expect(r.profiles.dominant).toBeNull();
  });
  it("ciclo não é forçado sem evidência", () => {
    expect(r.cycle.kind).toBeNull();
  });
  it("prontidão baixa/média sem dinheiro confirmado e urgência 5", () => {
    expect(r.commercial.criteria.investment_available).toBe(false);
    expect(r.commercial.score).toBeLessThanOrEqual(3);
  });
});

describe("cenário 2 · sobrecarga intensa", () => {
  const r = summarize(overload);
  it("parceria baixa e overload dominante", () => {
    expect(r.dimensions.partnership).toBeLessThan(25);
    expect(r.strain.axes[0]).toBe("partnership");
    expect(r.profiles.dominant).toBe("overload");
    expect(r.profiles.scores.overload).toBeGreaterThanOrEqual(10);
  });
  it("ciclo de sobrecarga com evidência", () => {
    expect(r.cycle.kind).toBe("overload");
    expect(r.cycle.nodes.length).toBeGreaterThanOrEqual(4);
  });
  it("headline sustentada pelos scores", () => {
    expect(r.headline).toMatch(/parceria|prática/i);
  });
});

describe("cenário 3 · cobrança-afastamento", () => {
  const r = summarize(demandWithdraw);
  it("conversa baixa e demand-withdraw dominante", () => {
    expect(r.dimensions.conversation).toBeLessThan(50);
    expect(r.profiles.dominant).toBe("demand_withdraw");
  });
  it("CycleViz coerente", () => {
    expect(r.cycle.kind).toBe("demand_withdraw");
    expect(r.cycle.nodes.map((n) => n.label)).toContain("ele se fecha");
    expect(r.cycle.nodes.map((n) => n.label)).toContain("você aumenta a pressão");
  });
  it("sem mochila emocional sem sobreposição com a infância", () => {
    expect(childhoodOverlap(demandWithdraw)).toBeNull();
    expect(r.profiles.scores.emotional_baggage).toBeLessThan(4);
  });
});

describe("cenário 4 · baixa conexão", () => {
  const r = summarize(lowConnection);
  it("conexão baixa sem parceria baixa", () => {
    expect(r.dimensions.connection).toBeLessThan(25);
    expect(r.dimensions.partnership).toBeGreaterThanOrEqual(75);
    expect(r.headline).toBe("Vocês ainda funcionam juntos, mas estão se acessando menos.");
  });
});

describe("cenário 5 · história", () => {
  it("mochila emocional só com sobreposição real", () => {
    const m = summarize(baggageMatch);
    expect(childhoodOverlap(baggageMatch)?.kind).toBe("talk_close");
    expect(m.profiles.scores.emotional_baggage).toBeGreaterThanOrEqual(5);
    const n = summarize(baggageNoMatch);
    expect(childhoodOverlap(baggageNoMatch)).toBeNull();
    expect(n.profiles.scores.emotional_baggage).toBe(0);
  });
});

describe("cenário 6 · já entendeu, mas repete", () => {
  const r = summarize(knowsRepeats);
  it("knows-but-repeats dominante", () => {
    expect(r.profiles.dominant).toBe("knows_but_repeats");
    expect(r.profiles.scores.knows_but_repeats).toBeGreaterThanOrEqual(5);
    expect(r.attemptsCount).toBe(6);
  });
});

describe("cenário 7 · segurança", () => {
  const r = summarize(safety);
  it("remove fluxo comercial", () => {
    expect(r.safety.safety_flag).toBe(true);
    expect(r.safety.safety_preflag).toBe(true);
  });
  it("histórico marca flag própria", () => {
    expect(summarize({ ...demandWithdraw, Q31: "past" }).safety.safety_history_flag).toBe(true);
  });
});

describe("prontidão comercial separada do sofrimento", () => {
  it("dinheiro não altera scores relacionais", () => {
    const a = summarize(overload);
    const b = summarize({ ...overload, Q30: "no_intent" });
    expect(a.dimensions).toEqual(b.dimensions);
    expect(a.commercial.score - b.commercial.score).toBe(1);
  });
  it("critério parcial de investimento não conta", () => {
    expect(summarize({ ...overload, Q30: "organize" }).commercial.criteria.investment_available).toBe(false);
  });
});

describe("personalização", () => {
  it("dois usuários diferentes mudam headline, tensão, ciclo, perfil e hipótese", () => {
    const a = summarize(overload), b = summarize(demandWithdraw);
    expect(a.headline).not.toBe(b.headline);
    expect(a.strain.axes[0]).not.toBe(b.strain.axes[0]);
    expect(a.cycle.kind).not.toBe(b.cycle.kind);
    expect(a.profiles.dominant).not.toBe(b.profiles.dominant);
    expect(a.hypothesis.join(" ")).not.toBe(b.hypothesis.join(" "));
  });
  it("hipótese tem tamanho editorial", () => {
    const words = summarize(demandWithdraw).hypothesis.join(" ").split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(100);
    expect(words).toBeLessThanOrEqual(260);
  });
});
