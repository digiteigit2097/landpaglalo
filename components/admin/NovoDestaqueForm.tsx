"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarDestaque, type EstadoAcao } from "@/app/admin/(painel)/catalogo/actions";

const inicial: EstadoAcao = {};

export default function NovoDestaqueForm({
  produtos,
}: {
  produtos: { id: string; nome: string }[];
}) {
  const [estado, formAction, pendente] = useActionState(criarDestaque, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) formRef.current?.reset();
  }, [estado.sucesso]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10 sm:grid-cols-3"
    >
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Produto
        </label>
        <select
          name="produto_id"
          required
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        >
          <option value="">Escolha...</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Selo
        </label>
        <input
          name="tag"
          required
          placeholder="Ex.: O favorito"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Descrição
        </label>
        <input
          name="descricao"
          required
          placeholder="Frase curta de destaque"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>

      {estado.erro && (
        <p role="alert" className="sm:col-span-3 text-sm font-semibold text-vermelho-texto">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="sm:col-span-3 min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.01] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
      >
        {pendente ? "Criando..." : "Adicionar destaque"}
      </button>
    </form>
  );
}
