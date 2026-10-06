"use client";
import ConnectionLineViz from "@/components/visualizations/ConnectionLineViz";
import PartialPortrait from "@/components/visualizations/PartialPortrait";
import type { DimensionScores } from "@/types";

export function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col justify-center gap-8">
      <ConnectionLineViz variant="hero" className="w-full max-w-[320px]" />
      <div className="flex flex-col gap-5">
        <p className="eyebrow">Márcio Conceição</p>
        <h1 className="balance font-serif text-[44px] font-medium leading-[1.02] text-ink md:text-[64px]">Raio-X do Seu Relacionamento</h1>
        <p className="pretty font-serif text-[22px] italic leading-snug text-ink-soft md:text-[26px]">Descubra o que pode estar mantendo seu relacionamento no mesmo lugar, mesmo depois de tudo que você já tentou.</p>
        <p className="pretty max-w-[52ch] text-[16px] leading-relaxed text-muted">Um diagnóstico sobre como a relação de vocês funciona hoje, não sobre como ela deveria funcionar.</p>
      </div>
      <div><button type="button" className="btn-primary" onClick={onStart} data-testid="start">Começar meu Raio-X</button></div>
    </div>
  );
}

export function HowScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 font-serif text-[24px] leading-snug text-ink md:text-[30px]">
        <p className="pretty">Eu não vou pedir que você defina seu casamento em uma palavra.</p>
        <p className="pretty">Vou olhar para cenas, conversas e comportamentos que acontecem entre vocês.</p>
        <p className="pretty">No final, junto essas peças para mostrar:</p>
      </div>
      <ul className="flex flex-col gap-2 border-l border-wine-soft pl-5 text-[17px] text-ink-soft">
        <li>onde a relação ainda tem força;</li>
        <li>onde ela parece perder força;</li>
        <li>e qual dinâmica merece ser investigada com mais atenção.</li>
      </ul>
      <div><button type="button" className="btn-primary" onClick={onStart} data-testid="continue">Começar</button></div>
    </div>
  );
}

export function PartialPortraitScreen({ dims, onContinue }: { dims: DimensionScores; onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Até aqui</p>
        <h1 className="balance font-serif text-[30px] font-medium leading-tight text-ink md:text-[38px]">Este é o retrato da sua relação</h1>
      </div>
      <div className="card"><PartialPortrait dims={dims} /></div>
      <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-soft">
        <p>Isso ainda não é seu resultado.</p>
        <p>Até aqui, já dá para enxergar onde a relação parece ganhar ou perder força.</p>
        <p>O que falta descobrir é por que algumas respostas continuam aparecendo mesmo depois das tentativas de mudança.</p>
      </div>
      <div><button type="button" className="btn-primary" onClick={onContinue} data-testid="continue">Quero entender essa parte</button></div>
    </div>
  );
}

export function PreResultScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="balance font-serif text-[32px] font-medium leading-tight text-ink md:text-[40px]">Falta pouco para fechar sua leitura.</h1>
      <div className="flex flex-col gap-3 text-[17px] leading-relaxed text-ink-soft">
        <p>Agora eu já tenho quase todas as peças.</p>
        <p>Falta organizar o que aparece como força, onde a relação perde mais energia e quais respostas parecem conversar entre si.</p>
      </div>
      <div><button type="button" className="btn-primary" onClick={onContinue} data-testid="continue">Fechar meu Raio-X</button></div>
    </div>
  );
}

export function NotInRelationshipScreen({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex flex-col gap-7">
      <h1 className="balance font-serif text-[30px] font-medium leading-tight text-ink md:text-[36px]">Este Raio-X foi construído para relações que ainda estão acontecendo ou que estão em processo real de decisão ou reconstrução.</h1>
      <p className="text-[17px] leading-relaxed text-ink-soft">Ele provavelmente não vai conseguir te entregar uma leitura justa do seu momento atual.</p>
      <div><button type="button" className="btn-ghost -ml-5" onClick={onRestart}>Voltar ao início</button></div>
    </div>
  );
}

export function ResumePrompt({ onResume, onRestart }: { onResume: () => void; onRestart: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="resume-title">
      <div className="card w-full max-w-[440px] shadow-soft">
        <h2 id="resume-title" className="font-serif text-[26px] font-medium leading-tight text-ink">Seu Raio-X ainda está aqui.</h2>
        <p className="mt-2 text-[16px] text-ink-soft">Quer continuar de onde parou?</p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" className="btn-ghost" onClick={onRestart}>Começar de novo</button>
          <button type="button" className="btn-primary" onClick={onResume} data-testid="resume">Continuar de onde parei</button>
        </div>
      </div>
    </div>
  );
}
