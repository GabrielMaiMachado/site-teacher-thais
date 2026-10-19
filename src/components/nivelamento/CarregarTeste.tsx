"use client";

import dynamic from "next/dynamic";

// O teste vive no localStorage e na URL do navegador, então só roda no cliente.
const TesteNivelamento = dynamic(() => import("./TesteNivelamento"), {
  ssr: false,
  loading: () => (
    <p className="mx-auto max-w-2xl px-5 pt-14 text-cocoa-soft" role="status">
      Carregando o teste…
    </p>
  ),
});

export function CarregarTeste() {
  return <TesteNivelamento />;
}
