import { expect, type Page } from "@playwright/test";
import type { QuizAnswers } from "@/types";

export const DEMAND_WITHDRAW: QuizAnswers = {
  Q01: "A", Q02: "11_20", Q03: "yes_home", Q04: "two_three", Q05: "part", Q06: "me", Q07: "A", Q08: "me_first", Q09: "same_fight", Q10: "irony",
  Q11: "areas", Q12: "sometimes", Q13: "guide", Q14: "wait_notice", Q15: "less", Q16: "desire_gap", Q17: "months", Q18: "less", Q19: "intention",
  Q20: "demand", Q21: "explain_repeat", Q22: "agreement", Q23: "chaos", Q24: ["affection", "humor", "my_will"], Q25: ["talk_differently", "demand_less"],
  Q26: "conversation", Q27: "1_3y", Q28: 8, Q29: "weeks", Q30: "can", Q31: "no",
};

/** Espera a tela `s` sair do DOM (animação de saída). */
export async function leave(page: Page, s: string) {
  await expect(page.locator(`[data-screen="${s}"]`)).toBeHidden({ timeout: 5000 });
}

export async function currentScreen(page: Page): Promise<string> {
  const el = page.locator("[data-screen]").last();
  await el.waitFor();
  return (await el.getAttribute("data-screen")) as string;
}

export async function answerQuestion(page: Page, qid: string, value: string | string[] | number) {
  const frame = page.locator(`[data-screen="${qid}"]`);
  await expect(frame).toBeVisible();
  if (Array.isArray(value)) {
    for (const v of value) await frame.locator(`[data-option="${v}"]`).click();
    await frame.getByTestId("confirm").click();
  } else {
    await frame.locator(`[data-option="${value}"]`).click();
    const confirm = frame.getByTestId("confirm");
    if (await confirm.count()) await confirm.click();
  }
  await expect(frame).toBeHidden({ timeout: 5000 });
}

/** Avança pelo fluxo até a tela `until` (data-screen) ou até o fim das respostas conhecidas. */
export async function driveTo(page: Page, answers: QuizAnswers, until: string) {
  for (let i = 0; i < 80; i++) {
    const s = await currentScreen(page);
    if (s === until) return;
    if (s === "hero") { await page.getByTestId("start").click(); await leave(page, s); continue; }
    if (s === "how" || s.startsWith("i") || s === "partial" || s === "pre") { await page.getByTestId("continue").click(); await leave(page, s); continue; }
    if (/^Q\d\d$/.test(s)) {
      const v = answers[s as keyof QuizAnswers];
      if (v === undefined) throw new Error(`sem resposta para ${s}`);
      await answerQuestion(page, s, v);
      continue;
    }
    throw new Error(`tela inesperada: ${s}`);
  }
  throw new Error(`não chegou em ${until}`);
}

export async function capture(page: Page, name = "Renata", phone = "11999990000", email: string | null = null) {
  await expect(page.locator('[data-screen="name"]')).toBeVisible();
  await page.fill("#lead_name", name); await page.getByTestId("confirm").click(); await leave(page, "name");
  await expect(page.locator('[data-screen="phone"]')).toBeVisible();
  await expect(page.locator("text=" + name + ", qual é o seu WhatsApp?")).toBeVisible();
  await page.fill("#lead_whatsapp", phone); await page.getByTestId("confirm").click(); await leave(page, "phone");
  await expect(page.locator('[data-screen="email"]')).toBeVisible();
  // consentimento não vem marcado e é obrigatório
  await page.getByTestId("confirm").click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByTestId("consent").check();
  if (email) { await page.fill("#lead_email", email); await page.getByTestId("confirm").click(); }
  else await page.getByTestId("skip-email").click();
}
