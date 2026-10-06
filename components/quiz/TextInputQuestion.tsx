"use client";
import { useState, type ReactNode } from "react";

export default function TextInputQuestion({ id, label, helper, value, onChange, onConfirm, validate, placeholder, type = "text", autoComplete, cta = "Continuar", secondary, children }: {
  id: string; label: string; helper?: string; value: string; onChange: (v: string) => void; onConfirm: () => void;
  validate?: (v: string) => string | null; placeholder?: string; type?: string; autoComplete?: string; cta?: string; secondary?: ReactNode; children?: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate ? validate(value) : null;
    setError(err);
    if (!err) onConfirm();
  };
  return (
    <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
      <label htmlFor={id} className="flex flex-col gap-3">
        <span className="balance font-sans text-[22px] font-semibold leading-snug text-ink md:text-[26px]">{label}</span>
        {helper ? <span className="text-[15px] text-muted">{helper}</span> : null}
      </label>
      <input id={id} className="input" type={type} value={value} onChange={(e) => { onChange(e.target.value); if (error) setError(null); }} placeholder={placeholder} autoComplete={autoComplete} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error} />
      {error ? <p id={`${id}-error`} className="text-[14px] text-wine-dark" role="alert">{error}</p> : null}
      {children}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <div>{secondary}</div>
        <button type="submit" className="btn-primary" data-testid="confirm">{cta}</button>
      </div>
    </form>
  );
}
