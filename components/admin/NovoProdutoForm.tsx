"use client";

import { useActionState, useRef, useEffect } from "react";
import { criarProduto, type EstadoAcao } from "@/app/admin/(painel)/catalogo/actions";

const inicial: EstadoAcao = {};

export default function NovoProdutoForm({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [estado, formAction, pendente] = useActionState(criarProduto, inicial);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) formRef.current?.reset();
  }, [estado.sucesso]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10 sm:grid-cols-4"
    >
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Categoria
        </label>
        <select
          name="categoria_id"
          required
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        >
          <option value="">Escolha...</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Nome do produto
        </label>
        <input
          name="nome"
          required
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
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-admin-navy/70">
          Descrição
        </label>
        <input
          name="descricao"
          placeholder="Opcional"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>

      {estado.erro && (
        <p role="alert" className="sm:col-span-4 text-sm font-semibold text-vermelho-texto">
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="sm:col-span-4 min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.01] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
      >
        {pendente ? "Criando..." : "Adicionar produto"}
      </button>
    </form>
  );
}
