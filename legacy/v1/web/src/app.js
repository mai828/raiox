/* RAIO-X DO SEU RELACIONAMENTO · aplicação. Motor de scoring portado de scripts/score.py. */
const CONFIG = {
  // Número do WhatsApp da equipe, formato internacional sem símbolos (55 + DDD + número). Ajustar antes de publicar.
  whatsappNumber: "5500000000000",
  storageKey: "raiox-v1"
};
const META = QUIZ.meta;
const QS = QUIZ.questions;
const QBY = Object.fromEntries(QS.map(q => [q.id, q]));
const PILLARS = ["P1", "P2", "P3", "P4", "P5"];
const PROFILES = ["A", "B", "C", "D"];
const PHASE_NAME = { 1: "Reconhecimento", 2: "Repetição", 3: "Custo", 4: "O que pode estar por trás", 5: "Possibilidade", 6: "Prontidão" };

/* ------------------------------------------------------------------ motor */
function opt(q, id) { const o = q.options.find(o => o.id === id); if (!o) throw new Error(q.id + ": alternativa " + id); return o; }
function pillarMax() { const m = {}; for (const q of QS) if (q.pillar) m[q.pillar] = (m[q.pillar] || 0) + q.weight * 3; return m; }
function tiebreak(cands, rules, trace) {
  for (const [name, key] of rules) {
    const best = Math.min(...cands.map(key));
    const nxt = cands.filter(c => key(c) === best);
    trace.push(`${name}: [${cands}] -> [${nxt}]`);
    cands = nxt; if (cands.length === 1) break;
  }
  return cands;
}
function score(answers) {
  const pts = {}, zeros = {}, zeroW = {}, crit = {};
  const prof = { A: 0, B: 0, C: 0, D: 0 }, heavy = { A: 0, B: 0, C: 0, D: 0 }, strong = { A: 0, B: 0, C: 0, D: 0 };
  const flags = [], criteria = {}, fields = {};
  for (const p of PILLARS) { pts[p] = 0; zeros[p] = 0; zeroW[p] = 0; crit[p] = 0; }
  const addProfiles = (q, o) => { const w = q.weight || 1; for (const [p, v] of Object.entries(o.profiles || {})) { prof[p] += v; if (w > 1) heavy[p] += v; if (v >= 2) strong[p] += 1; } };
  for (const [qid, ans] of Object.entries(answers)) {
    const q = QBY[qid]; if (!q || ans === undefined || ans === null) continue;
    if (q.type === "scale_0_10") { fields[q.field] = ans; if (q.commercial_criterion) criteria[q.commercial_criterion] = ans >= 7; continue; }
    if (q.type === "multi") {
      const chosen = ans.slice(), opts = chosen.map(a => opt(q, a));
      const excl = new Set(q.multi_rules.count_excludes);
      const count = opts.filter(o => !excl.has(o.id)).length;
      fields[q.field] = chosen; fields.previous_solutions_count = count;
      if (q.commercial_criterion) criteria[q.commercial_criterion] = count >= 2;
      const tmp = {};
      for (const o of opts) for (const [p, v] of Object.entries(o.profiles || {})) tmp[p] = (tmp[p] || 0) + v;
      const k = opts.filter(o => o.knowledge_item).length;
      if (k >= 2) tmp.D = 2; else if (k === 1) tmp.D = 1;
      for (const [p, v] of Object.entries(tmp)) prof[p] += Math.min(v, q.multi_rules.profile_cap);
      continue;
    }
    const o = opt(q, ans);
    fields[q.field] = o.value !== undefined ? o.value : o.id;
    for (const [k, v] of Object.entries(o.derive || {})) fields[k] = v;
    if (q.pillar) { pts[q.pillar] += o.score * q.weight; if (o.score === 0) { zeros[q.pillar] += 1; zeroW[q.pillar] += q.weight; } }
    if (q.commercial_criterion && "criterion_met" in o) criteria[q.commercial_criterion] = !!o.criterion_met;
    addProfiles(q, o);
    for (const f of (o.flags || [])) { flags.push(f); if (q.pillar && !META.risk_flags[f].safety) crit[q.pillar] += 1; }
  }
  const mx = pillarMax();
  const ps = {}; for (const p of PILLARS) ps[p] = Math.round(100 * pts[p] / mx[p]);
  const irc = Math.round(PILLARS.reduce((s, p) => s + ps[p], 0) / 5);
  const band = META.irc_bands.find(b => irc >= b.min && irc <= b.max);
  const impact = META.pillar_impact_order;
  const lowest = Math.min(...PILLARS.map(p => ps[p]));
  let tied = PILLARS.filter(p => ps[p] - lowest <= 5);
  const attTrace = [`candidatos: [${tied}]`];
  if (tied.length > 1) tied = tiebreak(tied, [
    ["1. sinais críticos", p => -crit[p]], ["2. respostas com score 0", p => -zeros[p]],
    ["3. peso das perguntas com score 0", p => -zeroW[p]], ["4. impacto na dinâmica", p => impact.indexOf(p)]], attTrace);
  const attention = tied[0];
  const top = Math.max(...PROFILES.map(p => prof[p]));
  let cands = PROFILES.filter(p => prof[p] === top);
  const profTrace = [];
  if (cands.length > 1) { const fb = META.attention_to_profile_fallback[attention]; cands = tiebreak(cands, [
    ["1. pontos em perguntas peso 1.25", p => -heavy[p]], ["2. sinais fortes", p => -strong[p]], ["3. explica o ponto de atenção", p => p === fb ? 0 : 1]], profTrace); }
  const profile = cands[0];
  let readiness = 0; for (let c = 1; c <= 7; c++) if (criteria[c]) readiness++;
  const cband = META.commercial_bands.find(b => readiness >= b.min && readiness <= b.max);
  const lowAdh = flags.filter(f => META.risk_flags[f].low_adherence);
  const safety = flags.filter(f => META.risk_flags[f].safety);
  const route = safety.length ? "safety" : lowAdh.length ? "nurture_low_adherence" : readiness >= 4 ? "sales_triage" : "nurture";
  const tags = [META.profiles[profile].tag, META.pillars[attention].tag, cband.tag];
  if (lowAdh.length) tags.push("LOW_ADHERENCE"); if (safety.length) tags.push("SAFETY_FLAG");
  if (flags.includes("decision_shared")) tags.push("DECISION_SHARED");
  if (flags.includes("repetition_intense")) tags.push("REPETITION_INTENSE");
  if (["35-44", "45-52"].includes(fields.age_range) && fields.relationship_status === "married_or_cohabiting") tags.push("PERSONA_CORE");
  const mostAware = PILLARS.slice().sort((a, b) => (ps[b] - ps[a]) || (impact.indexOf(b) - impact.indexOf(a)))[0];
  const middle = PILLARS.filter(p => p !== attention && p !== mostAware);
  const mostPossible = middle.slice().sort((a, b) => (crit[a] - crit[b]) || (ps[b] - ps[a]) || (impact.indexOf(a) - impact.indexOf(b)))[0];
  const pf = {}; for (const p of PILLARS) pf[META.pillars[p].field] = ps[p];
  return {
    fields, pillar_scores: pf, pillar_scores_by_code: ps,
    relationship_reorganization_index: irc, irc_band: band.key, irc_band_name: band.name,
    dominant_profile: META.profiles[profile].key, dominant_profile_code: profile, dominant_profile_name: META.profiles[profile].name,
    profile_affinity: Object.fromEntries(PROFILES.map(p => [META.profiles[p].key, prof[p]])), profile_trace: profTrace,
    main_attention_point: META.pillars[attention].key, main_attention_code: attention, main_attention_point_name: META.pillars[attention].name, attention_trace: attTrace,
    pillar_reading: { most_repeating: META.pillars[attention].key, most_aware: META.pillars[mostAware].key, most_possible: META.pillars[mostPossible].key },
    pillar_reading_codes: { rep: attention, aw: mostAware, pos: mostPossible },
    commercial_criteria: Object.fromEntries([1,2,3,4,5,6,7].map(c => [c, !!criteria[c]])),
    commercial_readiness: readiness, commercial_classification: cband.key, commercial_classification_name: cband.name,
    lead_route: route, low_adherence: lowAdh.length > 0, low_adherence_flags: lowAdh,
    safety_flag: safety.length > 0, safety_flags: safety, risk_flags: [...new Set(flags)].sort(), tags
  };
}

