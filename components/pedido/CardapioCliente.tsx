"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { supabaseAnon } from "@/lib/supabase";
import { formatPreco } from "@/lib/menu";
import type { Adicional, Categoria, Produto, Variacao } from "@/lib/cardapio";

const CLIENTE_KEY = "dogao-cliente";
const SACOLA_KEY = "dogao-sacola";

type Cliente = { nome: string; telefone: string };

type ItemSacola = {
  key: string;
  produtoId: string;
  nome: string;
  variacao: Variacao | null;
  adicionais: { id: string; nome: string; preco: number; quantidade: number }[];
  quantidade: number;
  observacao: string;
};

function precoUnitario(item: ItemSacola, base: number) {
  const variacao = item.variacao?.preco ?? base;
  const extras = item.adicionais.reduce(
    (soma, a) => soma + a.preco * a.quantidade,
    0
  );
  return variacao + extras;
}

function itemTotal(item: ItemSacola, base: number) {
  return precoUnitario(item, base) * item.quantidade;
}

function telefoneValido(telefone: string) {
  return telefone.replace(/\D/g, "").length >= 10;
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

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
        className="flex h-11 w-11 items-center justify-center rounded-full bg-creme font-display text-xl font-extrabold text-marinho ring-1 ring-marinho/15 transition-colors enabled:hover:bg-amarelo/50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
      >
        −
      </button>
      <span className="w-8 text-center font-display text-lg font-extrabold tabular-nums">
        {valor}
      </span>
      <button
        type="button"
        aria-label={`Aumentar ${label}`}
        disabled={valor >= max}
        onClick={() => onChange(valor + 1)}
        className="flex h-11 w-11 items-center justify-center rounded-full bg-creme font-display text-xl font-extrabold text-marinho ring-1 ring-marinho/15 transition-colors enabled:hover:bg-amarelo/50 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
      >
        +
      </button>
    </div>
  );
}

