"use client";
import QuestionHeader from "./QuestionHeader";
import SingleSelectQuestion from "./SingleSelectQuestion";
import MultiSelectQuestion from "./MultiSelectQuestion";
import ScaleQuestion from "./ScaleQuestion";
import type { AnswerValue, QuestionConfig, QuizAnswers } from "@/types";

/** Adapta o helper à presença de filhos (Q03). */
function adaptHelper(q: QuestionConfig, answers: QuizAnswers): string | undefined {
  if (!q.helper) return undefined;
  const hasKids = answers.Q03 === "yes_home" || answers.Q03 === "previous";
  return q.helper.replace("{filhos}", hasKids ? "filhos, " : "");
}

export default function QuestionScreen({ question, answers, onAnswer, onConfirm }: { question: QuestionConfig; answers: QuizAnswers; onAnswer: (v: AnswerValue) => void; onConfirm: () => void }) {
  const value = answers[question.id];
  return (
    <div>
      <QuestionHeader text={question.text} helper={adaptHelper(question, answers)} preface={question.preface} />
      {question.type === "single" ? <SingleSelectQuestion question={question} value={typeof value === "string" ? value : undefined} onChange={onAnswer} onConfirm={onConfirm} /> : null}
      {question.type === "multi" ? <MultiSelectQuestion question={question} value={Array.isArray(value) ? value : []} onChange={onAnswer} onConfirm={onConfirm} /> : null}
      {question.type === "scale" ? <ScaleQuestion question={question} value={typeof value === "number" ? value : undefined} onChange={onAnswer} onConfirm={onConfirm} /> : null}
    </div>
  );
}
