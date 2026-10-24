// Estado do teste (salvo no localStorage) e tudo que é derivado dele.

import { banco } from "./banco";
import { HORARIOS, rotuloPlano, rotuloTipoTurma } from "./opcoes";
import {
  BRASIL,
  fusoDoNavegador,
  numeroInternacional,
  rotuloPais,
} from "./paises";
import {
  contarPalavras,
  embaralharIndices,
  nivelEscuta,
  nivelEstimado,
  nivelGramatica,
} from "./pontuacao";

export const CHAVE_ESTADO = "nivelamento-v1";
export const CHAVE_FILA = "nivelamento-fila";

export type Etapa =
  | "intro"
  | "cadastro"
  | "gramatica"
  | "escuta"
  | "escrita"
  | "resultado";

export type EtapaCronometrada = "gramatica" | "escuta" | "escrita";

export const ETAPAS_CRONOMETRADAS: EtapaCronometrada[] = [
  "gramatica",
  "escuta",
  "escrita",
];

export const DURACAO: Record<EtapaCronometrada, number> = {
  gramatica: 12 * 60,
  escuta: 8 * 60,
  escrita: 10 * 60,
};

export const NOME_ETAPA: Record<EtapaCronometrada, string> = {
  gramatica: "Gramática",
  escuta: "Escuta",
  escrita: "Escrita",
};

export type Perfil = {
  nome: string;
  /** Código do país do WhatsApp ("BR", "PT"… ou "outro"). */
  pais: string;
  /** Código de discagem digitado em "Outro país" (ex.: "41"). */
  ddi: string;
  /** Número local, do jeito que aparece no campo (com máscara). */
  whatsapp: string;
  email: string;
  genero: string;
  tipoTurma: string;
  plano: string;
  objetivo: string;
  jaEstudou: string;
  horarios: string[];
  consentimento: boolean;
  /** Honeypot: fica escondido; se vier preenchido, o envio é descartado. */
  site: string;
};

export type RespostaDetalhada = {
  id: string;
  marcada: string;
  certa: string;
  acertou: boolean;
};

/** O que o navegador envia para POST /api/nivelamento. */
export type EnvioNivelamento = {
  id: string;
  site: string;
  consentimento: boolean;
  perfil: Omit<Perfil, "consentimento" | "site" | "ddi"> & {
    /** Fuso do navegador (ex.: Europe/Lisbon), para saber onde a pessoa vive. */
    fuso: string;
  };
  resultado: {
    nivelPreliminar: string;
    gramatica: { acertos: number; total: number };
    escuta: { acertos: number; total: number };
  };
  respostasGramatica: RespostaDetalhada[];
  respostasEscuta: RespostaDetalhada[];
  escrita: {
    tema: string;
    texto: string;
    palavras: number;
    tentativasColar: number;
  };
  duracaoMin: number;
  trocasDeAba: number;
  encerradoPorTempo: string[];
};

export type StatusEnvio = "enviando" | "ok" | "falhou";

export type Estado = {
  versao: 1;
  etapa: Etapa;
  demo: boolean;
  iniciadoEm: number | null;
  perfil: Perfil;
  /** Ordem embaralhada das alternativas, por id da questão. */
  ordem: Record<string, number[]>;
  gramatica: {
    bloco: number;
    questao: number;
    /** id da questão → índice original da alternativa marcada */
    respostas: Record<string, number>;
  };
  escuta: {
    audio: number;
    reproducoes: number[];
    respostas: Record<string, number>;
  };
  escrita: { texto: string; tentativasColar: number };
  /** Segundos restantes da etapa cronometrada atual. */
  restante: number | null;
  trocasDeAba: number;
  encerradoPorTempo: string[];
  final: {
    id: string;
    envio: StatusEnvio;
    payload: EnvioNivelamento;
  } | null;
};

