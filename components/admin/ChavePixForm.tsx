"use client";

import { useActionState } from "react";
import { salvarChavePix, type EstadoAcao } from "@/app/admin/(painel)/cardapio-impresso/actions";

const inicial: EstadoAcao = {};

export default function ChavePixForm({ chaveAtual }: { chaveAtual: string }) {
  const [estado, formAction, pendente] = useActionState(salvarChavePix, inicial);

  return (
    <form
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10 print:hidden"
    >
      <div className="flex-1 min-w-[220px]">
        <label className="text-sm font-semibold text-admin-navy/70">
          Chave PIX (CPF, CNPJ, telefone, e-mail ou aleatória)
        </label>
        <input
          name="chave_pix"
          defaultValue={chaveAtual}
          placeholder="Ex.: 04459252996"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <button
        type="submit"
        disabled={pendente}
        className="min-h-11 rounded-full bg-admin-navy px-5 font-bold text-admin-branco-creme transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
      >
        {pendente ? "Salvando..." : "Salvar chave PIX"}
      </button>
      {estado.erro && (
        <p role="alert" className="w-full text-sm font-semibold text-vermelho-texto">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="w-full text-sm font-semibold text-green-700">
          Chave salva! QR do PIX atualizado abaixo.
        </p>
      )}
    </form>
  );
}
