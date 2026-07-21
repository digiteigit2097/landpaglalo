"use client";

import { useState } from "react";
import { formatPreco } from "@/lib/menu";
import type { Categoria, OpcionalFlat, Produto } from "@/lib/cardapio";

const EMOJI_CATEGORIA: Record<string, string> = {
  Cheese: "🍔",
  "Hot Dog": "🌭",
  Bebidas: "🥤",
};

function variacaoAlternativa(produto: Produto) {
  if (produto.variacoes.length < 2) return null;
  return (
    produto.variacoes.find((v) => v.preco !== produto.preco) ??
    produto.variacoes[1]
  );
}

function ProdutoLinha({ produto }: { produto: Produto }) {
  const alt = variacaoAlternativa(produto);
  return (
    <li className="flex flex-col gap-1 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-marinho/10">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg font-bold leading-tight">
          {produto.nome}
        </h3>
        <span className="shrink-0 font-display text-lg font-bold tabular-nums text-vermelho-texto">
          {formatPreco(produto.preco)}
        </span>
      </div>
      {alt && (
        <span className="text-sm font-semibold tabular-nums text-marinho/70">
          {alt.nome}: {formatPreco(alt.preco)}
        </span>
      )}
      {produto.descricao && (
        <p className="text-sm text-marinho/70">{produto.descricao}</p>
      )}
    </li>
  );
}

function ListaSimples({ produtos }: { produtos: Produto[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {produtos.map((p) => (
        <ProdutoLinha key={p.id} produto={p} />
      ))}
    </ul>
  );
}

function ListaOpcionais({ itens }: { itens: OpcionalFlat[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {itens.map((item) => (
        <li
          key={item.id}
          className="flex items-baseline justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-marinho/10"
        >
          <h3 className="font-display text-lg font-bold leading-tight">
            {item.nome}
          </h3>
          <span className="shrink-0 font-display text-lg font-bold tabular-nums text-vermelho-texto">
            {formatPreco(item.preco)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ListaCheese({ produtos }: { produtos: Produto[] }) {
  return (
    <div className="grid gap-3">
      <div className="hidden items-center justify-end gap-6 pr-4 text-sm font-semibold uppercase tracking-wide text-marinho/70 sm:flex">
        <span className="w-24 text-right">Normal</span>
        <span className="w-24 text-right">Artesanal</span>
      </div>
      {produtos.map((p) => {
        const normal = p.variacoes.find((v) => v.nome === "Normal") ?? {
          nome: "Normal",
          preco: p.preco,
        };
        const artesanal = p.variacoes.find((v) => v.nome !== "Normal") ?? {
          nome: "Artesanal",
          preco: p.preco,
        };
        return (
          <div
            key={p.id}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-marinho/10"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="font-display text-lg font-bold leading-tight">
                  {p.nome}
                </h3>
                {p.descricao && (
                  <p className="mt-1 text-sm text-marinho/70">
                    {p.descricao}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:gap-6 sm:pr-0">
                <div className="rounded-xl bg-creme px-3 py-2 text-center sm:w-24 sm:bg-transparent sm:p-0 sm:text-right">
                  <span className="block text-[11px] font-semibold uppercase text-marinho/70 sm:hidden">
                    Normal
                  </span>
                  <span className="font-display text-lg font-bold tabular-nums text-marinho">
                    {formatPreco(normal.preco)}
                  </span>
                </div>
                <div className="rounded-xl bg-amarelo/40 px-3 py-2 text-center sm:w-24 sm:bg-transparent sm:p-0 sm:text-right">
                  <span className="block text-[11px] font-semibold uppercase text-marinho/70 sm:hidden">
                    Artesanal
                  </span>
                  <span className="font-display text-lg font-bold tabular-nums text-vermelho-texto">
                    {formatPreco(artesanal.preco)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Cardapio({
  categorias,
  opcionais,
}: {
  categorias: Categoria[];
  opcionais: OpcionalFlat[];
}) {
  const tabs = [
    ...categorias.map((c) => ({
      id: c.id,
      label: `${EMOJI_CATEGORIA[c.nome] ?? "🍽️"} ${c.nome}`,
    })),
    { id: "opcionais", label: "➕ Opcionais" },
  ];
  const [tab, setTab] = useState<string>(tabs[0]?.id ?? "opcionais");
  const categoriaAtiva = categorias.find((c) => c.id === tab);

  return (
    <section id="cardapio" className="scroll-mt-20 bg-creme py-14 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center">
          <span className="inline-block rounded-full bg-vermelho-texto px-4 py-1 font-display text-sm font-bold uppercase tracking-wide text-creme">
            Cardápio
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">
            Escolha o seu favorito
          </h2>
          <p className="mt-2 text-marinho/70">
            Cheese em versão normal ou artesanal, dogão do jeito que você gosta
          </p>
        </div>

        {/* Abas */}
        <div
          role="tablist"
          aria-label="Categorias do cardápio"
          className="sticky top-16 z-30 mt-8 -mx-4 flex gap-2 overflow-x-auto bg-creme/95 px-4 py-3 backdrop-blur sm:justify-center"
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto focus-visible:ring-offset-2 focus-visible:ring-offset-creme ${
                tab === t.id
                  ? "bg-marinho text-amarelo shadow-md"
                  : "bg-white text-marinho ring-1 ring-marinho/15 hover:bg-amarelo/40"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "opcionais" ? (
            <ListaOpcionais itens={opcionais} />
          ) : categoriaAtiva?.nome === "Cheese" ? (
            <ListaCheese produtos={categoriaAtiva.produtos} />
          ) : (
            <ListaSimples produtos={categoriaAtiva?.produtos ?? []} />
          )}
        </div>
      </div>
    </section>
  );
}
