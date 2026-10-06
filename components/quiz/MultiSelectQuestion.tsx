"use client";
import type { QuestionConfig } from "@/types";

export default function MultiSelectQuestion({ question, value, onChange, onConfirm }: { question: QuestionConfig; value: string[]; onChange: (ids: string[]) => void; onConfirm: () => void }) {
  const exclusive = question.options!.filter((o) => o.exclusive).map((o) => o.id);
  const toggle = (id: string) => {
    const isEx = exclusive.includes(id);
    if (isEx) return onChange(value.includes(id) ? [] : [id]);
    const next = value.filter((v) => !exclusive.includes(v));
    onChange(next.includes(id) ? next.filter((v) => v !== id) : [...next, id]);
  };
  return (
    <div className="flex flex-col gap-3" role="group" aria-label={question.text}>
      {question.options!.map((o) => (
        <button key={o.id} type="button" role="checkbox" className="option-card" aria-checked={value.includes(o.id)} onClick={() => toggle(o.id)} data-option={o.id}>
          <span className="option-mark !rounded-[3px]" aria-hidden />
          <span className="text-[16px] leading-snug text-ink">{o.label}</span>
        </button>
      ))}
      <div className="mt-4 flex justify-end">
        <button type="button" className="btn-primary" disabled={!value.length} onClick={onConfirm} data-testid="confirm">Continuar</button>
      </div>
    </div>
  );
}
