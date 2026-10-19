"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw } from "lucide-react";

export const MAX_REPRODUCOES = 2;

type Aviso = null | "toque" | "falhou";

/** O MP3 existe e responde? Pede só 2 bytes, sem cache. */
async function arquivoResponde(url: string) {
  try {
    const resposta = await fetch(url, {
      headers: { Range: "bytes=0-1" },
      cache: "no-store",
    });
    return resposta.ok;
  } catch {
    return false;
  }
}

/**
 * Player sem a barra nativa: não dá para avançar nem voltar, e cada áudio
 * toca no máximo 2 vezes. A reprodução só é contada quando o som começa, então
 * falha de carregamento ou recusa do navegador não gasta nada.
 */
export function PlayerAudio({
  src: srcBase,
  reproducoes,
  onReproduzir,
}: {
  src: string;
  reproducoes: number;
  onReproduzir: () => void;
}) {
  const audio = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState(srcBase);
  const [tocando, setTocando] = useState(false);
  const [pedindo, setPedindo] = useState(false);
  const [aviso, setAviso] = useState<Aviso>(null);
  // false durante a desmontagem: erros e promessas dessa hora são ignorados
  const ativo = useRef(true);
  const conferindo = useRef(false);
  const jaRecarregou = useRef(false);
  const restantes = Math.max(0, MAX_REPRODUCOES - reproducoes);

  useEffect(() => {
    ativo.current = true;
    const elemento = audio.current;
    return () => {
      ativo.current = false;
      elemento?.pause();
    };
  }, []);

  /** Erro de verdade do arquivo: confere no servidor antes de avisar. */
  async function conferirArquivo() {
    if (conferindo.current) return;
    conferindo.current = true;
    const existe = await arquivoResponde(srcBase);
    conferindo.current = false;
    if (!ativo.current) return;
    if (existe && !jaRecarregou.current) {
      // O servidor tem o arquivo: a cópia do navegador é que estava quebrada.
      // Busca de novo, sem cache, e pede um novo toque (o play precisa de um clique).
      jaRecarregou.current = true;
      setSrc(`${srcBase}&t=${Date.now()}`);
      setAviso("toque");
      return;
    }
    setAviso("falhou");
  }

  // Sem await antes do play(): o Safari do iPhone só toca se o play() sair
  // direto do clique.
  function tocar() {
    const elemento = audio.current;
    if (!elemento || tocando || pedindo || restantes === 0) return;
    setAviso(null);
    if (elemento.currentTime > 0) elemento.currentTime = 0;
    let promessa: Promise<void>;
    try {
      promessa = Promise.resolve(elemento.play());
    } catch (erro) {
      promessa = Promise.reject(erro);
    }
    setPedindo(true);
    promessa.then(
      () => {
        if (!ativo.current) return;
        setPedindo(false);
        setTocando(true);
        onReproduzir();
      },
      (erro: unknown) => {
        if (!ativo.current) return;
        setPedindo(false);
        const nome = erro instanceof DOMException ? erro.name : "";
        if (nome === "NotAllowedError") setAviso("toque");
        else if (nome === "AbortError") return; // interrompido: não conta, nada a avisar
        else void conferirArquivo();
      },
    );
  }

  function aoErroDoArquivo() {
    // só conta como erro de carregamento se vier do próprio arquivo (MediaError)
    if (!ativo.current || !audio.current?.error) return;
    setTocando(false);
    setPedindo(false);
    void conferirArquivo();
  }

  function tentarDeNovo() {
    jaRecarregou.current = false;
    setAviso(null);
    setSrc(`${srcBase}&t=${Date.now()}`);
  }

  const bloqueado = tocando || pedindo || restantes === 0;

  return (
    <div className="flex flex-col gap-4">
      <audio
        ref={audio}
        src={src}
        preload="auto"
        onEnded={() => setTocando(false)}
        onError={aoErroDoArquivo}
      />
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          onClick={tocar}
          disabled={bloqueado}
          aria-label={
            tocando || pedindo
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

      {aviso === "toque" && restantes > 0 && (
        <p role="status" className="rounded-2xl bg-cream px-4 py-3 text-sm text-cocoa">
          Toque no botão para ouvir.
        </p>
      )}

      {aviso === "falhou" && (
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
