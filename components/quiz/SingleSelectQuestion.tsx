"use client";
import { useEffect, useRef, useState } from "react";
import type { QuestionConfig } from "@/types";

export default function SingleSelectQuestion({ question, value, onChange, onConfirm }: { question: QuestionConfig; value: string | undefined; onChange: (id: string) => void; onConfirm: () => void }) {
  const [pending, setPending] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const select = (id: string) => {
    onChange(id);
    if (question.requireConfirm) return;
    setPending(id);
    timer.current = setTimeout(() => { setPending(null); onConfirm(); }, 300);
  };
  const current = pending ?? value;
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={question.text}>
      {question.options!.map((o) => (
        <button key={o.id} type="button" className="option-card" aria-pressed={current === o.id} onClick={() => select(o.id)} disabled={pending !== null && pending !== o.id} data-option={o.id}>
          <span className="option-mark" aria-hidden />
          <span className="text-[16px] leading-snug text-ink">{o.label}</span>
        </button>
      ))}
      {question.requireConfirm ? (
        <div className="mt-4 flex justify-end">
          <button type="button" className="btn-primary" disabled={!value} onClick={onConfirm} data-testid="confirm">Continuar</button>
        </div>
      ) : null}
    </div>
  );
}
