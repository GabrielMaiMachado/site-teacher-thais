// WhatsApp de qualquer país: lista de países, máscara, validação, detecção
// do código colado junto e diferença de fuso para Brasília. Funções puras.

import { mascararWhatsapp, somenteDigitos } from "./pontuacao.ts";

export type Pais = {
  codigo: string;
  nome: string;
  ddi: string;
  bandeira: string;
  /** "de Portugal", "dos Estados Unidos" */
  de: string;
  /** "em Portugal", "nos Estados Unidos" */
  em: string;
  /** Fuso de referência para a diferença de horário. */
  fuso: string;
  /** O país tem vários fusos (aí vale mais o fuso do navegador). */
  variosFusos?: boolean;
  exemplo: string;
};

export const BRASIL = "BR";
export const OUTRO_PAIS = "outro";
export const FUSO_BRASILIA = "America/Sao_Paulo";

export const PAISES: Pais[] = [
  { codigo: "BR", nome: "Brasil", ddi: "55", bandeira: "🇧🇷", de: "do Brasil", em: "no Brasil", fuso: "America/Sao_Paulo", exemplo: "(11) 99999-9999" },
  { codigo: "PT", nome: "Portugal", ddi: "351", bandeira: "🇵🇹", de: "de Portugal", em: "em Portugal", fuso: "Europe/Lisbon", exemplo: "912 345 678" },
  { codigo: "US", nome: "Estados Unidos", ddi: "1", bandeira: "🇺🇸", de: "dos Estados Unidos", em: "em Nova York", fuso: "America/New_York", variosFusos: true, exemplo: "415 555 0123" },
  { codigo: "GB", nome: "Reino Unido", ddi: "44", bandeira: "🇬🇧", de: "do Reino Unido", em: "no Reino Unido", fuso: "Europe/London", exemplo: "7911 123456" },
  { codigo: "ES", nome: "Espanha", ddi: "34", bandeira: "🇪🇸", de: "da Espanha", em: "na Espanha", fuso: "Europe/Madrid", exemplo: "612 345 678" },
  { codigo: "IE", nome: "Irlanda", ddi: "353", bandeira: "🇮🇪", de: "da Irlanda", em: "na Irlanda", fuso: "Europe/Dublin", exemplo: "85 123 4567" },
  { codigo: "CA", nome: "Canadá", ddi: "1", bandeira: "🇨🇦", de: "do Canadá", em: "em Toronto", fuso: "America/Toronto", variosFusos: true, exemplo: "416 555 0123" },
  { codigo: "DE", nome: "Alemanha", ddi: "49", bandeira: "🇩🇪", de: "da Alemanha", em: "na Alemanha", fuso: "Europe/Berlin", exemplo: "1512 3456789" },
  { codigo: "FR", nome: "França", ddi: "33", bandeira: "🇫🇷", de: "da França", em: "na França", fuso: "Europe/Paris", exemplo: "6 12 34 56 78" },
  { codigo: "IT", nome: "Itália", ddi: "39", bandeira: "🇮🇹", de: "da Itália", em: "na Itália", fuso: "Europe/Rome", exemplo: "312 345 6789" },
  { codigo: "JP", nome: "Japão", ddi: "81", bandeira: "🇯🇵", de: "do Japão", em: "no Japão", fuso: "Asia/Tokyo", exemplo: "90 1234 5678" },
  { codigo: "AR", nome: "Argentina", ddi: "54", bandeira: "🇦🇷", de: "da Argentina", em: "na Argentina", fuso: "America/Argentina/Buenos_Aires", exemplo: "9 11 2345 6789" },
];

export function encontrarPais(codigo: string) {
  return PAISES.find((p) => p.codigo === codigo);
}

/** Código do país em uso: o da lista ou, em "Outro país", o digitado. */
export function ddiDe(pais: string, ddiDigitado: string) {
  return encontrarPais(pais)?.ddi ?? somenteDigitos(ddiDigitado).slice(0, 3);
}

export function rotuloPais(pais: string, ddiDigitado: string) {
  const encontrado = encontrarPais(pais);
  if (encontrado) return encontrado.nome;
  const ddi = ddiDe(pais, ddiDigitado);
  return ddi ? `Outro (+${ddi})` : "Outro";
}