export function criarEstado(plano: string, demo: boolean): Estado {
  return {
    versao: 1,
    etapa: "intro",
    demo,
    iniciadoEm: null,
    perfil: {
      nome: "",
      pais: BRASIL,
      ddi: "",
      whatsapp: "",
      email: "",
      genero: "",
      tipoTurma: "",
      plano,
      objetivo: "",
      jaEstudou: "",
      horarios: [],
      consentimento: false,
      site: "",
    },
    ordem: {},
    gramatica: { bloco: 0, questao: 0, respostas: {} },
    escuta: {
      audio: 0,
      reproducoes: banco.escuta.audios.map(() => 0),
      respostas: {},
    },
    escrita: { texto: "", tentativasColar: 0 },
    restante: null,
    trocasDeAba: 0,
    encerradoPorTempo: [],
    final: null,
  };
}

/** Sorteia, uma única vez, a ordem das alternativas de todas as questões. */
export function sortearOrdens() {
  const ordem: Record<string, number[]> = {};
  const questoes = [
    ...banco.gramatica.flatMap((bloco) => bloco.questoes),
    ...banco.escuta.audios.flatMap((audio) => audio.perguntas),
  ];
  for (const questao of questoes) {
    ordem[questao.id] = embaralharIndices(questao.alternativas.length);
  }
  return ordem;
}

export function duracaoDaEtapa(etapa: EtapaCronometrada, demo: boolean) {
  return demo ? Math.round(DURACAO[etapa] / 6) : DURACAO[etapa];
}

export function calcularResultado(estado: Estado) {
  const { respostas: respG } = estado.gramatica;
  const acertosPorBloco: number[] = [];
  let gramAcertos = 0;
  let gramTotal = 0;
  for (const bloco of banco.gramatica) {
    const respondidas = bloco.questoes.filter((q) => q.id in respG);
    const acertos = respondidas.filter((q) => respG[q.id] === q.correta).length;
    gramAcertos += acertos;
    gramTotal += respondidas.length;
    if (respondidas.length === bloco.questoes.length) {
      acertosPorBloco.push(acertos);
    }
  }

  const { respostas: respE } = estado.escuta;
  let escAcertos = 0;
  let escTotal = 0;
  const porAudio = banco.escuta.audios.map((audio) => {
    const acertos = audio.perguntas.filter(
      (q) => respE[q.id] === q.correta,
    ).length;
    escAcertos += acertos;
    escTotal += audio.perguntas.length;
    return {
      nivel: banco.niveis.findIndex((n) => n.codigo === audio.nivel),
      acertos,
      total: audio.perguntas.length,
    };
  });

  const gram = nivelGramatica(acertosPorBloco);
  const esc = nivelEscuta(porAudio);
  return {
    nivelGramatica: gram,
    nivelEscuta: esc,
    nivel: nivelEstimado(gram, esc),
    gramatica: { acertos: gramAcertos, total: gramTotal },
    escuta: { acertos: escAcertos, total: escTotal },
  };
}

function detalhar(
  questoes: { id: string; alternativas: string[]; correta: number }[],
  respostas: Record<string, number>,
  incluirSemResposta: boolean,
): RespostaDetalhada[] {
  return questoes
    .filter((q) => incluirSemResposta || q.id in respostas)
    .map((q) => ({
      id: q.id,
      marcada: q.id in respostas ? q.alternativas[respostas[q.id]] : "",
      certa: q.alternativas[q.correta],
      acertou: respostas[q.id] === q.correta,
    }));
}