/* ------------------------------------------------------------------ estado */
const INTERSTITIAL_BEFORE = Object.keys(COPY.interstitials);
const steps = [{ kind: "cover" }];
for (const q of QS) { if (INTERSTITIAL_BEFORE.includes(q.id)) steps.push({ kind: "inter", qid: q.id }); steps.push({ kind: "q", qid: q.id }); }
steps.push({ kind: "capture" }); steps.push({ kind: "result" });

const state = { i: 0, answers: {}, lead: {}, startedAt: null, nurture: false, safetyOk: false };
function save() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(state)); } catch (e) {} }
function load() { try { const s = JSON.parse(localStorage.getItem(CONFIG.storageKey)); if (s && typeof s.i === "number") Object.assign(state, s); } catch (e) {} }
function reset() { try { localStorage.removeItem(CONFIG.storageKey); } catch (e) {} Object.assign(state, { i: 0, answers: {}, lead: {}, startedAt: null, nurture: false, safetyOk: false }); render(); }
function track(ev, params) { /* ponto de integração GTM / GA4 / Meta. */ try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, params || {})); } catch (e) {} }

/* ------------------------------------------------------------------ render */
const $ = sel => document.querySelector(sel);
const el = (tag, attrs, ...kids) => { const n = document.createElement(tag); for (const [k, v] of Object.entries(attrs || {})) { if (k === "class") n.className = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else if (v !== null && v !== undefined) n.setAttribute(k, v); } for (const k of kids.flat()) if (k !== null && k !== undefined) n.append(k.nodeType ? k : document.createTextNode(String(k))); return n; };
const md = s => { const esc = s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); return esc.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>"); };
const pEl = (s, cls) => { const p = el("p", cls ? { class: cls } : {}); p.innerHTML = md(s); return p; };
const fill = (s, name) => s.replace("{nome}", name || "Você");

