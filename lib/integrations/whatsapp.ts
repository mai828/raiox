export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export function buildWhatsappMessage(name: string, strainLabel: string): string {
  return [
    "Oi! Acabei de fazer o Raio-X do Meu Relacionamento.",
    "", `Meu nome é ${name}.`,
    "", `O ponto que mais apareceu na minha leitura foi: ${strainLabel}.`,
    "", "Quero conversar com um especialista da equipe sobre o meu resultado.",
  ].join("\n");
}

export function buildWhatsappUrl(message: string): string | null {
  if (!WHATSAPP_NUMBER) return null;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