export function montarEnvio(
  estado: Estado,
  id: string,
  agora: number,
): EnvioNivelamento {
  const resultado = calcularResultado(estado);
  const { consentimento, site, ddi, ...perfil } = estado.perfil;
  return {
    id,
    site,
    consentimento,
    perfil: {
      ...perfil,
      // número completo, só dígitos, com o código do país (ex.: 351912345678)
      whatsapp: numeroInternacional(perfil.pais, perfil.whatsapp, ddi),
      pais: rotuloPais(perfil.pais, ddi),
      fuso: fusoDoNavegador(),
      // mantém a ordem da grade (Seg manhã, Seg tarde…)
      horarios: HORARIOS.filter((h) => perfil.horarios.includes(h)),
    },
    resultado: {
      nivelPreliminar: banco.niveis[resultado.nivel].codigo,
      gramatica: resultado.gramatica,
      escuta: resultado.escuta,
    },
    respostasGramatica: detalhar(
      banco.gramatica.flatMap((b) => b.questoes),
      estado.gramatica.respostas,
      false,
    ),
    respostasEscuta: detalhar(
      banco.escuta.audios.flatMap((a) => a.perguntas),
      estado.escuta.respostas,
      true,
    ),
    escrita: {
      tema: banco.escrita[resultado.nivel].tema,
      texto: estado.escrita.texto,
      palavras: contarPalavras(estado.escrita.texto),
      tentativasColar: estado.escrita.tentativasColar,
    },
    duracaoMin: estado.iniciadoEm
      ? Math.max(1, Math.round((agora - estado.iniciadoEm) / 60000))
      : 0,
    trocasDeAba: estado.trocasDeAba,
    encerradoPorTempo: estado.encerradoPorTempo,
  };
}

export function mensagemWhatsapp(envio: EnvioNivelamento) {
  const nivel = banco.niveis.find(
    (n) => n.codigo === envio.resultado.nivelPreliminar,
  );
  return [
    "Oi, Teacher Thaís! Fiz o teste de nivelamento 😊",
    `Código: ${envio.id}`,
    `Nome: ${envio.perfil.nome}`,
    ...(envio.perfil.pais && envio.perfil.pais !== "Brasil"
      ? [`País: ${envio.perfil.pais}`]
      : []),
    `Nível preliminar: ${envio.resultado.nivelPreliminar} (${nivel?.nome ?? ""})`,
    `Plano de interesse: ${rotuloPlano(envio.perfil.plano)}`,
    `Tipo de turma: ${rotuloTipoTurma(envio.perfil.tipoTurma)}`,
    `Objetivo: ${envio.perfil.objetivo}`,
    `Horários: ${envio.perfil.horarios.join(", ")}`,
  ].join("\n");
}

export function lerEstado(): Estado | null {
  try {
    const bruto = localStorage.getItem(CHAVE_ESTADO);
    if (!bruto) return null;
    const estado = JSON.parse(bruto) as Estado;
    if (estado?.versao !== 1) return null;
    // testes salvos antes do seletor de país eram sempre do Brasil
    estado.perfil = { ...estado.perfil, pais: estado.perfil.pais ?? BRASIL, ddi: estado.perfil.ddi ?? "" };
    return estado;
  } catch {
    return null;
  }
}

export function salvarEstado(estado: Estado) {
  try {
    localStorage.setItem(CHAVE_ESTADO, JSON.stringify(estado));
  } catch {
    // sem localStorage (aba anônima, cota cheia): o teste segue sem salvar
  }
}

export function limparEstado() {
  try {
    localStorage.removeItem(CHAVE_ESTADO);
  } catch {}
}

export function lerFila(): EnvioNivelamento[] {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_FILA) ?? "[]");
  } catch {
    return [];
  }
}

export function salvarFila(fila: EnvioNivelamento[]) {
  try {
    if (fila.length) localStorage.setItem(CHAVE_FILA, JSON.stringify(fila));
    else localStorage.removeItem(CHAVE_FILA);
  } catch {}
}

/** Envia para a API, com até 3 tentativas. */
export async function enviarResultado(envio: EnvioNivelamento) {
  const esperas = [0, 2000, 5000];
  for (const espera of esperas) {
    if (espera) await new Promise((r) => setTimeout(r, espera));
    try {
      const resposta = await fetch("/api/nivelamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(envio),
      });
      if (resposta.ok) return true;
      // erro de validação não melhora tentando de novo
      if (resposta.status === 400) return false;
    } catch {
      // rede caiu: tenta de novo
    }
  }
  return false;
}
