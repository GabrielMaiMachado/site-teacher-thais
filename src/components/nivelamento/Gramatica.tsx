"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

import { banco } from "@/lib/nivelamento/banco";

import { Alternativas, CabecalhoEtapa, Cartao } from "./comum";

const TOTAL_QUESTOES = banco.gramatica.reduce(
  (total, bloco) => total + bloco.questoes.length,
  0,
);

function Enunciado({ texto }: { texto: string }) {
  const [antes, depois] = texto.split("___");
  return (
    <p className="font-serif text-[1.65rem] leading-snug tracking-tight sm:text-3xl">
      {antes}
      {depois !== undefined && (
        <>
          <span
            aria-label="lacuna"
            className="mx-1 inline-block w-20 border-b-2 border-rose-deep align-baseline"
          />
          {depois}
        </>
      )}
    </p>
  );
}

function Questao({
  numero,
  id,
  ordem,
  onResponder,
}: {
  numero: number;
  id: string;
  ordem: number[] | undefined;
  onResponder: (marcada: number) => void;
}) {
  const [marcada, setMarcada] = useState<number>();
  const cartao = useRef<HTMLDivElement>(null);
  // Depois de "Próxima" o botão some; o foco vai para a nova questão.
  useEffect(() => {
    if (document.activeElement === document.body) {
      cartao.current?.querySelector<HTMLElement>(".opcao")?.focus();
    }
  }, []);
  const bloco = banco.gramatica.find((b) => b.questoes.some((q) => q.id === id))!;
  const questao = bloco.questoes.find((q) => q.id === id)!;

  return (
    <>
      <div ref={cartao}>
        <Cartao className="flex flex-col gap-7">
          <div className="flex items-center justify-between gap-4 text-sm text-cocoa-soft">
            <span>
              Questão {numero} de até {TOTAL_QUESTOES}
            </span>
            <span className="rounded-full bg-cream px-3 py-1 text-xs font-bold tracking-widest text-rose-deep">
              Bloco {bloco.nivel}
            </span>
          </div>
          <Enunciado texto={questao.enunciado} />
          <Alternativas
            questao={questao}
            ordem={ordem}
            marcada={marcada}
            rotulo="Alternativas"
            onMarcar={setMarcada}
          />
        </Cartao>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-cocoa-soft">Não dá para voltar depois de avançar.</p>
        <button
          type="button"
          className="cta"
          disabled={marcada === undefined}
          onClick={() => marcada !== undefined && onResponder(marcada)}
        >
          Próxima
          <ArrowRight className="size-4" strokeWidth={2.75} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

export function Gramatica({
  bloco,
  questao,
  ordem,
  onResponder,
}: {
  bloco: number;
  questao: number;
  ordem: Record<string, number[]>;
  onResponder: (id: string, marcada: number) => void;
}) {
  const atual = banco.gramatica[bloco].questoes[questao];
  const numero =
    banco.gramatica
      .slice(0, bloco)
      .reduce((total, b) => total + b.questoes.length, 0) +
    questao +
    1;

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoEtapa
        kicker="Etapa 2 de 4 · gramática e vocabulário"
        titulo={
          <>
            Complete a <em>frase.</em>
          </>
        }
      />
      <Questao
        key={atual.id}
        numero={numero}
        id={atual.id}
        ordem={ordem[atual.id]}
        onResponder={(marcada) => onResponder(atual.id, marcada)}
      />
    </div>
  );
}
