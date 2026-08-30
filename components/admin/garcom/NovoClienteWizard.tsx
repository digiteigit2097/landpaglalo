"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Categoria } from "@/lib/cardapio";
import { paraPayloadCriarPedido, type ItemSacola } from "@/lib/pedido-itens";
import { abrirNovoAtendimento } from "@/app/admin/(garcom)/atendimento/actions";
import SeletorItens from "@/components/admin/garcom/SeletorItens";

export default function NovoClienteWizard({ categorias }: { categorias: Categoria[] }) {
  const router = useRouter();
  const [etapa, setEtapa] = useState<"nome" | "itens">("nome");
  const [nome, setNome] = useState("");
  const [erroNome, setErroNome] = useState<string | null>(null);
  const [erroItens, setErroItens] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function continuar() {
    if (nome.trim().length < 2) {
      setErroNome("Digite o nome do cliente.");
      return;
    }
    setErroNome(null);
    setEtapa("itens");
  }

  async function confirmar(itens: ItemSacola[]) {
    setEnviando(true);
    setErroItens(null);
    const resultado = await abrirNovoAtendimento(nome.trim(), paraPayloadCriarPedido(itens));
    setEnviando(false);
    if (resultado.erro) {
      setErroItens(resultado.erro);
      return;
    }
    router.push(`/admin/atendimento/${resultado.telefone}`);
  }

  if (etapa === "nome") {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold text-admin-navy">
          Novo cliente
        </h1>
        <p className="mt-1 text-admin-navy/70">Só o nome — sem precisar de telefone.</p>

        <div className="mt-6">
          <label htmlFor="nome-cliente" className="text-sm font-semibold text-admin-navy/70">
            Nome do cliente
          </label>
          <input
            id="nome-cliente"
            type="text"
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && continuar()}
            placeholder="Ex.: João, Mesa 4..."
            className="mt-2 w-full min-h-13 rounded-2xl border border-admin-navy/15 bg-white px-4 py-3 text-lg text-admin-navy placeholder:text-admin-navy/40 focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          />
          {erroNome && (
            <p role="alert" className="mt-2 text-sm font-semibold text-vermelho-texto">
              {erroNome}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={continuar}
          className="mt-6 min-h-13 w-full rounded-full bg-admin-dourado px-6 font-bold text-admin-navy shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
        >
          Continuar
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">{nome}</h1>
      <p className="mt-1 text-admin-navy/70">Toca no produto pra montar o pedido.</p>
      <div className="mt-4">
        <SeletorItens
          categorias={categorias}
          rotuloConfirmar="Abrir conta"
          enviando={enviando}
          erro={erroItens}
          onConfirmar={confirmar}
          onVoltar={() => setEtapa("nome")}
        />
      </div>
    </div>
  );
}
