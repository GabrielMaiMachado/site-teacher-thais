"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import type { Perfil } from "@/lib/nivelamento/estado";
import {
  DIAS,
  GENEROS,
  JA_ESTUDOU,
  OBJETIVOS,
  PLANOS,
  TIPOS_TURMA,
  TURNOS,
} from "@/lib/nivelamento/opcoes";
import { mascararWhatsapp, whatsappValido } from "@/lib/nivelamento/pontuacao";

import { CabecalhoEtapa, Cartao } from "./comum";

type Campo =
  | "nome"
  | "whatsapp"
  | "email"
  | "genero"
  | "tipoTurma"
  | "horarios"
  | "consentimento";

function validar(perfil: Perfil) {
  const erros: Partial<Record<Campo, string>> = {};
  if (!perfil.nome.trim()) erros.nome = "Escreva seu nome.";
  if (!whatsappValido(perfil.whatsapp)) {
    erros.whatsapp = "Informe o WhatsApp com DDD, por exemplo (55) 99999-9999.";
  }
  if (perfil.email && !/^\S+@\S+\.\S+$/.test(perfil.email)) {
    erros.email = "Confira o e-mail ou deixe em branco.";
  }
  if (!perfil.genero) erros.genero = "Escolha uma opção.";
  if (!perfil.tipoTurma) {
    erros.tipoTurma = "Escolha o tipo de turma.";
  } else if (conflitoDeGenero(perfil)) {
    erros.tipoTurma =
      "Para montar uma turma só com pessoas do mesmo gênero, precisamos saber o seu. Se preferir não informar, tudo bem: escolha “Turma mista” ou “Tanto faz”.";
  }
  if (!perfil.horarios.length) {
    erros.horarios = "Marque pelo menos um horário.";
  }
  if (!perfil.consentimento) {
    erros.consentimento = "Precisamos da sua autorização para continuar.";
  }
  return erros;
}

function conflitoDeGenero(perfil: Perfil) {
  return (
    perfil.tipoTurma === "mesmo-genero" &&
    perfil.genero === "Prefiro não informar"
  );
}

function Rotulo({
  children,
  opcional,
}: {
  children: ReactNode;
  opcional?: boolean;
}) {
  return (
    <span className="text-[0.9375rem] font-semibold">
      {children}
      {opcional && (
        <span className="font-normal text-cocoa-soft"> (opcional)</span>
      )}
    </span>
  );
}

function Erro({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="text-sm font-medium text-rose-deep">
      {children}
    </p>
  );
}