function questionIndex(qid) { return QS.findIndex(q => q.id === qid); }
function go(i) { state.i = Math.max(0, Math.min(steps.length - 1, i)); save(); render(); window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); }

function render() {
  const step = steps[state.i];
  const root = $("#app"); root.innerHTML = "";
  const bar = $("#progress i"); const phase = $("#phase");
  let pct = 0, ptxt = "";
  if (step.kind === "q" || step.kind === "inter") { const q = QBY[step.qid]; const idx = questionIndex(step.qid); pct = idx / QS.length * 100; ptxt = (q.kind === "context" ? "Contexto" : PHASE_NAME[q.phase]) + " · " + (idx + 1) + "/" + QS.length; }
  else if (step.kind === "capture") { pct = 100; ptxt = "Seu Raio-X"; }
  else if (step.kind === "result") { pct = 100; ptxt = "Resultado"; }
  bar.style.width = pct + "%"; phase.textContent = ptxt;
  root.append(({ cover: renderCover, inter: renderInter, q: renderQuestion, capture: renderCapture, result: renderResult })[step.kind](step));
}

function renderCover() {
  track("quiz_view");
  return el("section", { class: "screen cover" },
    el("p", { class: "eyebrow" }, "Márcio Conceição"),
    el("h1", {}, "Raio-X do Seu Relacionamento"),
    el("p", { class: "sub" }, META.subtitle),
    el("p", { class: "lede" }, "21 perguntas. Entre 7 e 10 minutos. Não existe resposta certa; existe a resposta que mais parece com você. Ao final você recebe uma leitura dos padrões que apareceram nas suas respostas."),
    el("p", { class: "lede" }, "Isso não é um diagnóstico psicológico: é um mapa para você pensar com mais clareza."),
    el("div", { class: "row" },
      el("button", { class: "btn", id: "start", onclick: () => { state.startedAt = Date.now(); track("quiz_start"); go(1); } }, "Começar"),
      Object.keys(state.answers).length ? el("button", { class: "btn ghost", onclick: () => go(firstUnanswered()) }, "Continuar de onde parei") : null)
  );
}
function firstUnanswered() { for (let i = 1; i < steps.length; i++) { const s = steps[i]; if (s.kind === "q" && state.answers[s.qid] === undefined) return i; } return steps.length - 2; }

