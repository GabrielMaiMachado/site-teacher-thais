"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { banco } from "@/lib/nivelamento/banco";
import {
  calcularResultado,
  criarEstado,
  duracaoDaEtapa,
  enviarResultado,
  ETAPAS_CRONOMETRADAS,
  lerEstado,
  lerFila,
  montarEnvio,
  NOME_ETAPA,
  salvarEstado,
  salvarFila,
  sortearOrdens,
  type Estado,
  type Etapa,
  type EtapaCronometrada,
  type Perfil,
} from "@/lib/nivelamento/estado";
import { planoValido } from "@/lib/nivelamento/opcoes";
import { gerarCodigo, passouNoBloco } from "@/lib/nivelamento/pontuacao";

import { BarraTempo } from "./BarraTempo";
import { Cadastro } from "./Cadastro";
import { Escrita } from "./Escrita";
import { Escuta } from "./Escuta";
import { Gramatica } from "./Gramatica";
import { Intro } from "./Intro";
import { Resultado } from "./Resultado";

function cronometrada(etapa: Etapa): etapa is EtapaCronometrada {
  return (ETAPAS_CRONOMETRADAS as Etapa[]).includes(etapa);
}

function irPara(estado: Estado, etapa: Etapa): Estado {
  return {
    ...estado,
    etapa,
    restante: cronometrada(etapa) ? duracaoDaEtapa(etapa, estado.demo) : null,
  };
}

function finalizar(estado: Estado): Estado {
  const id = gerarCodigo(new Date());
  return {
    ...estado,
    etapa: "resultado",
    restante: null,
    final: { id, envio: "enviando", payload: montarEnvio(estado, id, Date.now()) },
  };
}

const PROXIMA: Record<EtapaCronometrada, (estado: Estado) => Estado> = {
  gramatica: (e) => irPara(e, "escuta"),
  escuta: (e) => irPara(e, "escrita"),
  escrita: finalizar,
};

/** Um segundo a menos; quando zera, registra e passa para a próxima etapa. */
function passarUmSegundo(estado: Estado): Estado {
  if (!cronometrada(estado.etapa) || estado.restante === null) return estado;
  const restante = estado.restante - 1;
  if (restante > 0) return { ...estado, restante };
  const encerrado = {
    ...estado,
    encerradoPorTempo: [...estado.encerradoPorTempo, NOME_ETAPA[estado.etapa]],
  };
  return PROXIMA[estado.etapa](encerrado);
}

function responderGramatica(estado: Estado, id: string, marcada: number): Estado {
  const respostas = { ...estado.gramatica.respostas, [id]: marcada };
  const { bloco, questao } = estado.gramatica;
  const questoes = banco.gramatica[bloco].questoes;

  if (questao < questoes.length - 1) {
    return { ...estado, gramatica: { bloco, questao: questao + 1, respostas } };
  }
  // fim do bloco: só passa para o próximo com 3 ou mais acertos
  const acertos = questoes.filter((q) => respostas[q.id] === q.correta).length;
  const atualizado = { ...estado, gramatica: { ...estado.gramatica, respostas } };
  if (passouNoBloco(acertos) && bloco < banco.gramatica.length - 1) {
    return { ...atualizado, gramatica: { bloco: bloco + 1, questao: 0, respostas } };
  }
  return irPara(atualizado, "escuta");
}

function estadoInicial(): Estado {
  const params = new URLSearchParams(window.location.search);
  const plano = params.get("plano");
  const demo = params.get("demo") === "1";
  const salvo = lerEstado();
  if (!salvo) return criarEstado(planoValido(plano) ? plano : "nao-sei", demo);

  // Quem ainda não começou pode trocar o plano/demo pela URL.
  if (salvo.etapa === "intro") {
    return {
      ...salvo,
      demo,
      perfil: { ...salvo.perfil, plano: planoValido(plano) ? plano : salvo.perfil.plano },
    };
  }
  // Envio que falhou na visita anterior: tenta de novo agora.
  if (salvo.final && salvo.final.envio !== "ok") {
    return { ...salvo, final: { ...salvo.final, envio: "enviando" } };
  }
  return salvo;
}

