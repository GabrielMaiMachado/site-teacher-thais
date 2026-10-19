// Funções puras de pontuação do teste de nivelamento.
// Níveis são índices: 0 = A1, 1 = A2, 2 = B1, 3 = B2, 4 = C1.

export const CODIGOS_NIVEL = ["A1", "A2", "B1", "B2", "C1"] as const;
export type CodigoNivel = (typeof CODIGOS_NIVEL)[number];

export const NIVEL_MIN = 0;
export const NIVEL_MAX = CODIGOS_NIVEL.length - 1;

/** Acertos mínimos (de 5) para passar para o próximo bloco de gramática. */
export const ACERTOS_PARA_AVANCAR = 3;

export function passouNoBloco(acertos: number) {
  return acertos >= ACERTOS_PARA_AVANCAR;
}

/**
 * Nível de gramática: o último bloco aprovado, em sequência a partir do A1.
 * Recebe os acertos de cada bloco concluído, na ordem. Blocos incompletos
 * (ex.: interrompidos pelo tempo) não devem ser passados.
 * Retorna -1 se não passou nem no A1.
 */
export function nivelGramatica(acertosPorBloco: number[]) {
  let nivel = -1;
  for (const acertos of acertosPorBloco) {
    if (!passouNoBloco(acertos)) break;
    nivel++;
  }
  return Math.min(nivel, NIVEL_MAX);
}

/**
 * Nível de escuta: o maior nível em que a pessoa acertou todas as perguntas
 * do áudio. Mínimo A1.
 */
export function nivelEscuta(
  audios: { nivel: number; acertos: number; total: number }[],
) {
  let nivel = NIVEL_MIN;
  for (const audio of audios) {
    if (audio.total > 0 && audio.acertos === audio.total) {
      nivel = Math.max(nivel, audio.nivel);
    }
  }
  return nivel;
}

/** round(gramática × 0,6 + escuta × 0,4), limitado entre A1 e C1. */
export function nivelEstimado(nivelGram: number, nivelEsc: number) {
  const bruto = Math.round(nivelGram * 0.6 + nivelEsc * 0.4);
  return Math.min(NIVEL_MAX, Math.max(NIVEL_MIN, bruto));
}

export function contarPalavras(texto: string) {
  return (texto.trim().match(/\S+/g) ?? []).length;
}

export function formatarTempo(segundos: number) {
  const s = Math.max(0, Math.ceil(segundos));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Sem 0/O e 1/I, para não confundir na hora de ler ou digitar. */
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Código do teste: NIV-AAAAMMDD-XXXX. */
export function gerarCodigo(data: Date, aleatorio: () => number = Math.random) {
  const dia = `${data.getFullYear()}${String(data.getMonth() + 1).padStart(2, "0")}${String(data.getDate()).padStart(2, "0")}`;
  let sufixo = "";
  for (let i = 0; i < 4; i++) {
    sufixo += ALFABETO_CODIGO[Math.floor(aleatorio() * ALFABETO_CODIGO.length)];
  }
  return `NIV-${dia}-${sufixo}`;
}

export function somenteDigitos(valor: string) {
  return valor.replace(/\D/g, "");
}

/** WhatsApp com DDD: 10 ou 11 dígitos (sem o 55). */
export function whatsappValido(valor: string) {
  const digitos = somenteDigitos(valor);
  return digitos.length === 10 || digitos.length === 11;
}

/** Máscara (55) 99999-9999 enquanto a pessoa digita. */
export function mascararWhatsapp(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  const meio = d.length === 11 ? 7 : 6;
  if (d.length <= meio) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, meio)}-${d.slice(meio)}`;
}

/** Embaralhamento de Fisher-Yates: devolve a nova ordem dos índices. */
export function embaralharIndices(
  quantidade: number,
  aleatorio: () => number = Math.random,
) {
  const ordem = Array.from({ length: quantidade }, (_, i) => i);
  for (let i = ordem.length - 1; i > 0; i--) {
    const j = Math.floor(aleatorio() * (i + 1));
    [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  }
  return ordem;
}