function renderInter(step) {
  return el("section", { class: "screen" },
    el("p", { class: "quote" }, COPY.interstitials[step.qid]),
    el("div", { class: "row" }, el("button", { class: "btn ghost", onclick: () => go(state.i - 1) }, "Voltar"), el("button", { class: "btn", id: "cont", onclick: () => go(state.i + 1) }, "Continuar"))
  );
}

function renderQuestion(step) {
  const q = QBY[step.qid]; const cur = state.answers[q.id];
  const sec = el("section", { class: "screen" }, el("p", { class: "eyebrow" }, q.kind === "context" ? "Contexto" : "Fase " + q.phase + " · " + PHASE_NAME[q.phase]), el("h2", { class: "qtext" }, q.text));
  const next = () => { track("question_answered", { question_id: q.id, phase: q.phase }); go(state.i + 1); };
  if (q.type === "single") {
    sec.append(el("div", { class: "options", role: "group" }, q.options.map(o => el("button", { class: "opt", "data-opt": o.id, "aria-pressed": cur === o.id ? "true" : "false", onclick: () => { state.answers[q.id] = o.id; save(); setTimeout(next, 180); } }, el("span", { class: "mark" }), el("span", {}, o.text)))));
  } else if (q.type === "multi") {
    const sel = new Set(cur || []);
    const list = el("div", { class: "options", role: "group" });
    const cont = el("button", { class: "btn", id: "cont", disabled: sel.size ? null : "", onclick: () => { state.answers[q.id] = [...sel]; save(); next(); } }, "Continuar");
    const draw = () => { list.innerHTML = ""; for (const o of q.options) list.append(el("button", { class: "opt multi", "data-opt": o.id, "aria-pressed": sel.has(o.id) ? "true" : "false", onclick: () => { if (o.exclusive) { const had = sel.has(o.id); sel.clear(); if (!had) sel.add(o.id); } else { sel.delete(q.options.find(x => x.exclusive).id); sel.has(o.id) ? sel.delete(o.id) : sel.add(o.id); } cont.disabled = !sel.size; draw(); } }, el("span", { class: "mark" }), el("span", {}, o.text))); };
    draw(); sec.append(list); sec.append(el("div", { class: "row" }, el("button", { class: "btn ghost", onclick: () => go(state.i - 1) }, "Voltar"), cont)); return sec;
  } else if (q.type === "scale_0_10") {
    let val = cur;
    const cont = el("button", { class: "btn", id: "cont", disabled: val === undefined ? "" : null, onclick: () => { state.answers[q.id] = val; save(); next(); } }, "Continuar");
    const grid = el("div", { class: "scale", role: "group" });
    const draw = () => { grid.innerHTML = ""; for (let n = 0; n <= 10; n++) grid.append(el("button", { class: "opt", "data-opt": n, "aria-pressed": val === n ? "true" : "false", onclick: () => { val = n; cont.disabled = false; draw(); } }, el("span", { class: "mark" }), String(n))); };
    draw(); sec.append(grid, el("div", { class: "scale-labels" }, el("span", {}, q.scale.min_label), el("span", {}, q.scale.max_label)), el("div", { class: "row" }, el("button", { class: "btn ghost", onclick: () => go(state.i - 1) }, "Voltar"), cont)); return sec;
  }
  sec.append(el("div", { class: "row" }, el("button", { class: "btn ghost", onclick: () => go(state.i - 1) }, "Voltar"), el("span", { class: "note" }, "Toque na alternativa para avançar")));
  return sec;
}

