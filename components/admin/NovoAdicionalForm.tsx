"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarAdicional, type EstadoAcao } from "@/app/admin/(painel)/catalogo/actions";

const inicial: EstadoAcao = {};

export default function NovoAdicionalForm() {
  const [estado, formAction, pendente] = useActionState(criarAdicional, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) formRef.current?.reset();
  }, [estado.sucesso]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
    >
      <div className="flex-1 min-w-[160px]">
        <label className="text-sm font-semibold text-admin-navy/70">
          Nome do adicional
        </label>
        <input
          name="nome"
          required
          placeholder="Ex.: Cheddar"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Preço
        </label>
        <input
          name="preco"
          type="number"
          step="0.01"
          min="0"
          required
          className="mt-1 w-28 min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <button
        type="submit"
        disabled={pendente}
        className="min-h-11 rounded-full bg-admin-dourado px-5 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
      >
        {pendente ? "Criando..." : "Adicionar"}
      </button>
      {estado.erro && (
        <p role="alert" className="w-full text-sm font-semibold text-vermelho-texto">
          {estado.erro}
        </p>
      )}
    </form>
  );
}
