import { ArrowRight, Headphones, NotebookPen, PenLine, UserRound } from "lucide-react";

import { CabecalhoEtapa } from "./comum";

const etapas = [
  {
    icone: UserRound,
    tempo: "2 min",
    titulo: "Sobre você",
    texto: "Seus dados, seu objetivo e os horários em que você pode ter aula.",
  },
  {
    icone: NotebookPen,
    tempo: "12 min",
    titulo: "Gramática e vocabulário",
    texto: "Fica mais difícil aos poucos e termina antes se ficar pesado.",
  },
  {
    icone: Headphones,
    tempo: "8 min",
    titulo: "Escuta",
    texto: "Áudios curtos. Cada um toca no máximo 2 vezes.",
  },
  {
    icone: PenLine,
    tempo: "10 min",
    titulo: "Escrita",
    texto: "Um texto curto, que a Teacher Thaís lê com carinho.",
  },
];

export function Intro({
  demo,
  onComecar,
}: {
  demo: boolean;
  onComecar: () => void;
}) {
  return (
    <div className="flex flex-col gap-10">
      <CabecalhoEtapa
        kicker="Teste de nivelamento"
        titulo={
          <>
            Descubra seu nível e encontre <em>sua turma.</em>
          </>
        }
        texto="As turmas têm até 4 pessoas do mesmo nível. Este teste leva cerca de 30 minutos e ajuda a te colocar com quem está no mesmo momento que você."
      />

      <ol className="grid gap-3 sm:grid-cols-2">
        {etapas.map(({ icone: Icone, tempo, titulo, texto }, indice) => (
          <li
            key={titulo}
            className="rounded-[1.75rem] border bg-white/80 p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-full bg-cream text-rose-deep">
                <Icone className="size-[1.125rem]" strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="text-xs font-bold tracking-widest text-rose-deep">
                {indice === 0 ? "sem tempo" : tempo}
              </span>
            </div>
            <h2 className="mt-5 text-xl tracking-tight">{titulo}</h2>
            <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-cocoa-soft">
              {texto}
            </p>
          </li>
        ))}
      </ol>

      <div className="border-l-2 border-blush pl-6">
        <p className="font-serif text-xl leading-snug">
          Um pedido com carinho:{" "}
          <span className="text-rose-deep italic">
            não use tradutor nem dicionário.
          </span>
        </p>
        <p className="mt-3 leading-relaxed text-cocoa-soft">
          Não tem problema errar. Se o resultado ficar acima do seu nível, você
          cai numa turma que não te ajuda. Separe um lugar tranquilo e, se puder,
          use fones de ouvido. Cada etapa tem um tempo e o relógio não pausa.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {demo ? (
          <span className="rounded-full bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800">
            Modo demonstração: tempos divididos por 6
          </span>
        ) : (
          <span />
        )}
        <button type="button" onClick={onComecar} className="cta">
          Começar
          <ArrowRight className="size-4" strokeWidth={2.75} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
