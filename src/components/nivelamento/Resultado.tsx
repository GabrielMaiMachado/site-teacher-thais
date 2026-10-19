"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, RotateCcw } from "lucide-react";

import { whatsappUrl } from "@/lib/contato";
import { banco } from "@/lib/nivelamento/banco";
import {
  mensagemWhatsapp,
  type EnvioNivelamento,
  type StatusEnvio,
} from "@/lib/nivelamento/estado";

import { Cartao } from "./comum";

function StatusSalvo({
  status,
  onTentarDeNovo,
}: {
  status: StatusEnvio;
  onTentarDeNovo: () => void;
}) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm text-cocoa-soft" aria-live="polite">
      {status === "ok" && (
        <>
          <Check className="size-4 text-emerald-700" strokeWidth={2.5} aria-hidden="true" />
          Resultado salvo
        </>
      )}
      {status === "enviando" && (
        <>
          <span className="size-2 animate-pulse rounded-full bg-amber-500 motion-reduce:animate-none" aria-hidden="true" />
          Tentando salvar…
        </>
      )}
      {status === "falhou" && (
        <>
          Não conseguimos salvar agora. Tentaremos de novo na sua próxima
          visita, mas você já pode enviar no WhatsApp.
          <button
            type="button"
            onClick={onTentarDeNovo}
            className="font-bold text-rose-deep underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-rose-deep"
          >
            Tentar agora
          </button>
        </>
      )}
    </p>
  );
}

export function Resultado({
  envio,
  status,
  onTentarDeNovo,
  onRefazer,
}: {
  envio: EnvioNivelamento;
  status: StatusEnvio;
  onTentarDeNovo: () => void;
  onRefazer: () => void;
}) {
  const [copiado, setCopiado] = useState<"" | "ok" | "selecionado">("");
  const [confirmarRefazer, setConfirmarRefazer] = useState(false);
  const caixaMensagem = useRef<HTMLTextAreaElement>(null);

  const indice = banco.niveis.findIndex(
    (n) => n.codigo === envio.resultado.nivelPreliminar,
  );
  const nivel = banco.niveis[indice];
  const mensagem = mensagemWhatsapp(envio);
  const { gramatica, escuta } = envio.resultado;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensagem);
      setCopiado("ok");
    } catch {
      // sem acesso à área de transferência: seleciona o texto para copiar à mão
      caixaMensagem.current?.focus();
      caixaMensagem.current?.select();
      setCopiado("selecionado");
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <div className="kicker">Seu resultado preliminar</div>
        <h1
          id="titulo-etapa"
          tabIndex={-1}
          className="mt-5 text-[clamp(3rem,11vw,5rem)] leading-[0.95] tracking-[-0.04em] outline-none"
        >
          {nivel.codigo} · <em>{nivel.nome}</em>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-cocoa-soft">
          {nivel.descricao}
        </p>
        <ol aria-label="Escala de níveis, do A1 ao C1" className="mt-8 grid grid-cols-5 gap-1.5">
          {banco.niveis.map((n, i) => (
            <li
              key={n.codigo}
              aria-current={i === indice ? "true" : undefined}
              className={`rounded-xl border py-3 text-center text-sm font-bold tracking-wide ${
                i === indice
                  ? "border-cocoa bg-cocoa text-cream-soft"
                  : i < indice
                    ? "border-petal bg-petal/60 text-cocoa"
                    : "bg-white/70 text-cocoa-soft"
              }`}
            >
              {n.codigo}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { rotulo: "Gramática", valor: `${gramatica.acertos}/${gramatica.total}`, nota: "acertos" },
          { rotulo: "Escuta", valor: `${escuta.acertos}/${escuta.total}`, nota: "acertos" },
          { rotulo: "Escrita", valor: "—", nota: "em análise pela Thaís" },
        ].map((bloco) => (
          <div key={bloco.rotulo} className="rounded-[1.25rem] border bg-white/80 p-3.5 sm:rounded-[1.5rem] sm:p-5">
            <span className="text-[0.625rem] font-bold tracking-widest text-rose-deep uppercase sm:text-xs">
              {bloco.rotulo}
            </span>
            <p className="mt-2 font-serif text-2xl tracking-tight tabular-nums sm:text-3xl">{bloco.valor}</p>
            <p className="mt-1 text-xs leading-snug text-cocoa-soft sm:text-sm">{bloco.nota}</p>
          </div>
        ))}
      </div>

      <Cartao className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl tracking-tight sm:text-3xl">
            Próximo <em>passo</em>
          </h2>
          <p className="mt-3 leading-relaxed text-cocoa-soft">
            A Teacher Thaís lê sua escrita e confirma seu nível em até 48h.
            Depois, vocês fazem uma conversa rápida de 10 minutos pelo Meet. A
            turma abre quando tiver 3 ou 4 pessoas do seu nível com horário em
            comum.
          </p>
        </div>

        <label className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            Mensagem para a Thaís · código{" "}
            <span className="font-mono">{envio.id}</span>
          </span>
          <textarea
            ref={caixaMensagem}
            readOnly
            value={mensagem}
            rows={9}
            className="campo resize-none border-dashed text-sm leading-relaxed"
          />
        </label>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button type="button" onClick={copiar} className="cta-outline">
            {copiado === "ok" ? (
              <Check className="size-4" strokeWidth={2.75} aria-hidden="true" />
            ) : (
              <Copy className="size-4" strokeWidth={2.5} aria-hidden="true" />
            )}
            {copiado === "ok" ? "Mensagem copiada" : "Copiar mensagem"}
          </button>
          <a
            href={whatsappUrl(mensagem)}
            target="_blank"
            rel="noopener noreferrer"
            className="cta cta-glow"
          >
            Enviar resultado no WhatsApp
            <ArrowUpRight className="size-4" strokeWidth={2.75} aria-hidden="true" />
          </a>
        </div>
        {copiado === "selecionado" && (
          <p className="text-sm text-cocoa-soft" role="status">
            Selecionamos o texto: use Ctrl+C (ou toque e segure para copiar).
          </p>
        )}
        <StatusSalvo status={status} onTentarDeNovo={onTentarDeNovo} />
      </Cartao>

      <div>
        {confirmarRefazer ? (
          <div role="alertdialog" aria-labelledby="titulo-refazer" className="rounded-[1.5rem] border border-blush bg-[#fff0f3] p-5">
            <p id="titulo-refazer" className="font-semibold">
              Refazer o teste do começo?
            </p>
            <p className="mt-1 text-sm text-cocoa-soft">
              Este resultado continua guardado com a Thaís. Faça de novo só se
              algo deu errado (por exemplo, outra pessoa fez no seu lugar).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={onRefazer} className="cta-outline px-5 py-3">
                Sim, refazer
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => setConfirmarRefazer(false)}
                className="cta px-5 py-3"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmarRefazer(true)}
            className="inline-flex items-center gap-2 text-sm font-semibold text-cocoa-soft underline-offset-4 hover:text-rose-deep hover:underline focus-visible:outline-2 focus-visible:outline-rose-deep"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Precisa refazer o teste?
          </button>
        )}
      </div>
    </div>
  );
}
