export default function QuestionHeader({ text, helper, preface }: { text: string; helper?: string; preface?: string }) {
  return (
    <header className="mb-7 flex flex-col gap-3">
      {preface ? <p className="font-serif text-[20px] italic text-ink-soft">{preface}</p> : null}
      <h1 className="balance font-sans text-[22px] font-semibold leading-snug text-ink md:text-[26px]">{text}</h1>
      {helper ? <p className="pretty text-[15px] leading-relaxed text-muted">{helper}</p> : null}
    </header>
  );
}
