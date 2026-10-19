import dados from "./banco.json";

export type Questao = {
  id: string;
  enunciado: string;
  alternativas: string[];
  correta: number;
};

export type Audio = {
  id: string;
  nivel: string;
  arquivo: string;
  voz: string;
  voiceId: string;
  velocidade: number;
  texto: string;
  perguntas: Questao[];
};

export type Banco = {
  niveis: { codigo: string; nome: string; descricao: string }[];
  gramatica: { nivel: string; questoes: Questao[] }[];
  /** `versao` entra na URL dos MP3 (?v=1); aumente ao regerar os áudios. */
  escuta: { modelo: string; versao: number; audios: Audio[] };
  escrita: { nivel: string; tema: string }[];
};

export const banco: Banco = dados;

export function urlDoAudio(audio: Audio) {
  return `${audio.arquivo}?v=${banco.escuta.versao}`;
}

export function indiceDoNivel(codigo: string) {
  return banco.niveis.findIndex((nivel) => nivel.codigo === codigo);
}
