"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

export const MAX_REPRODUCOES = 2;

/**
 * Player sem a barra nativa: não dá para avançar nem voltar, e cada áudio
 * toca no máximo 2 vezes. A reprodução só é contada quando o som começa,
 * então uma falha de carregamento não gasta nada.
 */
export function PlayerAudio({
  src,
  reproducoes,
  onReproduzir,
}: {
  src: string;
  reproducoes: number;
  onReproduzir: () => void;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [tocando, setTocando] = useState(false);
  const [erro, setErro] = useState(false);
  const restantes = Math.max(0, MAX_REPRODUCOES - reproducoes);

  useEffect(() => {
    const elemento = audio.current;
    return () => elemento?.pause();
  }, []);

  async function tocar() {
    const elemento = audio.current;
    if (!elemento || tocando || restantes === 0) return;
    setErro(false);
    try {
      elemento.currentTime = 0;
      await elemento.play();
      setTocando(true);
      onReproduzir();
    } catch {
      setErro(true);
    }
  }

  function tentarDeNovo() {
    setErro(false);
    audio.current?.load();
  }

  return (
    <div className="flex flex-col gap-4">
      <audio
        ref={audio}
        src={src}
        preload="auto"
        onEnded={() => setTocando(false)}
        onError={() => {
          setTocando(false);
          setErro(true);
        }}
      />
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={tocar}
          disabled={tocando || restantes === 0}
          aria-label={
            tocando
              ? "Tocando o áudio"
              : restantes === 0
                ? "Reproduções esgotadas"
                : "Tocar o áudio"
          }
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-blush text-cocoa shadow-[0_10px_30px_-12px_rgb(201_109_138/0.7)] transition duration-300 hover:bg-blush-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-deep disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          <Play className="ml-1 size-7 fill-current" strokeWidth={2} aria-hidden="true" />
        </button>

        <div
          className="onda flex h-6 items-center gap-[3px]"
          data-tocando={tocando}
          aria-hidden="true"
        >
          {Array.from({ length: 16 }, (_, i) => (
            <i key={i} />
          ))}
        </div>

        <div className="ml-auto flex flex-col items-end gap-1.5">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: MAX_REPRODUCOES }, (_, i) => (
              <span
                key={i}
                className={`size-2.5 rounded-full border-[1.5px] border-rose-deep ${
                  i < reproducoes ? "bg-rose-deep" : ""
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-cocoa-soft" aria-live="polite">
            {restantes} de {MAX_REPRODUCOES} reproduções restantes
          </span>
        </div>
      </div>

      {erro && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <span>
            Não conseguimos carregar o áudio. Confira sua internet; nenhuma
            reprodução foi gasta.
          </span>
          <button
            type="button"
            onClick={tentarDeNovo}
            className="inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-deep"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  );
}