export default function TesteNivelamento() {
  const [estado, setEstado] = useState<Estado>(estadoInicial);
  const atualizar = useCallback(
    (mudar: (estado: Estado) => Estado) => setEstado(mudar),
    [],
  );

  useEffect(() => {
    salvarEstado(estado);
  }, [estado]);

  // Timer da etapa: continua de onde parou porque `restante` fica salvo.
  const etapaAtual = estado.etapa;
  useEffect(() => {
    if (!cronometrada(etapaAtual)) return;
    const timer = setInterval(() => setEstado(passarUmSegundo), 1000);
    return () => clearInterval(timer);
  }, [etapaAtual]);

  // Trocas de aba: só vão para a planilha, ninguém é punido.
  useEffect(() => {
    function aoMudarVisibilidade() {
      if (!document.hidden) return;
      setEstado((e) =>
        cronometrada(e.etapa) ? { ...e, trocasDeAba: e.trocasDeAba + 1 } : e,
      );
    }
    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    return () =>
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
  }, []);

  // Ao trocar de etapa: volta ao topo e leva o foco para o título.
  const primeiraRenderizacao = useRef(true);
  useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById("titulo-etapa")?.focus({ preventScroll: true });
  }, [etapaAtual, estado.escuta.audio]);

  // Envio para a planilha (com até 3 tentativas dentro de enviarResultado).
  const emEnvio = useRef(new Set<string>());
  const final = estado.final;
  useEffect(() => {
    if (!final || final.envio !== "enviando" || emEnvio.current.has(final.id)) {
      return;
    }
    emEnvio.current.add(final.id);
    enviarResultado(final.payload).then((ok) => {
      emEnvio.current.delete(final.id);
      setEstado((e) =>
        e.final?.id === final.id
          ? { ...e, final: { ...e.final, envio: ok ? "ok" : "falhou" } }
          : e,
      );
    });
  }, [final]);

  // Envios de testes anteriores que ficaram pendentes (ex.: refez sem salvar).
  const filaIniciada = useRef(false);
  useEffect(() => {
    if (filaIniciada.current) return;
    filaIniciada.current = true;
    const fila = lerFila();
    if (!fila.length) return;
    Promise.all(fila.map(enviarResultado)).then((oks) => {
      const enviados = new Set(fila.filter((_, i) => oks[i]).map((f) => f.id));
      salvarFila(lerFila().filter((envio) => !enviados.has(envio.id)));
    });
  }, []);

  function tentarSalvarDeNovo() {
    setEstado((e) =>
      e.final ? { ...e, final: { ...e.final, envio: "enviando" } } : e,
    );
  }

  function refazer() {
    if (estado.final && estado.final.envio !== "ok") {
      salvarFila([...lerFila(), estado.final.payload]);
    }
    setEstado(criarEstado(estado.perfil.plano, estado.demo));
  }

  const etapa = estado.etapa;
  const resultado = calcularResultado(estado);

  return (
    <>
      {cronometrada(etapa) && estado.restante !== null && (
        <BarraTempo
          rotulo={NOME_ETAPA[etapa]}
          restante={estado.restante}
          total={duracaoDaEtapa(etapa, estado.demo)}
        />
      )}
      <div className="mx-auto w-full max-w-2xl px-5 pt-10 pb-24 sm:pt-14">
        {etapa === "intro" && (
          <Intro
            demo={estado.demo}
            onComecar={() =>
              atualizar((e) => ({
                ...irPara(e, "cadastro"),
                iniciadoEm: Date.now(),
                ordem: sortearOrdens(),
              }))
            }
          />
        )}
        {etapa === "cadastro" && (
          <Cadastro
            perfil={estado.perfil}
            onMudar={(perfil: Partial<Perfil>) =>
              atualizar((e) => ({ ...e, perfil: { ...e.perfil, ...perfil } }))
            }
            onConcluir={() => atualizar((e) => irPara(e, "gramatica"))}
          />
        )}
        {etapa === "gramatica" && (
          <Gramatica
            bloco={estado.gramatica.bloco}
            questao={estado.gramatica.questao}
            ordem={estado.ordem}
            onResponder={(id, marcada) =>
              atualizar((e) => responderGramatica(e, id, marcada))
            }
          />
        )}
        {etapa === "escuta" && (
          <Escuta
            indice={estado.escuta.audio}
            reproducoes={estado.escuta.reproducoes[estado.escuta.audio] ?? 0}
            respostas={estado.escuta.respostas}
            ordem={estado.ordem}
            onReproduzir={() =>
              atualizar((e) => ({
                ...e,
                escuta: {
                  ...e.escuta,
                  reproducoes: e.escuta.reproducoes.map((n, i) =>
                    i === e.escuta.audio ? n + 1 : n,
                  ),
                },
              }))
            }
            onResponder={(id, marcada) =>
              atualizar((e) => ({
                ...e,
                escuta: {
                  ...e.escuta,
                  respostas: { ...e.escuta.respostas, [id]: marcada },
                },
              }))
            }
            onAvancar={() =>
              atualizar((e) =>
                e.escuta.audio < banco.escuta.audios.length - 1
                  ? { ...e, escuta: { ...e.escuta, audio: e.escuta.audio + 1 } }
                  : irPara(e, "escrita"),
              )
            }
          />
        )}
        {etapa === "escrita" && (
          <Escrita
            tema={banco.escrita[resultado.nivel].tema}
            texto={estado.escrita.texto}
            tentativasColar={estado.escrita.tentativasColar}
            onMudar={(texto) =>
              atualizar((e) => ({ ...e, escrita: { ...e.escrita, texto } }))
            }
            onColar={() =>
              atualizar((e) => ({
                ...e,
                escrita: {
                  ...e.escrita,
                  tentativasColar: e.escrita.tentativasColar + 1,
                },
              }))
            }
            onEnviar={() => atualizar(finalizar)}
          />
        )}
        {etapa === "resultado" && estado.final && (
          <Resultado
            envio={estado.final.payload}
            status={estado.final.envio}
            onTentarDeNovo={tentarSalvarDeNovo}
            onRefazer={refazer}
          />
        )}
      </div>
    </>
  );
}
