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
  escuta: { modelo: string; audios: Audio[] };
  escrita: { nivel: string; tema: string }[];
};

export const banco: Banco = dados;

export function indiceDoNivel(codigo: string) {
  return banco.niveis.findIndex((nivel) => nivel.codigo === codigo);
}
