"use client";

import { Send } from "lucide-react";

import { contarPalavras } from "@/lib/nivelamento/pontuacao";

import { CabecalhoEtapa, Cartao } from "./comum";

export function Escrita({
  tema,
  texto,
  tentativasColar,
  onMudar,
  onColar,
  onEnviar,
}: {
  tema: string;
  texto: string;
  tentativasColar: number;
  onMudar: (texto: string) => void;
  onColar: () => void;
  onEnviar: () => void;
}) {
  const palavras = contarPalavras(texto);

  return (
    <div className="flex flex-col gap-8">
      <CabecalhoEtapa
        kicker="Etapa 4 de 4 · tema ajustado ao seu nível"
        titulo={
          <>
            Agora, <em>escreva.</em>
          </>
        }
      />

      <Cartao className="flex flex-col gap-5">
        <p id="tema-escrita" className="font-serif text-xl leading-snug sm:text-2xl">
          {tema}
        </p>
        <textarea
          className="campo min-h-64 resize-y leading-relaxed"
          value={texto}
          maxLength={3000}
          onChange={(e) => onMudar(e.target.value)}
          onPaste={(e) => {
            e.preventDefault();
            onColar();
          }}
          onDrop={(e) => e.preventDefault()}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          aria-labelledby="tema-escrita"
          aria-describedby="info-escrita"
        />
        <div
          id="info-escrita"
          className="flex flex-wrap justify-between gap-2 text-sm text-cocoa-soft tabular-nums"
        >
          <span aria-live="polite">
            {tentativasColar
              ? `Colar está desativado (${tentativasColar} ${tentativasColar > 1 ? "tentativas" : "tentativa"})`
              : "Colar está desativado nesta etapa"}
          </span>
          <span>
            <strong className="text-cocoa">{palavras}</strong>{" "}
            {palavras === 1 ? "palavra" : "palavras"}
          </span>
        </div>
      </Cartao>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-cocoa-soft">
          Quando o tempo acabar, o texto é enviado do jeito que estiver.
        </p>
        <button type="button" className="cta" onClick={onEnviar}>
          Enviar e ver resultado
          <Send className="size-4" strokeWidth={2.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
