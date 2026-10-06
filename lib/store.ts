"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { QUIZ_VERSION } from "@/config/questions";
import { buildFlow } from "@/config/flow";
import type { AnswerValue, Lead, QuestionId, QuizAnswers, QuizSession, UtmData } from "@/types";
import { emptyUtm, mergeUtm } from "@/lib/utm";

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const emptyLead: Lead = { name: "", whatsapp: "", email: null, consent: false, consentAt: null };

interface QuizState extends QuizSession {
  hydrated: boolean;
  /** Verdadeiro só quando o estado veio do armazenamento com progresso real: aí oferecemos retomada. */
  resumeAvailable: boolean;
  resumeOffered: boolean;
  payloadSent: boolean;
  setHydrated: () => void;
  setUtm: (u: UtmData) => void;
  answer: (qid: QuestionId, value: AnswerValue) => void;
  next: () => void;
  back: () => void;
  goTo: (i: number) => void;
  setLead: (l: Partial<Lead>) => void;
  dismissResume: (resume: boolean) => void;
  markPayloadSent: () => void;
  reset: () => void;
}

const fresh = (): QuizSession => ({
  session_id: newId(), quiz_version: QUIZ_VERSION, created_at: new Date().toISOString(),
  current_screen: 0, answers: {}, lead: { ...emptyLead }, utm: emptyUtm(),
});

export const useQuiz = create<QuizState>()(
  persist(
    (set) => ({
      ...fresh(), hydrated: false, resumeAvailable: false, resumeOffered: false, payloadSent: false,
      setHydrated: () => set((s) => {
        const flow = buildFlow(s.answers);
        const hasProgress = s.current_screen > 0 && Object.keys(s.answers).length > 0;
        const atResult = flow[Math.min(s.current_screen, flow.length - 1)]?.kind === "result";
        return { hydrated: true, resumeAvailable: hasProgress && !atResult };
      }),
      setUtm: (u) => set((s) => ({ utm: mergeUtm(s.utm, u) })),
      answer: (qid, value) => set((s) => {
        const answers: QuizAnswers = { ...s.answers, [qid]: value };
        // Trocar a resposta de Q01 pode mudar o fluxo; manter o índice dentro do novo fluxo.
        const flow = buildFlow(answers);
        return { answers, current_screen: Math.min(s.current_screen, flow.length - 1) };
      }),
      next: () => set((s) => ({ current_screen: Math.min(s.current_screen + 1, buildFlow(s.answers).length - 1) })),
      back: () => set((s) => ({ current_screen: Math.max(s.current_screen - 1, 0) })),
      goTo: (i) => set((s) => ({ current_screen: Math.max(0, Math.min(i, buildFlow(s.answers).length - 1)) })),
      setLead: (l) => set((s) => ({ lead: { ...s.lead, ...l } })),
      dismissResume: (resume) => set((s) => ({ resumeOffered: true, current_screen: resume ? s.current_screen : 0, ...(resume ? {} : { answers: {}, lead: { ...emptyLead }, session_id: newId(), created_at: new Date().toISOString(), payloadSent: false }) })),
      markPayloadSent: () => set({ payloadSent: true }),
      reset: () => set({ ...fresh(), resumeOffered: true, payloadSent: false }),
    }),
    {
      name: "raiox-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ session_id: s.session_id, quiz_version: s.quiz_version, created_at: s.created_at, current_screen: s.current_screen, answers: s.answers, lead: s.lead, utm: s.utm, payloadSent: s.payloadSent }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
