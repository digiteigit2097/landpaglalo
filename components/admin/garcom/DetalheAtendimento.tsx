"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { supabaseBrowser, supabaseBrowserComAuthRealtime } from "@/lib/supabase-browser";
import { formatPreco } from "@/lib/menu";
import { STATUS_CLASSES, STATUS_LABEL, type StatusPedido } from "@/lib/pedidos-status";
import type { Categoria } from "@/lib/cardapio";
import { paraPayloadCriarPedido, type ItemSacola } from "@/lib/pedido-itens";
import {
  adicionarRodada,
  cancelarRodada,
  imprimirEFecharConta,
} from "@/app/admin/(garcom)/atendimento/actions";
import SeletorItens from "@/components/admin/garcom/SeletorItens";

export type PedidoRodada = {
  id: number;
  cliente_nome: string;
  status: StatusPedido;
  total: number;
  criado_em: string;
  pedido_itens: {
    id: number;
    produto_nome: string;
    variacao: string | null;
    quantidade: number;
    preco_unitario: number;
    observacao: string | null;
    pedido_item_adicionais: {
      id: number;
      adicional_nome: string;
      quantidade: number;
      preco_unitario: number;
    }[];
  }[];
};

function horario(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export default function DetalheAtendimento({
  telefone,
  clienteNome,
  pedidosIniciais,
  categorias,
}: {
  telefone: string;
  clienteNome: string;
  pedidosIniciais: PedidoRodada[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<PedidoRodada[]>(pedidosIniciais);
  const [adicionando, setAdicionando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [fechando, setFechando] = useState(false);

  const carregarPedidos = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("pedidos")
      .select(
        `id, cliente_nome, status, total, criado_em,
         pedido_itens (
           id, produto_nome, variacao, quantidade, preco_unitario, observacao,
           pedido_item_adicionais ( id, adicional_nome, quantidade, preco_unitario )
         )`
      )
      .eq("cliente_telefone", telefone)
      .order("criado_em", { ascending: true })
      .returns<PedidoRodada[]>();
    if (data) setPedidos(data);
  }, [telefone]);

  useEffect(() => {
    let cancelado = false;
    let supabase: Awaited<ReturnType<typeof supabaseBrowserComAuthRealtime>> | null = null;

    supabaseBrowserComAuthRealtime().then((cliente) => {
      if (cancelado) return;
      supabase = cliente;
      cliente
        .channel(`garcom-atendimento-${telefone}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos", filter: `cliente_telefone=eq.${telefone}` },
          () => carregarPedidos()
        )
        .subscribe();
    });

    const intervalo = setInterval(carregarPedidos, 20000);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      if (supabase) supabase.removeAllChannels();
    };
  }, [telefone, carregarPedidos]);

  const abertos = pedidos.filter((p) => p.status !== "pago" && p.status !== "cancelado");
  const total = abertos.reduce((soma, p) => soma + Number(p.total), 0);

  async function confirmarNovaRodada(itens: ItemSacola[]) {
    setEnviando(true);
    setErro(null);
    const resultado = await adicionarRodada(telefone, clienteNome, paraPayloadCriarPedido(itens));
    setEnviando(false);
    if (resultado.erro) {
      setErro(resultado.erro);
      return;
    }
    setAdicionando(false);
    await carregarPedidos();
  }

  async function cancelar(pedidoId: number) {
    if (!confirm(`Cancelar essa rodada?`)) return;
    await cancelarRodada(pedidoId);
    await carregarPedidos();
  }

  async function fecharEImprimir() {
    if (!confirm(`Fechar a conta de ${clienteNome} — total ${formatPreco(total)}?`)) return;
    setFechando(true);
    const resultado = await imprimirEFecharConta(telefone);
    setFechando(false);
    if (resultado.erro) {
      setErro(resultado.erro);
      return;
    }
    router.push("/admin/atendimento");
  }

  if (adicionando) {
    return (
      <div>
        <h1 className="font-display text-2xl font-extrabold text-admin-navy">{clienteNome}</h1>
        <p className="mt-1 text-admin-navy/70">Nova rodada</p>
        <div className="mt-4">
          <SeletorItens
            categorias={categorias}
            rotuloConfirmar="Adicionar itens"
            enviando={enviando}
            erro={erro}
            onConfirmar={confirmarNovaRodada}
            onVoltar={() => setAdicionando(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28">
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">{clienteNome}</h1>
      <p className="mt-1 text-admin-navy/70">
        {abertos.length} {abertos.length === 1 ? "rodada em aberto" : "rodadas em aberto"}
      </p>

      <ul className="mt-4 space-y-3">
        {pedidos.map((pedido) => {
          const cancelada = pedido.status === "cancelado";
          return (
            <li
              key={pedido.id}
              className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10 ${
                cancelada ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm text-admin-navy/60">{horario(pedido.criado_em)}</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                      STATUS_CLASSES[pedido.status] ?? ""
                    }`}
                  >
                    {STATUS_LABEL[pedido.status] ?? pedido.status}
                  </span>
                  <span
                    className={`font-display font-extrabold tabular-nums text-admin-navy ${
                      cancelada ? "line-through" : ""
                    }`}
                  >
                    {formatPreco(pedido.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-2 space-y-1.5 border-t border-admin-navy/10 pt-2">
                {pedido.pedido_itens.map((item) => (
                  <li key={item.id} className="text-sm">
                    <span className={`font-semibold text-admin-navy ${cancelada ? "line-through" : ""}`}>
                      {item.quantidade}x {item.produto_nome}
                      {item.variacao ? ` (${item.variacao})` : ""}
                    </span>
                    {item.pedido_item_adicionais.length > 0 && (
                      <p className="text-admin-navy/60">
                        +{" "}
                        {item.pedido_item_adicionais
                          .map((a) => (a.quantidade > 1 ? `${a.quantidade}x ${a.adicional_nome}` : a.adicional_nome))
                          .join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              {!cancelada && pedido.status !== "pago" && (
                <button
                  type="button"
                  onClick={() => cancelar(pedido.id)}
                  className="mt-2 min-h-9 rounded-full px-3 text-sm font-semibold text-vermelho-texto hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
                >
                  Cancelar rodada
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {abertos.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 bg-admin-branco-creme/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-[600px] flex-col gap-2">
            {erro && (
              <p role="alert" className="rounded-xl bg-vermelho-texto/10 p-3 text-sm font-semibold text-vermelho-texto">
                {erro}
              </p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdicionando(true)}
                className="min-h-13 flex-1 rounded-full bg-white px-4 font-bold text-admin-navy ring-1 ring-admin-navy/15 transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
              >
                + Adicionar item
              </button>
              <button
                type="button"
                disabled={fechando}
                onClick={fecharEImprimir}
                className="flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
              >
                <Printer aria-hidden className="h-4 w-4" strokeWidth={2.5} />
                {fechando ? "Fechando..." : "Imprimir e fechar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