export function Cadastro({
  perfil,
  onMudar,
  onConcluir,
}: {
  perfil: Perfil;
  onMudar: (perfil: Partial<Perfil>) => void;
  onConcluir: () => void;
}) {
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const erros = tentouEnviar ? validar(perfil) : {};
  // o aviso de gênero aparece assim que a combinação acontece
  if (!tentouEnviar && conflitoDeGenero(perfil)) {
    erros.tipoTurma = validar(perfil).tipoTurma;
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setTentouEnviar(true);
    const encontrados = validar(perfil);
    const primeiro = Object.keys(encontrados)[0];
    if (primeiro) {
      document
        .querySelector<HTMLElement>(`[data-campo="${primeiro}"]`)
        ?.focus();
      return;
    }
    onConcluir();
  }

  function alternarHorario(horario: string) {
    onMudar({
      horarios: perfil.horarios.includes(horario)
        ? perfil.horarios.filter((h) => h !== horario)
        : [...perfil.horarios, horario],
    });
  }

  return (
    <div className="flex flex-col gap-10">
      <CabecalhoEtapa
        kicker="Etapa 1 de 4 · sem tempo"
        titulo={
          <>
            Antes de tudo, <em>sobre você.</em>
          </>
        }
      />

      <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
        <Cartao className="flex flex-col gap-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <Rotulo>Nome</Rotulo>
              <input
                data-campo="nome"
                className="campo"
                value={perfil.nome}
                onChange={(e) => onMudar({ nome: e.target.value })}
                autoComplete="name"
                maxLength={120}
                required
                aria-invalid={!!erros.nome}
                aria-describedby={erros.nome ? "erro-nome" : undefined}
              />
              <Erro id="erro-nome">{erros.nome}</Erro>
            </label>
            <label className="flex flex-col gap-2">
              <Rotulo>WhatsApp com DDD</Rotulo>
              <input
                data-campo="whatsapp"
                className="campo"
                type="tel"
                inputMode="numeric"
                placeholder="(55) 99999-9999"
                value={perfil.whatsapp}
                onChange={(e) =>
                  onMudar({ whatsapp: mascararWhatsapp(e.target.value) })
                }
                autoComplete="tel-national"
                required
                aria-invalid={!!erros.whatsapp}
                aria-describedby={erros.whatsapp ? "erro-whatsapp" : undefined}
              />
              <Erro id="erro-whatsapp">{erros.whatsapp}</Erro>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <Rotulo opcional>E-mail</Rotulo>
            <input
              data-campo="email"
              className="campo"
              type="email"
              value={perfil.email}
              onChange={(e) => onMudar({ email: e.target.value })}
              autoComplete="email"
              maxLength={160}
              aria-invalid={!!erros.email}
              aria-describedby={erros.email ? "erro-email" : undefined}
            />
            <Erro id="erro-email">{erros.email}</Erro>
          </label>

          {/* Campo anti-robô: invisível para pessoas */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
            <label>
              Site
              <input
                tabIndex={-1}
                autoComplete="off"
                value={perfil.site}
                onChange={(e) => onMudar({ site: e.target.value })}
              />
            </label>
          </div>

          <fieldset
            className="flex flex-col gap-3"
            aria-describedby={erros.genero ? "erro-genero" : undefined}
          >
            <legend className="mb-3">
              <Rotulo>Gênero</Rotulo>
            </legend>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {GENEROS.map((genero, indice) => (
                <label key={genero} className="escolha">
                  <input
                    type="radio"
                    name="genero"
                    data-campo={indice === 0 ? "genero" : undefined}
                    className="size-4 accent-rose-deep"
                    checked={perfil.genero === genero}
                    onChange={() => onMudar({ genero })}
                  />
                  {genero}
                </label>
              ))}
            </div>
            <Erro id="erro-genero">{erros.genero}</Erro>
          </fieldset>

          <fieldset
            className="flex flex-col gap-3"
            aria-describedby="nota-tipo-turma"
          >
            <legend className="mb-3">
              <Rotulo>Tipo de turma</Rotulo>
            </legend>
            <div className="grid gap-2.5">
              {TIPOS_TURMA.map((tipo, indice) => (
                <label key={tipo.valor} className="escolha">
                  <input
                    type="radio"
                    name="tipoTurma"
                    data-campo={indice === 0 ? "tipoTurma" : undefined}
                    className="size-4 accent-rose-deep"
                    checked={perfil.tipoTurma === tipo.valor}
                    onChange={() => onMudar({ tipoTurma: tipo.valor })}
                  />
                  {tipo.rotulo}
                </label>
              ))}
            </div>
            <p id="nota-tipo-turma" className="text-sm text-cocoa-soft">
              Não muda o valor. Usamos só para montar as turmas.
            </p>
            <div aria-live="polite">
              <Erro id="erro-tipo-turma">{erros.tipoTurma}</Erro>
            </div>
          </fieldset>
        </Cartao>

        <Cartao className="flex flex-col gap-6">
          <label className="flex flex-col gap-2">
            <Rotulo>Plano de interesse</Rotulo>
            <select
              className="campo"
              value={perfil.plano}
              onChange={(e) => onMudar({ plano: e.target.value })}
            >
              {PLANOS.map((plano) => (
                <option key={plano.valor} value={plano.valor}>
                  {plano.rotulo}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <Rotulo>Objetivo principal</Rotulo>
              <select
                className="campo"
                value={perfil.objetivo}
                onChange={(e) => onMudar({ objetivo: e.target.value })}
              >
                <option value="">Escolha</option>
                {OBJETIVOS.map((objetivo) => (
                  <option key={objetivo}>{objetivo}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <Rotulo>Já estudou inglês?</Rotulo>
              <select
                className="campo"
                value={perfil.jaEstudou}
                onChange={(e) => onMudar({ jaEstudou: e.target.value })}
              >
                <option value="">Escolha</option>
                {JA_ESTUDOU.map((opcao) => (
                  <option key={opcao}>{opcao}</option>
                ))}
              </select>
            </label>
          </div>
        </Cartao>

        <Cartao className="flex flex-col gap-4">
          <div id="titulo-horarios">
            <Rotulo>Horários disponíveis</Rotulo>
            <p className="mt-1 text-sm text-cocoa-soft">
              Marque todos os horários em que você poderia ter aula.
            </p>
          </div>
          <table
            aria-labelledby="titulo-horarios"
            className="w-full table-fixed border-separate border-spacing-1"
          >
            <thead>
              <tr>
                <th className="w-[3.75rem]" />
                {DIAS.map((dia) => (
                  <th
                    key={dia}
                    scope="col"
                    className="text-xs font-bold tracking-wide text-cocoa-soft"
                  >
                    {dia}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TURNOS.map((turno, linha) => (
                <tr key={turno}>
                  <th
                    scope="row"
                    className="pr-1 text-left text-xs font-bold text-cocoa-soft capitalize"
                  >
                    {turno}
                  </th>
                  {DIAS.map((dia, coluna) => {
                    const horario = `${dia} ${turno}`;
                    return (
                      <td key={horario}>
                        <button
                          type="button"
                          data-campo={linha === 0 && coluna === 0 ? "horarios" : undefined}
                          className="horario"
                          aria-pressed={perfil.horarios.includes(horario)}
                          aria-label={horario}
                          onClick={() => alternarHorario(horario)}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <Erro id="erro-horarios">{erros.horarios}</Erro>
        </Cartao>

        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-start gap-3 text-[0.9375rem] leading-relaxed">
            <input
              type="checkbox"
              data-campo="consentimento"
              className="mt-1 size-4 shrink-0 accent-rose-deep"
              checked={perfil.consentimento}
              onChange={(e) => onMudar({ consentimento: e.target.checked })}
              aria-describedby={erros.consentimento ? "erro-consentimento" : undefined}
            />
            Autorizo a Teacher Thaís a usar meus dados para me contatar e montar
            turmas.
          </label>
          <Erro id="erro-consentimento">{erros.consentimento}</Erro>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-cocoa-soft">
            A partir da próxima etapa, o tempo começa a contar.
          </p>
          <button type="submit" className="cta">
            Ir para a gramática
            <ArrowRight className="size-4" strokeWidth={2.75} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
