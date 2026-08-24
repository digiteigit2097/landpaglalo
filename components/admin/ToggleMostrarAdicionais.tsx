"use client";

import { useTransition } from "react";
import { alternarMostrarAdicionaisProduto } from "@/app/admin/(painel)/catalogo/actions";

export default function ToggleMostrarAdicionais({
  produtoId,
  mostrarAdicionais,
}: {
  produtoId: string;
  mostrarAdicionais: boolean;
}) {
  const [pendente, startTransition] = useTransition();

  function alternar() {
    const novo = !mostrarAdicionais;
    startTransition(() => {
      alternarMostrarAdicionaisProduto(produtoId, novo);
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mostrarAdicionais}
      disabled={pendente}
      onClick={alternar}
      className="flex min-h-9 items-center gap-2 text-sm font-semibold text-admin-navy/70 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado rounded-full"
    >
      Mostrar adicionais
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
          mostrarAdicionais ? "bg-admin-dourado justify-end" : "bg-admin-navy/15 justify-start"
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
