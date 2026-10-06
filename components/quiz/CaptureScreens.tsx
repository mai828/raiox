"use client";
import { useState } from "react";
import TextInputQuestion from "./TextInputQuestion";
import { formatPhoneDisplay, validatePhone } from "./PhoneInput";

const PRIVACY = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL || "#";

export function NameScreen({ value, onChange, onConfirm }: { value: string; onChange: (v: string) => void; onConfirm: () => void }) {
  return (
    <TextInputQuestion id="lead_name" label="Como eu posso te chamar?" helper="Seu nome aparece na leitura da próxima tela." value={value} onChange={onChange} onConfirm={onConfirm}
      placeholder="Seu primeiro nome" autoComplete="given-name" validate={(v) => (v.trim().length >= 2 ? null : "Escreve seu nome para a leitura falar com você.")} />
  );
}

export function PhoneScreen({ name, value, onChange, onConfirm }: { name: string; value: string; onChange: (v: string) => void; onConfirm: () => void }) {
  return (
    <TextInputQuestion id="lead_whatsapp" type="tel" label={`${name}, qual é o seu WhatsApp?`} helper="Ele fica ligado ao seu Raio-X caso você queira conversar com um especialista da equipe depois."
      value={value} onChange={(v) => onChange(formatPhoneDisplay(v))} onConfirm={onConfirm} placeholder="(11) 99999-9999 ou +351 ..." autoComplete="tel" validate={validatePhone} />
  );
}

export function EmailScreen({ value, consent, onChange, onConsent, onConfirm }: { value: string; consent: boolean; onChange: (v: string) => void; onConsent: (c: boolean) => void; onConfirm: (skipEmail: boolean) => void }) {
  const [consentError, setConsentError] = useState(false);
  const validateEmail = (v: string) => (!v.trim() || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? null : "Esse e-mail parece incompleto.");
  const guard = (skip: boolean) => {
    if (!consent) { setConsentError(true); return; }
    onConfirm(skip);
  };
  return (
    <TextInputQuestion id="lead_email" type="email" label="Quer receber uma cópia da sua leitura por e-mail?" helper="Opcional." value={value} onChange={onChange} onConfirm={() => guard(false)}
      placeholder="seu@email.com" autoComplete="email" validate={validateEmail} cta="Ver minha leitura"
      secondary={<button type="button" className="btn-ghost -ml-5" onClick={() => { onChange(""); guard(true); }} data-testid="skip-email">Prefiro continuar sem e-mail.</button>}>
      <label className="mt-2 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 text-[14px] leading-relaxed text-ink-soft">
        <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-[#7a3a59]" checked={consent} onChange={(e) => { onConsent(e.target.checked); if (e.target.checked) setConsentError(false); }} aria-describedby={consentError ? "consent-error" : undefined} data-testid="consent" />
        <span>Ao continuar, concordo que meus dados e respostas sejam usados para gerar esta leitura e, caso eu solicite contato, para continuidade da conversa com a equipe do Márcio Conceição. <a href={PRIVACY} target="_blank" rel="noopener noreferrer" className="underline decoration-wine-soft underline-offset-2">Política de privacidade</a>.</span>
      </label>
      {consentError ? <p id="consent-error" role="alert" className="text-[14px] text-wine-dark">Para gerar a leitura, precisamos da sua concordância.</p> : null}
    </TextInputQuestion>
  );
}
