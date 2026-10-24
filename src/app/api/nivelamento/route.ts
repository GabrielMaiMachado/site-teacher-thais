import { banco } from "@/lib/nivelamento/banco";
import type { EnvioNivelamento, RespostaDetalhada } from "@/lib/nivelamento/estado";
import {
  GENEROS,
  HORARIOS,
  JA_ESTUDOU,
  OBJETIVOS,
  PLANOS,
  rotuloPlano,
  rotuloTipoTurma,
  TIPOS_TURMA,
} from "@/lib/nivelamento/opcoes";
import { whatsappValido } from "@/lib/nivelamento/pontuacao";

const LIMITE_ESCRITA = 3000;

// Limite simples por IP, em memória: 5 envios a cada 10 minutos.
// Cada instância serverless tem o seu, o que basta para segurar abuso casual.
const JANELA_MS = 10 * 60 * 1000;
const MAX_ENVIOS = 5;
const enviosPorIp = new Map<string, number[]>();

function excedeuLimite(ip: string) {
  const agora = Date.now();
  const recentes = (enviosPorIp.get(ip) ?? []).filter((t) => agora - t < JANELA_MS);
  if (recentes.length >= MAX_ENVIOS) {
    enviosPorIp.set(ip, recentes);
    return true;
  }
  recentes.push(agora);
  enviosPorIp.set(ip, recentes);
  if (enviosPorIp.size > 5000) enviosPorIp.clear();
  return false;
}

function erro(mensagem: string, status: number) {
  return Response.json({ ok: false, erro: mensagem }, { status });
}

const texto = (valor: unknown, max: number) =>
  typeof valor === "string" && valor.length <= max ? valor.trim() : null;
const inteiro = (valor: unknown, max: number) =>
  Number.isInteger(valor) && (valor as number) >= 0 && (valor as number) <= max
    ? (valor as number)
    : null;
const umDe = (valor: unknown, opcoes: readonly string[]) =>
  typeof valor === "string" && opcoes.includes(valor) ? valor : null;

function listaRespostas(valor: unknown): RespostaDetalhada[] | null {
  if (!Array.isArray(valor) || valor.length > 40) return null;
  const lista = valor.map((r) => ({
    id: texto(r?.id, 20),
    marcada: texto(r?.marcada, 200),
    certa: texto(r?.certa, 200),
    acertou: r?.acertou === true,
  }));
  return lista.every((r) => r.id !== null && r.marcada !== null && r.certa !== null)
    ? (lista as RespostaDetalhada[])
    : null;
}

/** Ex.: A1-1 ✓ | A2-3 ✗ (marcou "had have", certa "were having") */
function formatarRespostas(respostas: RespostaDetalhada[]) {
  return respostas
    .map((r) =>
      r.acertou
        ? `${r.id} ✓`
        : `${r.id} ✗ (${r.marcada ? `marcou "${r.marcada}"` : "sem resposta"}, certa "${r.certa}")`,
    )
    .join(" | ");
}