function renderCapture() {
  track("quiz_complete", { completion_seconds: state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : null });
  const L = state.lead; const err = el("p", { class: "err", id: "err" });
  const name = el("input", { type: "text", id: "lead_name", autocomplete: "given-name", placeholder: "Como você gosta de ser chamada", value: L.name || "" });
  const wa = el("input", { type: "tel", id: "lead_whatsapp", autocomplete: "tel", inputmode: "tel", placeholder: "(11) 99999-9999", value: L.whatsapp || "" });
  const em = el("input", { type: "email", id: "lead_email", autocomplete: "email", placeholder: "Se quiser receber a leitura por escrito", value: L.email || "" });
  const consent = el("input", { type: "checkbox", id: "consent" }); consent.checked = !!L.consent;
  const form = el("form", { class: "screen", onsubmit: e => {
    e.preventDefault(); err.textContent = "";
    const digits = wa.value.replace(/\D/g, "");
    if (!name.value.trim()) return err.textContent = "Escreva seu nome para a leitura falar com você.";
    if (digits.length < 10 || digits.length > 13) return err.textContent = "Confira o WhatsApp: precisa ter DDD e número.";
    if (em.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em.value)) return err.textContent = "O e-mail não parece completo.";
    if (!consent.checked) return err.textContent = "Para enviar o resultado, precisamos da sua autorização de contato.";
    state.lead = { name: name.value.trim(), whatsapp: digits.length <= 11 ? "55" + digits : digits, email: em.value.trim(), consent: true, consent_timestamp: new Date().toISOString() };
    save(); track("lead_capture_complete", { has_email: !!em.value }); go(state.i + 1);
  } },
    el("p", { class: "eyebrow" }, "Pronto"),
    el("h2", {}, "Seu Raio-X está pronto."),
    el("p", { class: "lede" }, "Preencha seus dados para acessar a sua leitura completa: seu índice, seu perfil, o ponto que mais parece estar sustentando essa repetição e um primeiro passo prático."),
    el("div", { class: "field" }, el("label", { for: "lead_name" }, "Nome"), name),
    el("div", { class: "field" }, el("label", { for: "lead_whatsapp" }, "WhatsApp com DDD"), wa),
    el("div", { class: "field" }, el("label", { for: "lead_email" }, "E-mail (opcional)"), em),
    el("label", { class: "check" }, consent, el("span", {}, "Autorizo o contato da equipe de Márcio Conceição pelo WhatsApp e e-mail e o tratamento dos meus dados para envio do resultado e de conteúdos relacionados, conforme a Política de Privacidade.")),
    el("p", { class: "note" }, "Seus dados não são vendidos nem compartilhados. Você pode pedir exclusão a qualquer momento."),
    err,
    el("button", { class: "btn block", type: "submit", id: "see" }, "Ver meu Raio-X"),
    el("p", { class: "note" }, "Este resultado é uma ferramenta de reflexão, não um diagnóstico psicológico, médico ou clínico."),
    el("button", { class: "linkish", type: "button", onclick: () => go(state.i - 1) }, "Voltar para a última pergunta")
  );
  return form;
}