/** Máximo de dígitos do número local, para a máscara não deixar passar. */
function maximoLocal(pais: string, ddi: string) {
  if (pais === BRASIL) return 11;
  if (pais === "PT") return 9;
  return 15 - (ddi.length || 1);
}

/** Máscara enquanto a pessoa digita: Brasil (11) 99999-9999, Portugal 912 345 678, resto só dígitos. */
export function mascararNumero(pais: string, valor: string, ddiDigitado = "") {
  const digitos = somenteDigitos(valor);
  if (pais === BRASIL) return mascararWhatsapp(digitos);
  if (pais === "PT") {
    return digitos.slice(0, 9).replace(/(\d{3})(?=\d)/g, "$1 ");
  }
  return digitos.slice(0, maximoLocal(pais, ddiDe(pais, ddiDigitado)));
}

/** Número completo no formato internacional, só dígitos (ex.: 351912345678). */
export function numeroInternacional(pais: string, numero: string, ddiDigitado = "") {
  return ddiDe(pais, ddiDigitado) + somenteDigitos(numero);
}

/** Devolve a mensagem de erro, ou null se o número está certo. */
export function validarTelefone(pais: string, numero: string, ddiDigitado = "") {
  const digitos = somenteDigitos(numero);
  const info = encontrarPais(pais);
  const ddi = ddiDe(pais, ddiDigitado);

  if (pais === OUTRO_PAIS && !ddi) return "Informe o código do país, como +41.";
  if (!digitos) return "Informe seu WhatsApp.";
  if (pais === BRASIL) {
    return digitos.length === 10 || digitos.length === 11
      ? null
      : "Número do Brasil deve ter DDD + número (10 ou 11 dígitos), como (11) 99999-9999.";
  }
  if (pais === "PT") {
    return /^9\d{8}$/.test(digitos)
      ? null
      : "Número de Portugal deve ter 9 dígitos, começando com 9, como 912 345 678.";
  }
  const total = ddi.length + digitos.length;
  if (total >= 8 && total <= 15) return null;
  return info
    ? `Número ${info.de} deve ter de 8 a 15 dígitos contando o código +${ddi}, como ${info.exemplo}.`
    : `Com o código +${ddi}, o número deve ter de 8 a 15 dígitos ao todo.`;
}

// Códigos de país (E.164) não são prefixo uns dos outros: dá para saber quantos
// dígitos o código tem só olhando o começo. 1 e 7 têm 1 dígito; estes, 2; o resto, 3.
const DDI_DE_2_DIGITOS = new Set(
  "20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 51 52 53 54 55 56 57 58 60 61 62 63 64 65 66 81 82 84 86 90 91 92 93 94 95 98".split(" "),
);

export function tamanhoDoDdi(digitos: string) {
  if (digitos[0] === "1" || digitos[0] === "7") return 1;
  return DDI_DE_2_DIGITOS.has(digitos.slice(0, 2)) ? 2 : 3;
}

/** Países com regra própria de tamanho: dá para reconhecer o número sem o "+". */
function numeroLocalValido(pais: string, digitos: string) {
  if (pais === BRASIL) return digitos.length === 10 || digitos.length === 11;
  if (pais === "PT") return /^9\d{8}$/.test(digitos);
  return false;
}

export type TelefoneInterpretado = { pais: string; ddi: string; numero: string };

/**
 * Número colado ou preenchido já com o código do país (+351 912 345 678,
 * 00351…, 351912345678). Devolve o país e o número local, ou null se o texto
 * não traz código de país reconhecível.
 */
export function interpretarTelefone(
  bruto: string,
  paisAtual: string,
): TelefoneInterpretado | null {
  const texto = bruto.trim();
  let digitos = somenteDigitos(texto);
  if (!digitos) return null;

  const comPrefixo = texto.startsWith("+") || texto.startsWith("00");
  if (texto.startsWith("00")) digitos = digitos.slice(2);

  if (comPrefixo) {
    const ddi = digitos.slice(0, tamanhoDoDdi(digitos));
    const numero = digitos.slice(ddi.length);
    // +1 serve para EUA e Canadá: mantém o que a pessoa já escolheu
    const atual = encontrarPais(paisAtual);
    const pais =
      atual?.ddi === ddi ? atual.codigo : (PAISES.find((p) => p.ddi === ddi)?.codigo ?? OUTRO_PAIS);
    return { pais, ddi, numero };
  }

  // Sem "+": só troca se o número não serve para o país atual e, sem o
  // código, serve para Brasil ou Portugal (ex.: 351912345678).
  if (numeroLocalValido(paisAtual, digitos)) return null;
  for (const pais of PAISES) {
    const resto = digitos.slice(pais.ddi.length);
    if (digitos.startsWith(pais.ddi) && numeroLocalValido(pais.codigo, resto)) {
      return { pais: pais.codigo, ddi: pais.ddi, numero: resto };
    }
  }
  // EUA/Canadá com o 1 na frente (números locais de lá nunca começam com 1)
  const atual = encontrarPais(paisAtual);
  if (atual?.ddi === "1" && digitos.length === 11 && digitos.startsWith("1")) {
    return { pais: atual.codigo, ddi: "1", numero: digitos.slice(1) };
  }
  return null;
}

