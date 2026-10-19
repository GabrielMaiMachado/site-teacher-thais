import type { Metadata } from "next";
import Link from "next/link";

import { CarregarTeste } from "@/components/nivelamento/CarregarTeste";

export const metadata: Metadata = {
  title: "Teste de nivelamento · Learn with Teacher Thaís",
  description:
    "Descubra seu nível de inglês em cerca de 30 minutos e encontre sua turma de até 4 pessoas com a Teacher Thaís.",
};

export default function NivelamentoPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="px-5 pt-6">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="font-serif text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-deep"
          >
            Learn with <span className="text-rose-deep italic">Teacher Thaís</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <CarregarTeste />
      </main>
    </div>
  );
}