function renderResult() {
  const r = score(state.answers); const name = state.lead.name || "Você";
  track("result_view", { dominant_profile: r.dominant_profile, main_attention_point: r.main_attention_point, irc_band: r.irc_band, commercial_classification: r.commercial_classification, lead_route: r.lead_route, safety_flag: r.safety_flag, low_adherence: r.low_adherence });
  const sec = el("section", { class: "screen" });
  if (r.safety_flag) {
    const c = el("div", { class: "card danger" }, el("h2", {}, fill(COPY.safety.lead, name)), pEl(COPY.safety.intro));
    if (r.safety_flags.includes("safety_violence")) c.append(pEl(COPY.safety.violence), el("div", { class: "contacts" }, COPY.safety.violenceContacts.map(([n, d]) => el("div", {}, el("b", {}, n), " · " + d))));
    if (r.safety_flags.includes("safety_acute_distress")) c.append(pEl(COPY.safety.distress), el("div", { class: "contacts" }, COPY.safety.distressContacts.map(([n, d]) => el("div", {}, el("b", {}, n), " · " + d))));
    c.append(pEl(COPY.safety.outro)); sec.append(c);
  }
  sec.append(el("div", {}, el("p", { class: "eyebrow" }, "Seu Raio-X do Relacionamento"), el("h1", { style: "font-size:34px" }, name + ", aqui está a leitura das suas respostas."), el("p", { class: "lede", style: "margin-top:10px" }, "Antes de começar: isso não é um diagnóstico. É um mapa feito a partir do que você respondeu, para dar nome a coisas que você vive e, talvez, mostrar uma parte que ainda não estava conectada.")));
  // Índice
  sec.append(el("div", { class: "card" }, el("p", { class: "eyebrow" }, "Índice de Reorganização Relacional"), el("div", { class: "big" }, String(r.relationship_reorganization_index), el("small", {}, " de 100")), el("p", { class: "bandname" }, r.irc_band_name), pEl(COPY.bandIntro, "note"), pEl(COPY.bands[r.irc_band])));
  // Perfil
  const prof = COPY.profiles[r.dominant_profile_code];
  const pc = el("div", { class: "card accent" }, el("p", { class: "eyebrow" }, "Seu perfil"), el("h2", {}, r.dominant_profile_name), pEl(fill(prof.lead, name)));
  prof.body.forEach((p, i) => { if (r.dominant_profile_code === "D" && i === 3 && r.relationship_reorganization_index >= 75) pc.append(pEl(prof.highIrcParagraph)); else pc.append(pEl(p)); });
  sec.append(pc);
  // Atenção
  sec.append(el("div", { class: "card" }, el("p", { class: "eyebrow" }, "Principal Ponto de Atenção"), el("h2", {}, "O ponto que mais parece estar sustentando essa repetição hoje: " + r.main_attention_point_name + "."), pEl(COPY.attentionIntro, "note"), pEl(COPY.attention[r.main_attention_point])));
  // Pilares
  const pil = el("div", { class: "pillars" });
  for (const p of PILLARS) { const v = r.pillar_scores_by_code[p]; const band = v <= 33 ? 0 : v <= 66 ? 1 : 2; pil.append(el("div", { class: "pillar" }, el("div", { class: "head" }, el("b", {}, COPY.pillarShort[p]), el("span", {}, v + "/100")), el("div", { class: "bar" }, el("i", { style: "width:" + v + "%" })), el("p", { class: "read" }, COPY.pillarRead[p][band]))); }
  const codes = r.pillar_reading_codes;
  sec.append(el("div", { class: "card" }, el("p", { class: "eyebrow" }, "Seus cinco pilares"), el("p", { class: "note" }, "Quanto maior, maior a sua capacidade atual de perceber e reorganizar neste ponto."), pil,
    el("div", { class: "hl" },
      el("div", { class: "rep" }, el("b", {}, "Onde mais repete: " + COPY.pillarShort[codes.rep]), el("span", {}, COPY.highlights.rep)),
      el("div", { class: "aw" }, el("b", {}, "Onde você tem mais consciência: " + COPY.pillarShort[codes.aw]), el("span", {}, COPY.highlights.aw)),
      el("div", { class: "pos" }, el("b", {}, "Onde existe mais possibilidade de reorganização agora: " + COPY.pillarShort[codes.pos]), el("span", {}, COPY.highlights.pos)))));
  // Aparece x sustenta
  sec.append(el("div", { class: "card" }, el("p", { class: "eyebrow" }, "O que aparece e o que sustenta"), COPY.appears.map(p => pEl(p))));
  // Reflexão e ação
  sec.append(el("div", { class: "card" }, el("p", { class: "eyebrow" }, "Uma reflexão e um primeiro passo"), el("h3", {}, "Para pensar esta semana"), el("p", { class: "quote" }, COPY.reflection[r.main_attention_point]), el("h3", {}, "Para fazer esta semana"), pEl(COPY.action[r.dominant_profile_code])));
  // Compatíveis + CTA
  if (r.safety_flag) {
    const done = el("p", { class: "note" }, state.safetyOk ? COPY.safety.altDone : "");
    sec.append(el("div", { class: "card" }, pEl(COPY.safety.alt), state.safetyOk ? null : el("button", { class: "btn ghost", onclick: e => { state.safetyOk = true; save(); e.target.remove(); done.textContent = COPY.safety.altDone; } }, COPY.safety.altButton), done));
  } else {
    const texts = r.lead_route === "nurture_low_adherence" ? COPY.compativeis.lowAdherence : COPY.compativeis.standard;
    const card = el("div", { class: "card accent" }, el("p", { class: "eyebrow" }, "E agora?"), texts.map(p => pEl(p)));
    const link = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(COPY.cta.message(r.dominant_profile_name, r.main_attention_point_name));
    card.append(el("a", { class: "btn block", id: "cta", href: link, target: "_blank", rel: "noopener", onclick: () => track("cta_click", { cta_variant: "main", lead_route: r.lead_route }) }, COPY.cta.main), el("p", { class: "note" }, COPY.cta.sub));
    if (r.lead_route === "nurture" || r.lead_route === "nurture_low_adherence") {
      const done = el("p", { class: "note" }, state.nurture ? COPY.cta.secondaryDone : "");
      card.append(state.nurture ? null : el("button", { class: "btn ghost block", onclick: e => { state.nurture = true; save(); track("nurture_opt_in", { lead_route: r.lead_route }); e.target.remove(); done.textContent = COPY.cta.secondaryDone; } }, COPY.cta.secondary), done);
    }
    sec.append(card);
  }
  // Dados (para a equipe)
  const payload = Object.assign({ lead_name: state.lead.name, lead_whatsapp: state.lead.whatsapp, lead_email: state.lead.email, consent_contact: state.lead.consent, consent_timestamp: state.lead.consent_timestamp, nurture_opt_in: state.nurture, safety_contact_ok: state.safetyOk, quiz_version: META.version }, r.fields, r.pillar_scores, {
    relationship_reorganization_index: r.relationship_reorganization_index, irc_band: r.irc_band, dominant_profile: r.dominant_profile, main_attention_point: r.main_attention_point,
    pillar_most_aware: r.pillar_reading.most_aware, pillar_most_possible: r.pillar_reading.most_possible, commercial_readiness: r.commercial_readiness, commercial_classification: r.commercial_classification,
    low_adherence: r.low_adherence, low_adherence_flags: r.low_adherence_flags, safety_flag: r.safety_flag, safety_flags: r.safety_flags, risk_flags: r.risk_flags, lead_route: r.lead_route, tags: r.tags, raw_answers: state.answers });
  sec.append(el("details", {}, el("summary", {}, "Dados gerados para o CRM (visível só nesta versão de teste)"), el("pre", {}, JSON.stringify(payload, null, 2))));
  sec.append(el("p", { class: "foot" }, COPY.disclaimer), el("button", { class: "linkish", onclick: reset }, "Refazer o Raio-X"));
  return sec;
}

window.RaioX = { score, QUIZ, steps, state, go, reset };
load(); render();
