import type { ReactNode } from "react";

import type { Questao } from "@/lib/nivelamento/banco";

export function CabecalhoEtapa({
  kicker,
  titulo,
  texto,
}: {
  kicker: string;
  titulo: ReactNode;
  texto?: ReactNode;
}) {
  return (
    <div>
      <div className="kicker">{kicker}</div>
      <h1
        id="titulo-etapa"
        tabIndex={-1}
        className="mt-5 text-[clamp(2.25rem,7vw,3.5rem)] leading-[1.02] tracking-[-0.03em] outline-none"
      >
        {titulo}
      </h1>
      {texto && (
        <p className="mt-5 text-lg leading-relaxed text-cocoa-soft">{texto}</p>
      )}
    </div>
  );
}

export function Cartao({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[2rem] border bg-white/80 p-6 backdrop-blur-sm sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

/** Alternativas de múltipla escolha, na ordem embaralhada. */
export function Alternativas({
  questao,
  ordem,
  marcada,
  rotulo,
  onMarcar,
}: {
  questao: Questao;
  ordem: number[] | undefined;
  marcada: number | undefined;
  rotulo: string;
  onMarcar: (indiceOriginal: number) => void;
}) {
  const indices = ordem ?? questao.alternativas.map((_, i) => i);
  return (
    <div role="group" aria-label={rotulo} className="flex flex-col gap-2.5">
      {indices.map((original, posicao) => (
        <button
          key={original}
          type="button"
          aria-pressed={marcada === original}
          onClick={() => onMarcar(original)}
          className="opcao"
        >
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full border border-cocoa/20 font-serif text-sm italic"
          >
            {"abcd"[posicao]}
          </span>
          {questao.alternativas[original]}
        </button>
      ))}
    </div>
  );
}
