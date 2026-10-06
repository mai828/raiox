/** Normaliza e valida WhatsApp brasileiro (DDD + 8/9 dígitos) ou internacional com +. */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const intl = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  if (intl) return digits;
  if (digits.length === 10 || digits.length === 11) return "55" + digits;
  if (digits.length === 12 || digits.length === 13) return digits; // já com 55
  return digits;
}

export function validatePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (trimmed.startsWith("+")) return digits.length >= 10 && digits.length <= 15 ? null : "Confere o número? Parece que faltou algum dígito.";
  if (digits.length === 10 || digits.length === 11) return null;
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith("55")) return null;
  return "Confere o número? Parece que faltou algum dígito.";
}

export function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (raw.trim().startsWith("+")) return raw;
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
