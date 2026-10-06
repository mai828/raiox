import type { DimensionScores, StrainResult } from "@/types";

const low = (v: number | null) => v !== null && v < 50;
const okay = (v: number | null) => v !== null && v >= 50;
const high = (v: number | null) => v !== null && v >= 65;

/**
 * Headline do resultado, sempre sustentada pelos scores.
 * As regras combinadas (seção 90) são avaliadas a partir do eixo de maior tensão,
 * para que a frase principal nunca contradiga o "ponto que mais pesa".
 */
export function buildResultHeadline(dims: DimensionScores, strain: StrainResult): string {
  const main = strain.axes[0];
  if (strain.tied && strain.axes.length === 2) return "Dois pontos da relação pedem atenção quase na mesma medida.";
  switch (main) {
    case "connection":
      if (low(dims.connection) && okay(dims.partnership)) return "Vocês ainda funcionam juntos, mas estão se acessando menos.";
      if (okay(dims.partnership)) return "Vocês ainda funcionam como equipe em algumas áreas, mas a conexão emocional perdeu espaço.";
      return "A relação segue na rotina, mas o acesso de um à vida do outro perdeu espaço.";
    case "partnership":
      if (low(dims.partnership) && okay(dims.connection)) return "Existe vínculo, mas a parceria perdeu força.";
      return "A vida prática está pesando mais de um lado do que o vínculo entre vocês sugere.";
    case "conversation":
      if (low(dims.conversation) && okay(dims.affection)) return "O afeto ainda existe, mas as conversas estão acumulando coisas que não terminam.";
      if (high(dims.respect_future)) return "A relação ainda tem recursos, mas os conflitos estão acumulando coisas sem reparação.";
      return "Seu casamento parece menos sem amor e mais preso em uma dinâmica que se repete.";
    case "affection":
      if (low(dims.respect_future) && low(dims.affection)) return "O desgaste já começou a alcançar a forma como você imagina o futuro dessa relação.";
      return "Vocês continuam juntos na rotina, mas a proximidade perdeu espaço.";
    case "respect_future":
      if (low(dims.affection)) return "O desgaste já começou a alcançar a forma como você imagina o futuro dessa relação.";
      return "O que mais pede atenção hoje é a forma como você enxerga a relação e o futuro entre vocês.";
  }
  const vals = Object.values(dims).filter((v): v is number => v !== null);
  const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  if (avg >= 70) return "A relação mostra uma base preservada, com um ponto específico que merece atenção.";
  return "Seu casamento parece menos sem amor e mais preso em uma dinâmica que se repete.";
}
