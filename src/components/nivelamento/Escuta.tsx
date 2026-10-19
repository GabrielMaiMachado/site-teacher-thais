"use client";

import { ArrowRight } from "lucide-react";

import { banco } from "@/lib/nivelamento/banco";

import { Alternativas, CabecalhoEtapa, Cartao } from "./comum";
import { PlayerAudio } from "./PlayerAudio";

export function Escuta({
  indice,
  reproducoes,
  respostas,
  ordem,
  onReproduzir,
  onResponder,
  onAvancar,
}: {
  indice: number;
  reproducoes: number;
  respostas: Record<string, number>;
  ordem: Record<string, number[]>;
  onReproduzir: () => void;
  onResponder: (id: string, marcada: number) => void;
  onAvancar: () => void;
}) {
  const audios = banco.escuta.audios;
  const audio = audios[indice];
  const ultimo = indice === audios.length - 1;
  const respondeuTudo = audio.perguntas.every((p) => p.id in respostas);

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoEtapa
        kicker={`Etapa 3 de 4 · áudio ${indice + 1} de ${audios.length}`}
        titulo={
          <>
            Ouça e <em>responda.</em>
          </>
        }
        texto="Você pode ouvir cada áudio no máximo 2 vezes. Leia as perguntas antes de apertar o play."
      />

      <Cartao className="flex flex-col gap-8">
        <PlayerAudio
          key={audio.id}
          src={audio.arquivo}
          reproducoes={reproducoes}
          onReproduzir={onReproduzir}
        />
        {audio.perguntas.map((pergunta, numero) => (
          <div key={pergunta.id} className="flex flex-col gap-4 border-t pt-7">
            <p id={`enunciado-${pergunta.id}`} className="font-serif text-xl leading-snug sm:text-2xl">
              <span className="mr-2 font-sans text-xs font-bold tracking-widest text-rose-deep">
                0{numero + 1}
              </span>
              {pergunta.enunciado}
            </p>
            <Alternativas
              questao={pergunta}
              ordem={ordem[pergunta.id]}
              marcada={respostas[pergunta.id]}
              rotulo={pergunta.enunciado}
              onMarcar={(marcada) => onResponder(pergunta.id, marcada)}
            />
          </div>
        ))}
      </Cartao>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-cocoa-soft">
          {respondeuTudo
            ? "Tudo respondido."
            : "Responda as 2 perguntas para avançar."}
        </p>
        <button
          type="button"
          className="cta"
          disabled={!respondeuTudo}
          onClick={onAvancar}
        >
          {ultimo ? "Ir para a escrita" : "Próximo áudio"}
          <ArrowRight className="size-4" strokeWidth={2.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