function IdentificacaoModal({
  onConfirmar,
}: {
  onConfirmar: (cliente: Cliente) => void;
}) {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function confirmar() {
    const nomeLimpo = nome.trim();
    if (nomeLimpo.length < 2) {
      setErro("Digita seu nome completo aí.");
      return;
    }
    if (!telefoneValido(telefone)) {
      setErro("Digita um telefone válido com DDD.");
      return;
    }
    onConfirmar({ nome: nomeLimpo, telefone });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-marinho/70 backdrop-blur-sm sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Identificação"
        className="w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
      >
        <div className="flex flex-col items-center text-center">
          <Image src="/brand/mascote.png" alt="" width={96} height={96} />
          <h2 className="mt-2 font-display text-2xl font-extrabold text-marinho">
            Antes de pedir...
          </h2>
          <p className="mt-1 text-marinho/70">
            Como podemos te chamar quando o pedido estiver pronto?
          </p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="nome" className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70">
              Seu nome
            </label>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex.: Maria Silva"
              className="mt-2 w-full min-h-11 rounded-2xl border border-marinho/15 bg-creme/50 px-4 py-3 text-marinho placeholder:text-marinho/40 focus:border-marinho focus:outline-none focus:ring-2 focus:ring-marinho/30"
            />
          </div>
          <div>
            <label htmlFor="telefone" className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70">
              WhatsApp / telefone
            </label>
            <input
              id="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="(43) 99999-9999"
              className="mt-2 w-full min-h-11 rounded-2xl border border-marinho/15 bg-creme/50 px-4 py-3 text-marinho placeholder:text-marinho/40 focus:border-marinho focus:outline-none focus:ring-2 focus:ring-marinho/30"
            />
          </div>
          {erro && (
            <p role="alert" className="text-sm font-semibold text-vermelho-texto">
              {erro}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={confirmar}
          className="mt-6 flex min-h-13 w-full items-center justify-center rounded-full bg-vermelho-texto px-6 py-4 font-display text-lg font-extrabold text-creme shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marinho focus-visible:ring-offset-2"
        >
          Ver cardápio
        </button>
      </div>
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
  const [variacao, setVariacao] = useState<Variacao | null>(
    produto.variacoes[0] ?? null
  );
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
        .map((a) => ({
          id: a.id,
          nome: a.nome,
          preco: a.preco,
          quantidade: qtdAdicionais[a.id],
        })),
      quantidade,
      observacao: observacao.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-marinho/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={produto.nome}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-marinho/10 p-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-marinho">
              {produto.nome}
            </h2>
            {produto.descricao && (
              <p className="mt-1 text-sm text-marinho/70">{produto.descricao}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onFechar}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-creme text-marinho ring-1 ring-marinho/15 hover:bg-amarelo/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          {produto.variacoes.length > 0 && (
            <fieldset>
              <legend className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70">
                Escolha a versão
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {produto.variacoes.map((v) => (
                  <label
                    key={v.id}
                    className={`flex min-h-11 cursor-pointer items-center justify-between gap-2 rounded-2xl px-4 py-3 ring-1 transition-colors ${
                      variacao?.id === v.id
                        ? "bg-marinho text-creme ring-marinho"
                        : "bg-creme text-marinho ring-marinho/15 hover:bg-amarelo/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="variacao"
                      className="sr-only"
                      checked={variacao?.id === v.id}
                      onChange={() => setVariacao(v)}
                    />
                    <span className="font-display font-bold">{v.nome}</span>
                    <span className="font-display font-bold tabular-nums">
                      {formatPreco(v.preco)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {produto.adicionais.length > 0 && (
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70">
                Adicionais
              </h3>
              <ul className="mt-3 divide-y divide-marinho/10">
                {produto.adicionais.map((a: Adicional) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="font-semibold text-marinho">{a.nome}</p>
                      <p className="text-sm tabular-nums text-marinho/70">
                        + {formatPreco(a.preco)}
                      </p>
                    </div>
                    <Stepper
                      valor={qtdAdicionais[a.id] ?? 0}
                      min={0}
                      max={a.maxQtd}
                      label={a.nome}
                      onChange={(v) =>
                        setQtdAdicionais((prev) => ({ ...prev, [a.id]: v }))
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label
              htmlFor="observacao"
              className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70"
            >
              Observação
            </label>
            <textarea
              id="observacao"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              maxLength={200}
              rows={2}
              placeholder="Ex.: sem cebola, bem passado..."
              className="mt-2 w-full rounded-2xl border border-marinho/15 bg-creme/50 p-3 text-marinho placeholder:text-marinho/40 focus:border-marinho focus:outline-none focus:ring-2 focus:ring-marinho/30"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-display text-sm font-bold uppercase tracking-wide text-marinho/70">
              Quantidade
            </span>
            <Stepper
              valor={quantidade}
              min={1}
              max={50}
              label="quantidade"
              onChange={setQuantidade}
            />
          </div>
        </div>

        <div className="border-t border-marinho/10 p-5">
          <button
            type="button"
            onClick={confirmar}
            className="flex min-h-13 w-full items-center justify-between rounded-full bg-vermelho-texto px-6 py-4 font-display text-lg font-extrabold text-creme shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marinho focus-visible:ring-offset-2"
          >
            <span>Adicionar à sacola</span>
            <span className="tabular-nums">{formatPreco(total)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SacolaSheet({
  itens,
  catalogoPreco,
  enviando,
  erro,
  onFechar,
  onRemover,
  onQuantidade,
  onEnviar,
}: {
  itens: ItemSacola[];
  catalogoPreco: (produtoId: string) => number;
  enviando: boolean;
  erro: string | null;
  onFechar: () => void;
  onRemover: (key: string) => void;
  onQuantidade: (key: string, qtd: number) => void;
  onEnviar: () => void;
}) {
  const total = itens.reduce(
    (soma, item) => soma + itemTotal(item, catalogoPreco(item.produtoId)),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-marinho/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onFechar}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-marinho/10 p-5">
          <h2 className="font-display text-2xl font-extrabold text-marinho">
            Sua sacola
          </h2>
          <button
            type="button"
            aria-label="Fechar sacola"
            onClick={onFechar}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-creme text-marinho ring-1 ring-marinho/15 hover:bg-amarelo/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {itens.length === 0 ? (
            <p className="py-8 text-center text-marinho/70">
              Sua sacola está vazia. Escolhe um dogão aí! 🌭
            </p>
          ) : (
            <ul className="space-y-4">
              {itens.map((item) => (
                <li
                  key={item.key}
                  className="rounded-2xl bg-creme/60 p-4 ring-1 ring-marinho/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display font-extrabold text-marinho">
                        {item.nome}
                        {item.variacao ? ` — ${item.variacao.nome}` : ""}
                      </p>
                      {item.adicionais.length > 0 && (
                        <p className="mt-0.5 text-sm text-marinho/70">
                          {item.adicionais
                            .map((a) =>
                              a.quantidade > 1
                                ? `${a.quantidade}x ${a.nome}`
                                : a.nome
                            )
                            .join(", ")}
                        </p>
                      )}
                      {item.observacao && (
                        <p className="mt-0.5 text-sm italic text-marinho/70">
                          “{item.observacao}”
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 font-display font-extrabold tabular-nums text-vermelho-texto">
                      {formatPreco(
                        itemTotal(item, catalogoPreco(item.produtoId))
                      )}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <Stepper
                      valor={item.quantidade}
                      min={1}
                      max={50}
                      label={`quantidade de ${item.nome}`}
                      onChange={(v) => onQuantidade(item.key, v)}
                    />
                    <button
                      type="button"
                      onClick={() => onRemover(item.key)}
                      className="min-h-11 rounded-full px-3 font-display text-sm font-bold text-vermelho-texto hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-3 border-t border-marinho/10 p-5">
          {erro && (
            <p role="alert" className="rounded-2xl bg-vermelho-texto/10 p-3 text-sm font-semibold text-vermelho-texto">
              {erro}
            </p>
          )}
          <div className="flex items-center justify-between font-display text-lg font-extrabold text-marinho">
            <span>Total</span>
            <span className="tabular-nums">{formatPreco(total)}</span>
          </div>
          <button
            type="button"
            disabled={itens.length === 0 || enviando}
            onClick={onEnviar}
            className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-vermelho-texto px-6 py-4 font-display text-lg font-extrabold text-creme shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marinho focus-visible:ring-offset-2"
          >
            {enviando ? "Enviando pedido..." : "Fazer pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CardapioCliente({
  categorias,
  opcionais,
}: {
  categorias: Categoria[];
  opcionais: { id: string; nome: string; preco: number }[];
}) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [carregouCliente, setCarregouCliente] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState(categorias[0]?.id ?? "");
  const [produtoAberto, setProdutoAberto] = useState<Produto | null>(null);
  const [sacolaAberta, setSacolaAberta] = useState(false);
  const [itens, setItens] = useState<ItemSacola[]>([]);
  const [carregouSacola, setCarregouSacola] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoFeito, setPedidoFeito] = useState<{ id: number; total: number } | null>(null);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(CLIENTE_KEY);
      if (salvo) setCliente(JSON.parse(salvo));
    } catch {
      // ignora cache corrompido
    }
    setCarregouCliente(true);
  }, []);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem(SACOLA_KEY);
      if (salvo) setItens(JSON.parse(salvo));
    } catch {
      // sacola corrompida: começa vazia
    }
    setCarregouSacola(true);
  }, []);

  useEffect(() => {
    if (carregouSacola) {
      localStorage.setItem(SACOLA_KEY, JSON.stringify(itens));
    }
  }, [itens, carregouSacola]);

  const precoBase = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const cat of categorias)
      for (const p of cat.produtos) mapa.set(p.id, p.preco);
    return (produtoId: string) => mapa.get(produtoId) ?? 0;
  }, [categorias]);

  const totalSacola = itens.reduce(
    (soma, item) => soma + itemTotal(item, precoBase(item.produtoId)),
    0
  );
  const qtdSacola = itens.reduce((soma, item) => soma + item.quantidade, 0);

  function confirmarIdentificacao(novoCliente: Cliente) {
    localStorage.setItem(CLIENTE_KEY, JSON.stringify(novoCliente));
    setCliente(novoCliente);
  }

  async function enviarPedido() {
    if (!cliente) return;
    setEnviando(true);
    setErro(null);
    try {
      const supabase = supabaseAnon();
      const { data, error } = await supabase.rpc("criar_pedido", {
        p_cliente_nome: cliente.nome,
        p_cliente_telefone: cliente.telefone,
        p_itens: itens.map((item) => ({
          produto_id: item.produtoId,
          variacao_id: item.variacao?.id ?? null,
          quantidade: item.quantidade,
          observacao: item.observacao || null,
          adicionais: item.adicionais.map((a) => ({
            adicional_id: a.id,
            quantidade: a.quantidade,
          })),
        })),
      });
      if (error) throw error;
      setItens([]);
      localStorage.removeItem(SACOLA_KEY);
      setSacolaAberta(false);
      setPedidoFeito({ id: data.pedido_id, total: Number(data.total) });
    } catch {
      setErro(
        "Não conseguimos enviar seu pedido. Tenta de novo ou chama alguém da equipe."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!carregouCliente) {
    return <div className="min-h-dvh bg-creme" />;
  }

  if (!cliente) {
    return <IdentificacaoModal onConfirmar={confirmarIdentificacao} />;
  }

  if (pedidoFeito) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-marinho px-6 text-center text-creme">
        <Image src="/brand/mascote.png" alt="" width={180} height={180} />
        <h1 className="font-display text-3xl font-extrabold">
          Pedido nº {pedidoFeito.id} enviado!
        </h1>
        <p className="max-w-sm text-lg text-creme/85">
          Total de{" "}
          <strong className="tabular-nums text-amarelo">
            {formatPreco(pedidoFeito.total)}
          </strong>
          . Fica de olho: já vamos chamar{" "}
          <strong className="text-amarelo">{cliente.nome}</strong> no balcão
          assim que estiver pronto! 🌭
        </p>
        <button
          type="button"
          onClick={() => setPedidoFeito(null)}
          className="mt-2 min-h-13 rounded-full bg-amarelo px-8 py-4 font-display text-lg font-extrabold text-marinho shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-marinho"
        >
          Pedir mais alguma coisa
        </button>
      </main>
    );
  }

  const categoria = categorias.find((c) => c.id === categoriaAtiva) ?? categorias[0];

  return (
    <div className="min-h-dvh bg-creme pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marinho shadow-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Image
            src="/brand/logo-principal.png"
            alt="Dogão do Lalo"
            width={160}
            height={120}
            className="h-12 w-auto rounded-lg"
            priority
          />
          <span className="max-w-[45%] truncate rounded-full bg-amarelo px-4 py-2 font-display text-sm font-extrabold text-marinho">
            Oi, {cliente.nome.split(" ")[0]}!
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        <h1 className="mt-6 text-center font-display text-3xl font-extrabold text-marinho">
          O que vai ser hoje?
        </h1>
        <p className="mt-1 text-center text-marinho/70">
          Toca no produto pra escolher adicionais e mandar pra cozinha
        </p>

        {/* Abas de categoria */}
        <div
          role="tablist"
          aria-label="Categorias"
          className="sticky top-16 z-30 -mx-4 mt-5 flex gap-2 overflow-x-auto bg-creme/95 px-4 py-3 backdrop-blur"
        >
          {categorias.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={categoria?.id === c.id}
              onClick={() => setCategoriaAtiva(c.id)}
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 py-2.5 font-display text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto focus-visible:ring-offset-2 focus-visible:ring-offset-creme ${
                categoria?.id === c.id
                  ? "bg-marinho text-amarelo shadow-md"
                  : "bg-white text-marinho ring-1 ring-marinho/15 hover:bg-amarelo/40"
              }`}
            >
              {c.nome}
            </button>
          ))}
        </div>

        {/* Produtos */}
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {categoria?.produtos.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setProdutoAberto(p)}
                className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-marinho/10 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-lg font-bold leading-tight text-marinho">
                    {p.nome}
                  </h3>
                  <span className="shrink-0 font-display text-lg font-bold tabular-nums text-vermelho-texto">
                    {p.variacoes.length > 0
                      ? `${formatPreco(Math.min(...p.variacoes.map((v) => v.preco)))}+`
                      : formatPreco(p.preco)}
                  </span>
                </div>
                {p.descricao && (
                  <p className="mt-1 text-sm text-marinho/70">{p.descricao}</p>
                )}
                <span className="mt-2 inline-block font-display text-sm font-bold text-azul">
                  Personalizar e adicionar →
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>

      {/* Barra da sacola */}
      {itens.length > 0 && (
        <button
          type="button"
          onClick={() => setSacolaAberta(true)}
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-3xl min-h-13 items-center justify-between rounded-full bg-marinho px-6 py-4 font-display text-lg font-extrabold text-creme shadow-2xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amarelo/80"
        >
          <span>
            Sacola{" "}
            <span className="ml-1 rounded-full bg-amarelo px-2.5 py-0.5 text-sm text-marinho tabular-nums">
              {qtdSacola}
            </span>
          </span>
          <span className="tabular-nums">{formatPreco(totalSacola)}</span>
        </button>
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

      {sacolaAberta && (
        <SacolaSheet
          itens={itens}
          catalogoPreco={precoBase}
          enviando={enviando}
          erro={erro}
          onFechar={() => setSacolaAberta(false)}
          onRemover={(key) =>
            setItens((prev) => prev.filter((i) => i.key !== key))
          }
          onQuantidade={(key, qtd) =>
            setItens((prev) =>
              prev.map((i) => (i.key === key ? { ...i, quantidade: qtd } : i))
            )
          }
          onEnviar={enviarPedido}
        />
      )}
    </div>
  );
}
