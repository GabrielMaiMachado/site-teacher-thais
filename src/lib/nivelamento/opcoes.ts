// Opções do cadastro. Os rótulos são os mesmos que vão para a planilha.

export const GENEROS = ["Mulher", "Homem", "Prefiro não informar"] as const;
export type Genero = (typeof GENEROS)[number];

export const TIPOS_TURMA = [
  { valor: "mista", rotulo: "Turma mista", planilha: "Mista" },
  {
    valor: "mesmo-genero",
    rotulo: "Turma só com pessoas do mesmo gênero",
    planilha: "Mesmo gênero",
  },
  { valor: "tanto-faz", rotulo: "Tanto faz", planilha: "Tanto faz" },
] as const;
export type TipoTurma = (typeof TIPOS_TURMA)[number]["valor"];

export const PLANOS = [
  { valor: "turma", rotulo: "Turma de até 4" },
  { valor: "dupla", rotulo: "Dupla" },
  { valor: "individual-1x", rotulo: "Individual 1x" },
  { valor: "individual-2x", rotulo: "Individual 2x" },
  { valor: "nao-sei", rotulo: "Ainda não sei" },
] as const;
export type Plano = (typeof PLANOS)[number]["valor"];

export const OBJETIVOS = [
  "Conversação no dia a dia",
  "Trabalho/carreira",
  "Viagens",
  "Provas e certificados",
  "Faculdade/estudos",
] as const;

export const JA_ESTUDOU = [
  "Nunca",
  "Pouco (escola)",
  "Curso por 1–2 anos",
  "Curso por 3 anos ou mais",
] as const;

export const DIAS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
export const TURNOS = ["manhã", "tarde", "noite"] as const;

/** Os 18 horários na ordem das colunas da planilha: Seg manhã, Seg tarde, Seg noite, Ter manhã… */
export const HORARIOS = DIAS.flatMap((dia) =>
  TURNOS.map((turno) => `${dia} ${turno}`),
);

export function rotuloPlano(valor: string) {
  return PLANOS.find((plano) => plano.valor === valor)?.rotulo ?? valor;
}

export function rotuloTipoTurma(valor: string) {
  return TIPOS_TURMA.find((tipo) => tipo.valor === valor)?.planilha ?? valor;
}

export function planoValido(valor: string | null): valor is Plano {
  return PLANOS.some((plano) => plano.valor === valor);
}
