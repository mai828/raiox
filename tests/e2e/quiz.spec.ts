import { test, expect } from "@playwright/test";
import { DEMAND_WITHDRAW, answerQuestion, capture, currentScreen, driveTo, leave } from "./helpers";

test.describe("Raio-X do Seu Relacionamento", () => {
  test("fluxo completo no celular: perguntas, microdevolutivas, retrato, captura, processamento e resultado", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Raio-X do Seu Relacionamento" })).toBeVisible();
    // Nenhuma contagem de perguntas visível
    await page.getByTestId("start").click();
    await leave(page, "hero");
    await expect(page.locator("text=/Pergunta \\d+ de/")).toHaveCount(0);

    await driveTo(page, DEMAND_WITHDRAW, "i1");
    await expect(page.getByText("Existe conexão preservada aqui.")).toBeVisible();
    await driveTo(page, DEMAND_WITHDRAW, "i2");
    await expect(page.getByText("tem uma sequência se formando aqui")).toBeVisible();
    await driveTo(page, DEMAND_WITHDRAW, "partial");
    await expect(page.getByText("Este é o retrato da sua relação")).toBeVisible();
    await expect(page.locator("text=/\\b\\d{1,3}\\/100/")).toHaveCount(0); // sem números no retrato parcial
    await driveTo(page, DEMAND_WITHDRAW, "i4");
    await expect(page.getByText("Sua história não está aparecendo como explicação óbvia até aqui.")).toBeVisible();
    await driveTo(page, DEMAND_WITHDRAW, "pre");
    await page.getByTestId("continue").click(); await leave(page, "pre");
    await capture(page, "Renata", "11999990000", "renata@exemplo.com");

    await expect(page.locator('[data-screen="proc"]')).toBeVisible();
    await expect(page.getByTestId("processing-phrase")).toBeVisible();
    await expect(page.getByTestId("result")).toBeVisible({ timeout: 15000 });

    const headline = await page.getByTestId("result-headline").textContent();
    expect(headline).toMatch(/afeto ainda existe|conversas/i);
    await expect(page.getByText("Conseguir conversar sem acabar sempre no mesmo lugar").first()).toBeVisible();
    await expect(page.getByText("ele se fecha").first()).toBeVisible();
    await expect(page.getByText("Presa no Ciclo Cobrança-Afastamento")).toBeVisible();
    await expect(page.getByText("Minha hipótese a partir das suas respostas")).toBeVisible();
    // Sem número configurado no build de teste: fallback com a mensagem pré-preenchida
    const fb = page.getByTestId("cta-fallback");
    await expect(fb).toBeVisible();
    await expect(fb).toContainText("Meu nome é Renata");
    await expect(fb).toContainText("Conversa e reparação");
    await expect(fb).not.toContainText("R$");
    // Sem scroll horizontal
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });

  test("voltar e editar recalcula a microdevolutiva", async ({ page }) => {
    await page.goto("/");
    await driveTo(page, { ...DEMAND_WITHDRAW, Q04: "none", Q05: "rarely" }, "i1");
    await expect(page.getByText("A distância pode estar acontecendo antes mesmo das brigas.")).toBeVisible();
    await page.getByRole("button", { name: "Voltar para a tela anterior" }).click(); await leave(page, "i1");
    await expect(page.locator('[data-screen="Q05"] [data-option="rarely"]')).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Voltar para a tela anterior" }).click(); await leave(page, "Q05");
    await answerQuestion(page, "Q04", "four_plus");
    await answerQuestion(page, "Q05", "knows");
    await expect(page.getByText("Existe conexão preservada aqui.")).toBeVisible();
  });

  test("persiste e oferece retomada após recarregar", async ({ page }) => {
    await page.goto("/");
    await driveTo(page, DEMAND_WITHDRAW, "Q07");
    await page.reload();
    await expect(page.getByText("Seu Raio-X ainda está aqui.")).toBeVisible();
    await page.getByTestId("resume").click();
    expect(await currentScreen(page)).toBe("Q07");
  });

  test("“prefiro não responder” na pergunta íntima não penaliza o eixo de afeto", async ({ page }) => {
    await page.goto("/");
    const a = { ...DEMAND_WITHDRAW, Q15: "natural", Q16: "na" };
    await driveTo(page, a, "pre");
    await page.getByTestId("continue").click(); await leave(page, "pre");
    await capture(page);
    await expect(page.getByTestId("result")).toBeVisible({ timeout: 15000 });
    const row = page.locator("li", { hasText: "Afeto e intimidade" }).first();
    await expect(row).toContainText("100");
  });

  test("multi-select com opção exclusiva", async ({ page }) => {
    await page.goto("/");
    await driveTo(page, DEMAND_WITHDRAW, "Q24");
    const f = page.locator('[data-screen="Q24"]');
    await f.locator('[data-option="humor"]').click();
    await f.locator('[data-option="hard_to_see"]').click();
    await expect(f.locator('[data-option="humor"]')).toHaveAttribute("aria-checked", "false");
    await expect(f.locator('[data-option="hard_to_see"]')).toHaveAttribute("aria-checked", "true");
    await f.locator('[data-option="humor"]').click();
    await expect(f.locator('[data-option="hard_to_see"]')).toHaveAttribute("aria-checked", "false");
  });

  test("ramo: não está em um relacionamento", async ({ page }) => {
    await page.goto("/");
    await driveTo(page, { Q01: "D" }, "nir");
    await expect(page.getByText(/foi construído para relações que ainda estão acontecendo/)).toBeVisible();
    await expect(page.getByTestId("cta-fallback")).toHaveCount(0);
  });

  test("ramos de conflito e parceria mudam a microdevolutiva e o visual", async ({ page }) => {
    await page.goto("/");
    const overload = { ...DEMAND_WITHDRAW, Q07: "F", Q08: "resumed", Q09: "resolve", Q10: "respect", Q11: "me_almost_all", Q12: "almost_always", Q13: "redo" };
    await driveTo(page, overload, "i2");
    await expect(page.getByText("Vocês parecem preservar uma habilidade importante.")).toBeVisible();
    await driveTo(page, overload, "i3");
    await expect(page.getByText("aqui aparece uma contradição importante")).toBeVisible();
    await expect(page.getByRole("img", { name: /carga entre você e seu parceiro/ })).toBeVisible();
  });

  test("segurança: remove o fluxo comercial e mostra canais de apoio", async ({ page }) => {
    await page.goto("/");
    await driveTo(page, { ...DEMAND_WITHDRAW, Q31: "yes" }, "pre");
    await page.getByTestId("continue").click(); await leave(page, "pre");
    await capture(page, "Ana");
    await expect(page.getByText("Sua segurança vem antes de qualquer leitura sobre dinâmica de relacionamento.")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("190")).toBeVisible();
    await expect(page.getByText("180")).toBeVisible();
    await expect(page.getByTestId("cta-fallback")).toHaveCount(0);
    await page.getByTestId("view-summary").click();
    await expect(page.getByTestId("result")).toBeVisible();
    await expect(page.getByTestId("cta-fallback")).toHaveCount(0);
    await expect(page.getByText("Quero conversar sobre o meu Raio-X")).toHaveCount(0);
  });

  test("webhook em modo local responde ok sem URL configurada", async ({ request }) => {
    const res = await request.post("/api/lead", { data: { session_id: "sess-teste-123", quiz_version: "2.0.0", lead_name: "Teste", lead_whatsapp: "5511999990000", event: "lead_capture_complete" } });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.delivered).toBe(false);
    const bad = await request.post("/api/lead", { data: { foo: 1 } });
    expect(bad.status()).toBe(400);
  });
});
