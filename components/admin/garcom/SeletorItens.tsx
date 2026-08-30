"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";
import { formatPreco } from "@/lib/menu";
import type { Adicional, Categoria, Produto, Variacao } from "@/lib/cardapio";
import { itemTotal, type ItemSacola } from "@/lib/pedido-itens";

function Stepper({
  valor,
  min,
  max,
  onChange,
  label,
}: {
  valor: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label={`Diminuir ${label}`}
        disabled={valor <= min}
        onClick={() => onChange(valor - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-branco-creme font-display text-lg font-extrabold text-admin-navy ring-1 ring-admin-navy/15 enabled:hover:bg-admin-dourado-claro/50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
      >
        −
      </button>
      <span className="w-7 text-center font-display text-base font-extrabold tabular-nums text-admin-navy">
        {valor}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={valor >= max}
        onClick={() => onChange(valor + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-branco-creme font-display text-lg font-extrabold text-admin-navy ring-1 ring-admin-navy/15 enabled:hover:bg-admin-dourado-claro/50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
      >
        +
      </button>
    </div>
  );
}

function ProdutoModal({
  produto,
  onFechar,
  onAdicionar,
}: {
  produto: Produto;
  onFechar: () => void;
  onAdicionar: (item: ItemSacola) => void;
}) {
  const [variacao, setVariacao] = useState<Variacao | null>(produto.variacoes[0] ?? null);
  const [qtdAdicionais, setQtdAdicionais] = useState<Record<string, number>>({});
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState("");

  const total = useMemo(() => {
    const base = variacao?.preco ?? produto.preco;
    const extras = produto.adicionais.reduce(
      (soma, a) => soma + a.preco * (qtdAdicionais[a.id] ?? 0),
      0
    );
    return (base + extras) * quantidade;
  }, [produto, variacao, qtdAdicionais, quantidade]);

  function confirmar() {
    onAdicionar({
      key: `${produto.id}-${Date.now()}`,
      produtoId: produto.id,
      nome: produto.nome,
      variacao,
      adicionais: produto.adicionais
        .filter((a) => (qtdAdicionais[a.id] ?? 0) > 0)
        .map((a) => ({ id: a.id, nome: a.nome, preco: a.preco, quantidade: qtdAdicionais[a.id] })),
      quantidade,
      observacao: observacao.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-admin-navy/60 sm:items-center sm:p-4"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={produto.nome}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-[600px] flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-admin-navy/10 p-5">
          <div>
            <h2 className="font-display text-xl font-extrabold text-admin-navy">
              {produto.nome}
            </h2>
            {produto.descricao && (
              <p className="mt-1 text-sm text-admin-navy/70">{produto.descricao}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-branco-creme text-admin-navy ring-1 ring-admin-navy/15 hover:bg-admin-dourado-claro/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {produto.variacoes.length > 0 && (
            <fieldset>
              <legend className="font-display text-sm font-bold uppercase tracking-wide text-admin-navy/70">
                Versão
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {produto.variacoes.map((v) => (
                  <label
                    key={v.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-2xl px-4 py-3 ring-1 transition-colors ${
                      variacao?.id === v.id
                        ? "bg-admin-navy text-admin-branco-creme ring-admin-navy"
                        : "bg-admin-branco-creme text-admin-navy ring-admin-navy/15 hover:bg-admin-dourado-claro/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="variacao"
                      className="sr-only"
                      checked={variacao?.id === v.id}
                      onChange={() => setVariacao(v)}
                    />
                    <span className="font-bold">{v.nome}</span>
                    <span className="font-bold tabular-nums">{formatPreco(v.preco)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {produto.adicionais.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-admin-navy/70">
                Adicionais
              </h3>
              <ul className="mt-3 divide-y divide-admin-navy/10">
                {produto.adicionais.map((a: Adicional) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div>
                      <p className="font-semibold text-admin-navy">{a.nome}</p>
                      <p className="text-sm tabular-nums text-admin-navy/70">
                        + {formatPreco(a.preco)}
                      </p>
                    </div>
                    <Stepper
                      valor={qtdAdicionais[a.id] ?? 0}
                      min={0}
                      max={a.maxQtd}
                      label={a.nome}
                      onChange={(v) => setQtdAdicionais((prev) => ({ ...prev, [a.id]: v }))}
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label htmlFor="observacao" className="font-display text-sm font-bold uppercase tracking-wide text-admin-navy/70">
              Observação
            </label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Ex.: sem cebola, bem passado..."
              className="mt-2 w-full rounded-2xl border border-admin-navy/15 bg-admin-branco-creme/50 p-3 text-admin-navy placeholder:text-admin-navy/40 focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-admin-navy/70">
              Quantidade
            </span>
            <Stepper valor={quantidade} min={1} max={50} label="quantidade" onChange={setQuantidade} />
          </div>
        </div>

        <div className="border-t border-admin-navy/10 p-5">
          <button
            type="button"
            onClick={confirmar}
            className="flex min-h-13 w-full items-center justify-between rounded-full bg-admin-dourado px-6 py-4 font-bold text-admin-navy shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            <span>Adicionar</span>
            <span className="tabular-nums">{formatPreco(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SeletorItens({
  categorias,
  rotuloConfirmar,
  enviando,
  erro,
  onConfirmar,
  onVoltar,
}: {
  categorias: Categoria[];
  rotuloConfirmar: string;
  enviando: boolean;
  erro: string | null;
  onConfirmar: (itens: ItemSacola[]) => void;
  onVoltar?: () => void;
}) {
  const [categoriaAtiva, setCategoriaAtiva] = useState(categorias[0]?.id ?? "");
  const [produtoAberto, setProdutoAberto] = useState<Produto | null>(null);
  const [itens, setItens] = useState<ItemSacola[]>([]);

  const precoBase = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const cat of categorias) for (const p of cat.produtos) mapa.set(p.id, p.preco);
    return (produtoId: string) => mapa.get(produtoId) ?? 0;
  }, [categorias]);

  const total = itens.reduce((soma, item) => soma + itemTotal(item, precoBase(item.produtoId)), 0);
  const categoria = categorias.find((c) => c.id === categoriaAtiva) ?? categorias[0];

  return (
    <div className="pb-32">
      {onVoltar && (
        <button
          type="button"
          onClick={onVoltar}
          className="mb-2 min-h-9 rounded-full px-2 text-sm font-semibold text-admin-dourado-escuro hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
        >
          ← Voltar
        </button>
      )}

      <div
        role="tablist"
        aria-label="Categorias"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      >
        {categorias.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={categoria?.id === c.id}
            onClick={() => setCategoriaAtiva(c.id)}
            className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado ${
              categoria?.id === c.id
                ? "bg-admin-navy text-admin-dourado-claro"
                : "bg-white text-admin-navy ring-1 ring-admin-navy/15"
            }`}
          >
            {c.nome}
          </button>
        ))}
      </div>

      <ul className="mt-3 space-y-2">
        {categoria?.produtos.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              onClick={() => setProdutoAberto(p)}
              className="flex w-full min-h-11 items-center justify-between gap-3 rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-admin-navy/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
            >
              <span className="font-semibold text-admin-navy">{p.nome}</span>
              <span className="shrink-0 font-display font-bold tabular-nums text-admin-navy">
                {p.variacoes.length > 0
                  ? `${formatPreco(Math.min(...p.variacoes.map((v) => v.preco)))}+`
                  : formatPreco(p.preco)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {itens.length > 0 && (
        <div className="mt-5">
          <h2 className="font-display text-sm font-bold uppercase tracking-wide text-admin-navy/70">
            Itens desta rodada
          </h2>
          <ul className="mt-2 space-y-2">
            {itens.map((item) => (
              <li
                key={item.key}
                className="flex items-start justify-between gap-3 rounded-2xl bg-white p-3 ring-1 ring-admin-navy/10"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-admin-navy">
                    {item.quantidade}x {item.nome}
                    {item.variacao ? ` — ${item.variacao.nome}` : ""}
                  </p>
                  {item.adicionais.length > 0 && (
                    <p className="text-sm text-admin-navy/60">
                      {item.adicionais
                        .map((a) => (a.quantidade > 1 ? `${a.quantidade}x ${a.nome}` : a.nome))
                        .join(", ")}
                    </p>
                  )}
                  {item.observacao && (
                    <p className="text-sm italic text-admin-navy/60">“{item.observacao}”</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="font-display font-bold tabular-nums text-admin-navy">
                    {formatPreco(itemTotal(item, precoBase(item.produtoId)))}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remover ${item.nome}`}
                    onClick={() => setItens((prev) => prev.filter((i) => i.key !== item.key))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-vermelho-texto hover:bg-vermelho-texto/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
                  >
                    <X aria-hidden className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {produtoAberto && (
        <ProdutoModal
          produto={produtoAberto}
          onFechar={() => setProdutoAberto(null)}
          onAdicionar={(item) => {
            setItens((prev) => [...prev, item]);
            setProdutoAberto(null);
          }}
        />
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 bg-admin-branco-creme/95 p-4 backdrop-blur">
        <div className="mx-auto max-w-[600px]">
          {erro && (
            <p role="alert" className="mb-2 rounded-xl bg-vermelho-texto/10 p-3 text-sm font-semibold text-vermelho-texto">
              {erro}
            </p>
          )}
          <button
            type="button"
            disabled={itens.length === 0 || enviando}
            onClick={() => onConfirmar(itens)}
            className="flex min-h-13 w-full items-center justify-between rounded-full bg-admin-dourado px-6 py-4 font-bold text-admin-navy shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            <span>{enviando ? "Enviando..." : rotuloConfirmar}</span>
            <span className="tabular-nums">{formatPreco(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
