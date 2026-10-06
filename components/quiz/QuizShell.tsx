"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useQuiz } from "@/lib/store";
import { buildFlow, progressFor, screenId, screenSegment } from "@/config/flow";
import { QUESTION_BY_ID, SEGMENTS, optionLabel, DIMENSION_LABELS } from "@/config/questions";
import { summarize } from "@/lib/scoring";
import { captureUtm } from "@/lib/utm";
import { trackEvent } from "@/lib/analytics/track";
import { buildCRMPayload } from "@/lib/payload";
import { sendLeadPayload } from "@/lib/integrations/webhook";
import { normalizePhone } from "./PhoneInput";
import SegmentedProgress from "./SegmentedProgress";
import ScreenFrame from "./ScreenFrame";
import QuestionScreen from "./QuestionScreen";
import InsightRouter from "./InsightRouter";
import ProcessingScreen from "./ProcessingScreen";
import SafetyScreen from "./SafetyScreen";
import { NameScreen, PhoneScreen, EmailScreen } from "./CaptureScreens";
import { HeroScreen, HowScreen, PartialPortraitScreen, PreResultScreen, NotInRelationshipScreen, ResumePrompt } from "./StaticScreens";
import ResultDocument from "@/components/result/ResultDocument";
import type { AnswerValue, QuizAnswers, QuizSession } from "@/types";

const YEARS_LABEL: Record<string, string> = { lt2: "menos de 2 anos", "2_5": "2 a 5 anos", "6_10": "6 a 10 anos", "11_20": "11 a 20 anos", gt20: "mais de 20 anos" };

function processingPhrases(answers: QuizAnswers): string[] {
  const p = ["cruzando conexão e presença...", "observando como os conflitos terminam...", "comparando carga e reciprocidade...", "organizando o que mais se repete...", "fechando seu Raio-X..."];
  const repairLow = answers.Q08 === "time_passes" || answers.Q08 === "days_apart" || answers.Q08 === "peace_unresolved";
  const reacts = answers.Q20 === "demand" || answers.Q20 === "approach" || answers.Q20 === "withdraw";
  if (repairLow && reacts) p[1] = "cruzando o que acontece depois das brigas com a forma como você reage quando ele se afasta...";
  if (answers.Q11 === "me_almost_all" || answers.Q11 === "me_more") p[2] = "comparando quanto da vida prática passa por você com o que acontece quando você tenta soltar...";
  const goal = optionLabel("Q26", typeof answers.Q26 === "string" ? answers.Q26 : null);
  if (goal) p[3] = `ligando o que se repete ao que você quer diferente em 90 dias...`;
  return p;
}

