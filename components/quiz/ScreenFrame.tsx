"use client";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Moldura de tela: largura, entrada/saída suaves, botão voltar. */
export default function ScreenFrame({ children, width = "question", onBack, screenKey }: { children: ReactNode; width?: "question" | "insight" | "result"; onBack?: () => void; screenKey: string }) {
  const reduce = useReducedMotion();
  const max = width === "question" ? "max-w-question" : width === "insight" ? "max-w-insight" : "max-w-result";
  return (
    <motion.section key={screenKey} data-screen={screenKey} className={`mx-auto w-full ${max} px-5 pb-16 pt-6 md:px-8 md:pt-10`}
      initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }} transition={{ duration: 0.3, ease: "easeOut" }}>
      {onBack ? (
        <button type="button" onClick={onBack} className="btn-ghost -ml-4 mb-4 gap-2 text-[14px]" aria-label="Voltar para a tela anterior">
          <span aria-hidden>←</span> Voltar
        </button>
      ) : null}
      {children}
    </motion.section>
  );
}