/** Passou do tamanho que o país aceita? Então provavelmente veio com o código. */
export function excedeTamanhoLocal(pais: string, valor: string, ddiDigitado = "") {
  return somenteDigitos(valor).length > maximoLocal(pais, ddiDe(pais, ddiDigitado));
}

// ---------------------------------------------------------------------------
// Fuso horário
// ---------------------------------------------------------------------------

const FUSOS_DO_BRASIL = new Set(
  "Sao_Paulo Bahia Fortaleza Recife Belem Maceio Araguaina Santarem Manaus Cuiaba Campo_Grande Porto_Velho Boa_Vista Rio_Branco Eirunepe Noronha"
    .split(" ")
    .map((cidade) => `America/${cidade}`),
);

export function fusoDoNavegador() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  } catch {
    return "";
  }
}

/** Deslocamento do fuso em minutos naquela data (respeita horário de verão). */
export function deslocamentoEmMinutos(fuso: string, data: Date) {
  const nome =
    new Intl.DateTimeFormat("en-US", { timeZone: fuso, timeZoneName: "shortOffset" })
      .formatToParts(data)
      .find((parte) => parte.type === "timeZoneName")?.value ?? "GMT";
  const partes = nome.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!partes) return 0;
  const sinal = partes[1] === "-" ? -1 : 1;
  return sinal * (Number(partes[2]) * 60 + Number(partes[3] ?? 0));
}

export function diferencaParaBrasilia(fuso: string, data: Date) {
  return deslocamentoEmMinutos(fuso, data) - deslocamentoEmMinutos(FUSO_BRASILIA, data);
}

function descreverDiferenca(minutos: number) {
  const total = Math.abs(minutos);
  const horas = Math.floor(total / 60);
  const resto = total % 60;
  const partes = [];
  if (horas) partes.push(`${horas} ${horas === 1 ? "hora" : "horas"}`);
  if (resto) partes.push(`${resto} minutos`);
  const quanto = partes.join(" e ");
  const verbo = horas === 1 && !resto ? "é" : "são";
  return `${verbo} ${quanto} a ${minutos > 0 ? "mais" : "menos"}`;
}

/**
 * "Em Portugal, são 4 horas a mais neste período." Para países com vários
 * fusos (ou "Outro país"), usa o fuso do navegador se ele não for do Brasil.
 * Devolve null para o Brasil ou quando não dá para saber.
 */
export function textoDiferencaDeFuso(
  pais: string,
  fusoNavegador: string,
  data = new Date(),
) {
  if (pais === BRASIL) return null;
  const info = encontrarPais(pais);
  const navegadorForaDoBrasil =
    !!fusoNavegador && !FUSOS_DO_BRASIL.has(fusoNavegador) && fusoNavegador !== "UTC";

  let fuso: string;
  let onde: string;
  if (info && !info.variosFusos) {
    fuso = info.fuso;
    onde = info.em;
  } else if (navegadorForaDoBrasil) {
    fuso = fusoNavegador;
    onde = "no seu fuso";
  } else if (info) {
    fuso = info.fuso;
    onde = info.em;
  } else {
    return null;
  }

  let minutos: number;
  try {
    minutos = diferencaParaBrasilia(fuso, data);
  } catch {
    return null;
  }
  const Onde = onde[0].toUpperCase() + onde.slice(1);
  if (minutos === 0) return `${Onde}, o horário é o mesmo de Brasília neste período.`;
  return `${Onde}, ${descreverDiferenca(minutos)} neste período.`;
}