/** Valida o JSON do navegador e monta a linha que vai para o Apps Script. */
function validar(corpo: Partial<EnvioNivelamento>) {
  const perfil = corpo.perfil;
  const resultado = corpo.resultado;
  const escrita = corpo.escrita;
  if (!perfil || !resultado || !escrita) return null;

  const id = typeof corpo.id === "string" && /^NIV-\d{8}-[A-HJ-NP-Z2-9]{4}$/.test(corpo.id) ? corpo.id : null;
  const nome = texto(perfil.nome, 120);
  // Formato internacional, só dígitos (E.164: 8 a 15). Envios antigos, de antes
  // do seletor de país, não têm `pais` e trazem só DDD + número do Brasil.
  const formatoAntigo = perfil.pais === undefined;
  const digitos = typeof perfil.whatsapp === "string" ? perfil.whatsapp.replace(/\D/g, "") : "";
  const whatsapp = formatoAntigo
    ? whatsappValido(digitos) ? `55${digitos}` : null
    : /^[1-9]\d{7,14}$/.test(digitos) ? digitos : null;
  const pais = formatoAntigo ? "Brasil" : texto(perfil.pais, 60);
  const fuso = formatoAntigo ? "" : texto(perfil.fuso ?? "", 60);
  const email = texto(perfil.email ?? "", 160);
  const genero = umDe(perfil.genero, GENEROS);
  const tipoTurma = umDe(perfil.tipoTurma, TIPOS_TURMA.map((t) => t.valor));
  const plano = umDe(perfil.plano, PLANOS.map((p) => p.valor));
  const objetivo = umDe(perfil.objetivo || "", ["", ...OBJETIVOS]);
  const jaEstudou = umDe(perfil.jaEstudou || "", ["", ...JA_ESTUDOU]);
  const horarios =
    Array.isArray(perfil.horarios) &&
    perfil.horarios.length > 0 &&
    perfil.horarios.every((h) => HORARIOS.includes(h))
      ? HORARIOS.filter((h) => perfil.horarios.includes(h))
      : null;
  const nivel = umDe(resultado.nivelPreliminar, banco.niveis.map((n) => n.codigo));
  const gramAcertos = inteiro(resultado.gramatica?.acertos, 25);
  const gramTotal = inteiro(resultado.gramatica?.total, 25);
  const escAcertos = inteiro(resultado.escuta?.acertos, 8);
  const escTotal = inteiro(resultado.escuta?.total, 8);
  const tema = texto(escrita.tema, 300);
  const textoEscrita = typeof escrita.texto === "string" ? escrita.texto.slice(0, LIMITE_ESCRITA) : null;
  const palavras = inteiro(escrita.palavras, LIMITE_ESCRITA);
  const colar = inteiro(escrita.tentativasColar, 10000);
  const duracao = inteiro(corpo.duracaoMin, 100000);
  const trocas = inteiro(corpo.trocasDeAba, 10000);
  const respostasGramatica = listaRespostas(corpo.respostasGramatica);
  const respostasEscuta = listaRespostas(corpo.respostasEscuta);
  const encerrado =
    Array.isArray(corpo.encerradoPorTempo) &&
    corpo.encerradoPorTempo.every((e) => umDe(e, ["Gramática", "Escuta", "Escrita"]))
      ? corpo.encerradoPorTempo
      : null;

  const campos = {
    id, nome, whatsapp, pais, fuso, email, genero, tipoTurma, plano, objetivo, jaEstudou,
    horarios, nivel, gramAcertos, gramTotal, escAcertos, escTotal, tema,
    textoEscrita, palavras, colar, duracao, trocas, respostasGramatica,
    respostasEscuta, encerrado,
  };
  const faltando = Object.entries(campos)
    .filter(([, valor]) => valor === null)
    .map(([nome]) => nome);
  if (faltando.length) return { faltando };
  if (!nome || !pais || corpo.consentimento !== true) {
    return { faltando: ["nome/país/consentimento"] };
  }
  if (tipoTurma === "mesmo-genero" && genero === "Prefiro não informar") {
    return { faltando: ["genero"] };
  }

  return {
    linha: {
      id,
      nome,
      // já chega completo, com o código do país (ex.: 351912345678)
      whatsapp,
      pais,
      fuso,
      email,
      genero,
      tipoTurma: rotuloTipoTurma(tipoTurma!),
      plano: rotuloPlano(plano!),
      objetivo,
      jaEstudou,
      nivelPreliminar: nivel,
      gramaticaAcertos: gramAcertos,
      gramaticaTotal: gramTotal,
      escutaAcertos: escAcertos,
      escutaTotal: escTotal,
      horarios,
      duracaoMin: duracao,
      trocasDeAba: trocas,
      tentativasColar: colar,
      encerradoPorTempo: encerrado!.join(", "),
      temaEscrita: tema,
      textoEscrita,
      palavras,
      respostasGramatica: formatarRespostas(respostasGramatica!),
      respostasEscuta: formatarRespostas(respostasEscuta!),
    },
  };
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "desconhecido";

  let corpo: Partial<EnvioNivelamento>;
  try {
    corpo = await request.json();
  } catch {
    return erro("O envio não está em um formato válido.", 400);
  }

  // Honeypot preenchido: robô. Finge que deu certo e não grava nada.
  if (typeof corpo?.site === "string" && corpo.site.trim() !== "") {
    return Response.json({ ok: true });
  }

  if (excedeuLimite(ip)) {
    return erro("Muitos envios em pouco tempo. Tente de novo em alguns minutos.", 429);
  }

  const validado = validar(corpo);
  if (!validado?.linha) {
    const faltando = validado?.faltando ?? [];
    return erro(
      `Dados incompletos ou inválidos${faltando.length ? `: ${faltando.join(", ")}` : ""}.`,
      400,
    );
  }

  const url = process.env.SHEETS_WEBHOOK_URL;
  const secret = process.env.SHEETS_SECRET;
  if (!url || !secret) {
    console.error("SHEETS_WEBHOOK_URL ou SHEETS_SECRET não configurados.");
    return erro("A planilha ainda não foi configurada.", 500);
  }

  try {
    // O Web App do Apps Script responde com 302; o fetch segue o
    // redirecionamento (como GET) e recebe o JSON final do doPost.
    const resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validado.linha, secret }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    const bruto = await resposta.text();
    let json: { ok?: boolean; erro?: string } = {};
    try {
      json = JSON.parse(bruto);
    } catch {
      console.error("Resposta inesperada do Apps Script:", resposta.status, bruto.slice(0, 300));
    }
    if (!resposta.ok || json.ok !== true) {
      console.error("Apps Script recusou o envio:", resposta.status, json.erro);
      return erro("Não foi possível salvar na planilha agora.", 502);
    }
    return Response.json({ ok: true });
  } catch (falha) {
    console.error("Falha ao falar com o Apps Script:", falha);
    return erro("Não foi possível salvar na planilha agora.", 502);
  }
}
