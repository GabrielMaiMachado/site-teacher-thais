import { Clock } from "lucide-react";

import { formatarTempo } from "@/lib/nivelamento/pontuacao";

export function BarraTempo({
  rotulo,
  restante,
  total,
}: {
  rotulo: string;
  restante: number;
  total: number;
}) {
  // âmbar nos últimos 15% do tempo
  const acabando = restante <= total * 0.15;
  const porcentagem = Math.max(0, Math.min(100, (100 * restante) / total));

  return (
    <div className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream-soft/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 pt-3 pb-2.5">
        <span className="kicker">{rotulo}</span>
        <span
          role="timer"
          aria-label={`Tempo restante: ${formatarTempo(restante)}`}
          className={`flex items-center gap-2 font-mono text-xl font-bold tabular-nums transition-colors ${
            acabando ? "text-amber-700" : "text-cocoa"
          }`}
        >
          <Clock className="size-4" strokeWidth={2.5} aria-hidden="true" />
          {formatarTempo(restante)}
        </span>
      </div>
      <div className="h-1 bg-cocoa/10" aria-hidden="true">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none ${
            acabando ? "bg-amber-500" : "bg-rose-deep"
          }`}
          style={{ width: `${porcentagem}%` }}
        />
      </div>
    </div>
  );
}