export default function QuizShell() {
  const s = useQuiz();
  const [showSummary, setShowSummary] = useState(false);
  const flow = useMemo(() => buildFlow(s.answers), [s.answers]);
  const index = Math.min(s.current_screen, flow.length - 1);
  const screen = flow[index];
  const viewedRef = useRef<string | null>(null);
  const segRef = useRef<string | null>(null);
  const result = useMemo(() => (screen.kind === "result" ? summarize(s.answers) : null), [screen.kind, s.answers]);

  useEffect(() => { s.setUtm(captureUtm()); trackEvent("quiz_view", { quiz_version: s.quiz_version }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!s.hydrated) return;
    const id = screenId(screen);
    if (viewedRef.current === id) return;
    viewedRef.current = id;
    window.scrollTo({ top: 0, behavior: "auto" });
    if (screen.kind === "question") trackEvent("question_viewed", { question_id: screen.qid, screen: id });
    if (screen.kind === "insight") trackEvent("insight_viewed", { insight_id: screen.id, screen: id });
    if (screen.kind === "partial") trackEvent("partial_portrait_viewed", { screen: id });
    if (screen.kind === "capture_name") { trackEvent("quiz_complete", { screen: id }); trackEvent("lead_capture_started", { screen: id }); }
    if (screen.kind === "processing") trackEvent("processing_started", { screen: id });
    if (screen.kind === "not_in_relationship") trackEvent("quiz_abandon", { screen: id });
    if (screen.kind !== "hero" && screen.kind !== "how") {
      const seg = screenSegment(flow, index);
      if (segRef.current !== seg) { segRef.current = seg; trackEvent("segment_started", { segment: seg }); }
    }
  }, [screen, index, flow, s.hydrated]);

  useEffect(() => {
    if (screen.kind !== "result" || !result) return;
    trackEvent("result_view", { dominant_profile: result.profiles.dominant ?? "none", main_strain_axis: result.strain.axes.join("+"), index_band: result.indexBand.range, commercial_classification: result.commercial.classification, safety: result.safety.safety_flag });
    if (result.safety.safety_flag) trackEvent("safety_flag_triggered", { screen: "result" });
  }, [screen.kind, result]);

  const session: QuizSession = { session_id: s.session_id, quiz_version: s.quiz_version, created_at: s.created_at, current_screen: s.current_screen, answers: s.answers, lead: s.lead, utm: s.utm };

  const onAnswer = useCallback((v: AnswerValue) => { if (screen.kind === "question") { s.answer(screen.qid, v); trackEvent("question_answered", { question_id: screen.qid }); } }, [screen, s]);

  const finishCapture = async (skipEmail: boolean) => {
    const consentAt = new Date().toISOString();
    const lead = { ...s.lead, email: skipEmail || !s.lead.email ? null : s.lead.email.trim(), whatsapp: normalizePhone(s.lead.whatsapp), consent: true, consentAt };
    s.setLead(lead);
    trackEvent("lead_capture_complete", { has_email: !!lead.email });
    if (!s.payloadSent) {
      const r = summarize(s.answers);
      void sendLeadPayload(buildCRMPayload({ ...session, lead }, r, "lead_capture_complete")).then((res) => { if (res.ok) s.markPayloadSent(); });
    }
    s.next();
  };

  const onCta = () => {
    if (!result) return;
    trackEvent("cta_click", { cta: "whatsapp", main_strain_axis: result.strain.axes.join("+") });
    trackEvent("whatsapp_start", { cta: "whatsapp" });
    void sendLeadPayload(buildCRMPayload(session, result, "cta_click"));
  };

  const progress = progressFor(flow, index);
  const showResume = s.hydrated && !s.resumeOffered && s.current_screen > 0 && Object.keys(s.answers).length > 0;

  if (!s.hydrated) return <main className="min-h-screen bg-bg" aria-busy="true" />;

  return (
    <main className="min-h-screen bg-bg">
      {progress ? (
        <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur" style={{ top: "env(safe-area-inset-top, 0px)" }}>
          <div className="mx-auto w-full max-w-result px-5 py-4 md:px-8">
            <SegmentedProgress segment={progress.segment} fraction={progress.fraction} />
            <p className="sr-only">{SEGMENTS[progress.segment]?.label}</p>
          </div>
        </div>
      ) : null}
      {showResume ? <ResumePrompt onResume={() => { s.dismissResume(true); trackEvent("quiz_start", { resumed: true }); }} onRestart={() => s.dismissResume(false)} /> : null}
      <AnimatePresence mode="wait">
        {screen.kind === "hero" && <ScreenFrame key="hero" screenKey="hero" width="insight"><HeroScreen onStart={() => { trackEvent("quiz_start", { resumed: false }); s.next(); }} /></ScreenFrame>}
        {screen.kind === "how" && <ScreenFrame key="how" screenKey="how" width="insight" onBack={s.back}><HowScreen onStart={s.next} /></ScreenFrame>}
        {screen.kind === "not_in_relationship" && <ScreenFrame key="nir" screenKey="nir" width="insight" onBack={s.back}><NotInRelationshipScreen onRestart={s.reset} /></ScreenFrame>}
        {screen.kind === "question" && (
          <ScreenFrame key={screen.qid} screenKey={screen.qid} onBack={s.back}>
            <QuestionScreen question={QUESTION_BY_ID[screen.qid]} answers={s.answers} onAnswer={onAnswer} onConfirm={s.next} />
          </ScreenFrame>
        )}
        {screen.kind === "insight" && <ScreenFrame key={`i${screen.id}`} screenKey={`i${screen.id}`} width="insight" onBack={s.back}><InsightRouter id={screen.id} answers={s.answers} onContinue={s.next} /></ScreenFrame>}
        {screen.kind === "partial" && <ScreenFrame key="partial" screenKey="partial" width="insight" onBack={s.back}><PartialPortraitScreen dims={summarize(s.answers).dimensions} onContinue={s.next} /></ScreenFrame>}
        {screen.kind === "pre_result" && <ScreenFrame key="pre" screenKey="pre" width="insight" onBack={s.back}><PreResultScreen onContinue={s.next} /></ScreenFrame>}
        {screen.kind === "capture_name" && <ScreenFrame key="name" screenKey="name" onBack={s.back}><NameScreen value={s.lead.name} onChange={(name) => s.setLead({ name })} onConfirm={() => { s.setLead({ name: s.lead.name.trim() }); s.next(); }} /></ScreenFrame>}
        {screen.kind === "capture_phone" && <ScreenFrame key="phone" screenKey="phone" onBack={s.back}><PhoneScreen name={s.lead.name} value={s.lead.whatsapp} onChange={(whatsapp) => s.setLead({ whatsapp })} onConfirm={s.next} /></ScreenFrame>}
        {screen.kind === "capture_email" && <ScreenFrame key="email" screenKey="email" onBack={s.back}><EmailScreen value={s.lead.email ?? ""} consent={s.lead.consent} onChange={(email) => s.setLead({ email })} onConsent={(consent) => s.setLead({ consent })} onConfirm={finishCapture} /></ScreenFrame>}
        {screen.kind === "processing" && <ScreenFrame key="proc" screenKey="proc" width="insight"><ProcessingScreen phrases={processingPhrases(s.answers)} onDone={s.next} /></ScreenFrame>}
        {screen.kind === "result" && result && (
          <ScreenFrame key="result" screenKey="result" width="result">
            {result.safety.safety_flag && !showSummary ? (
              <SafetyScreen showSummaryButton onViewSummary={() => setShowSummary(true)} />
            ) : (
              <ResultDocument result={result} name={s.lead.name || "Você"} relationshipYears={typeof s.answers.Q02 === "string" ? YEARS_LABEL[s.answers.Q02] ?? null : null} hideCTA={result.safety.safety_flag} onCtaClick={onCta} />
            )}
            <div className="mt-12 flex justify-center"><button type="button" className="btn-ghost" onClick={() => { setShowSummary(false); s.reset(); }}>Refazer o Raio-X</button></div>
          </ScreenFrame>
        )}
      </AnimatePresence>
      <span className="sr-only">{result ? result.strain.axes.map((a) => DIMENSION_LABELS[a]).join(", ") : ""}</span>
    </main>
  );
}
