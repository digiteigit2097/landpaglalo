"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { supabaseBrowser, supabaseBrowserComAuthRealtime } from "@/lib/supabase-browser";
import { formatPreco } from "@/lib/menu";
import {
  PROXIMO_STATUS,
  STATUS_CLASSES,
  STATUS_LABEL,
  STATUS_ORDEM,
  type StatusPedido,
} from "@/lib/pedidos-status";
import {
  agruparContasAbertas,
  ehTelefoneSintetico,
  type ContaAberta,
} from "@/lib/contas-abertas";

export type PedidoCompleto = {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
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

function PedidoCard({
  pedido,
  onAvancar,
  onCancelar,
}: {
  pedido: PedidoCompleto;
  onAvancar: (id: number, novoStatus: StatusPedido) => void;
  onCancelar: (id: number) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const proximo = PROXIMO_STATUS[pedido.status];
  const podeCancelar = pedido.status !== "pago" && pedido.status !== "cancelado";

  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display font-extrabold text-admin-navy">
            Pedido nº {pedido.id} · {pedido.cliente_nome}
          </p>
          <p className="text-sm text-admin-navy/60">
            {horario(pedido.criado_em)}
            {!ehTelefoneSintetico(pedido.cliente_telefone) &&
              ` · ${pedido.cliente_telefone}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              STATUS_CLASSES[pedido.status] ?? ""
            }`}
          >
            {STATUS_LABEL[pedido.status] ?? pedido.status}
          </span>
          <span className="font-display font-extrabold tabular-nums text-admin-navy">
            {formatPreco(pedido.total)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="mt-2 text-sm font-semibold text-admin-dourado-escuro hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
      >
        {aberto ? "Ocultar itens" : "Ver itens"}
      </button>

      {aberto && (
        <ul className="mt-3 space-y-2 border-t border-admin-navy/10 pt-3">
          {pedido.pedido_itens.map((item) => (
            <li key={item.id} className="text-sm">
              <span className="font-semibold text-admin-navy">
                {item.quantidade}x {item.produto_nome}
                {item.variacao ? ` (${item.variacao})` : ""}
              </span>
              {item.pedido_item_adicionais.length > 0 && (
                <p className="text-admin-navy/60">
                  +{" "}
                  {item.pedido_item_adicionais
                    .map((a) =>
                      a.quantidade > 1
                        ? `${a.quantidade}x ${a.adicional_nome}`
                        : a.adicional_nome
                    )
                    .join(", ")}
                </p>
              )}
              {item.observacao && (
                <p className="italic text-admin-navy/60">
                  “{item.observacao}”
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {pedido.status === "novo" ? (
          <button
            type="button"
            onClick={() => {
              window.open(
                `/admin/pedidos/${pedido.id}/cupom`,
                `cupom-${pedido.id}`,
                "width=420,height=650"
              );
              onAvancar(pedido.id, "impresso");
            }}
            className="flex min-h-11 items-center gap-2 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            <Printer aria-hidden className="h-4 w-4" strokeWidth={2.5} />
            Imprimir pedido
          </button>
        ) : (
          <>
            {proximo && (
              <button
                type="button"
                onClick={() => onAvancar(pedido.id, proximo)}
                className="min-h-11 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
              >
                Marcar {STATUS_LABEL[proximo]}
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                window.open(
                  `/admin/pedidos/${pedido.id}/cupom`,
                  `cupom-${pedido.id}`,
                  "width=420,height=650"
                )
              }
              className="flex min-h-11 items-center gap-2 rounded-full px-4 font-semibold text-admin-dourado-escuro hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
            >
              <Printer aria-hidden className="h-4 w-4" strokeWidth={2.5} />
              Reimprimir
            </button>
          </>
        )}
        {podeCancelar && (
          <button
            type="button"
            onClick={() => onCancelar(pedido.id)}
            className="min-h-11 rounded-full px-4 font-semibold text-vermelho-texto hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vermelho-texto"
          >
            Cancelar
          </button>
        )}
      </div>
    </li>
  );
}

export default function PainelPedidos({
  pedidosIniciais,
  erroCarregamento,
  diaSelecionado,
  statusSelecionado,
}: {
  pedidosIniciais: PedidoCompleto[];
  erroCarregamento: string | null;
  diaSelecionado: string;
  statusSelecionado: string;
}) {
  const router = useRouter();
  const [contas, setContas] = useState<ContaAberta[]>([]);
  const [fechando, setFechando] = useState<string | null>(null);

  const carregarContas = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("pedidos")
      .select("id, cliente_nome, cliente_telefone, total, status")
      .in("status", ["novo", "impresso", "em_preparo", "entregue"])
      .order("criado_em", { ascending: true });

    setContas(agruparContasAbertas(data ?? []));
  }, []);

  useEffect(() => {
    carregarContas();
    let cancelado = false;
    let supabase: Awaited<ReturnType<typeof supabaseBrowserComAuthRealtime>> | null = null;

    supabaseBrowserComAuthRealtime().then((cliente) => {
      if (cancelado) return;
      supabase = cliente;
      cliente
        .channel("admin-pedidos")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos" },
          () => {
            router.refresh();
            carregarContas();
          }
        )
        .subscribe();
    });

    // rede de segurança: o WebSocket do realtime pode cair sem avisar (aba
    // em segundo plano, notebook hibernando, rede instável) e nunca mais
    // reconectar sozinho — sem isso, a fila fica "parada" na tela mesmo com
    // pedido novo chegando. Atualiza de tempos em tempos de qualquer jeito.
    const intervaloAtualizacao = setInterval(() => {
      router.refresh();
      carregarContas();
    }, 20000);

    return () => {
      cancelado = true;
      clearInterval(intervaloAtualizacao);
      if (supabase) {
        supabase.removeAllChannels();
      }
    };
  }, [carregarContas, router]);

  function mudarFiltro(data: string, status: string) {
    const params = new URLSearchParams();
    if (data) params.set("data", data);
    if (status) params.set("status", status);
    router.push(`/admin/pedidos?${params.toString()}`);
  }

  async function avancarStatus(id: number, novoStatus: StatusPedido) {
    const supabase = supabaseBrowser();
    await supabase.from("pedidos").update({ status: novoStatus }).eq("id", id);
    router.refresh();
  }

  async function cancelarPedido(id: number) {
    if (!confirm(`Cancelar o pedido nº ${id}?`)) return;
    const supabase = supabaseBrowser();
    await supabase.from("pedidos").update({ status: "cancelado" }).eq("id", id);
    router.refresh();
  }

  async function fecharConta(conta: ContaAberta) {
    if (
      !confirm(
        `Fechar a conta de ${conta.clienteNome} — total ${formatPreco(
          conta.total
        )}?`
      )
    )
      return;
    setFechando(conta.clienteTelefone);
    const supabase = supabaseBrowser();
    await supabase
      .from("pedidos")
      .update({ status: "pago" })
      .in("id", conta.pedidoIds);
    await carregarContas();
    router.refresh();
    setFechando(null);
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">
        Pedidos
      </h1>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-sm font-semibold text-admin-navy/70">
            Data
          </label>
          <input
            type="date"
            value={diaSelecionado}
            onChange={(e) => mudarFiltro(e.target.value, statusSelecionado)}
            className="mt-1 block min-h-11 rounded-xl border border-admin-navy/15 bg-white px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-admin-navy/70">
            Status
          </label>
          <select
            value={statusSelecionado}
            onChange={(e) => mudarFiltro(diaSelecionado, e.target.value)}
            className="mt-1 block min-h-11 rounded-xl border border-admin-navy/15 bg-white px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          >
            <option value="">Todos</option>
            {STATUS_ORDEM.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          {erroCarregamento && (
            <p className="rounded-xl bg-vermelho-texto/10 p-3 text-sm font-semibold text-vermelho-texto">
              Erro ao carregar pedidos: {erroCarregamento}
            </p>
          )}
          {pedidosIniciais.length === 0 ? (
            <p className="mt-4 text-admin-navy/60">
              Nenhum pedido nesse filtro.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pedidosIniciais.map((p) => (
                <PedidoCard
                  key={p.id}
                  pedido={p}
                  onAvancar={avancarStatus}
                  onCancelar={cancelarPedido}
                />
              ))}
            </ul>
          )}
        </div>

        <div>
          <h2 className="font-display text-lg font-bold text-admin-navy">
            Contas em aberto
          </h2>
          <p className="text-sm text-admin-navy/60">
            Agrupado por cliente, todos os pedidos ainda não pagos
          </p>
          {contas.length === 0 ? (
            <p className="mt-3 text-admin-navy/60">Nenhuma conta em aberto.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {contas.map((c) => (
                <li
                  key={c.clienteTelefone}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
                >
                  <p className="font-semibold text-admin-navy">
                    {c.clienteNome}
                  </p>
                  <p className="text-sm text-admin-navy/60">
                    {ehTelefoneSintetico(c.clienteTelefone)
                      ? "Atendimento no salão"
                      : c.clienteTelefone}{" "}
                    · pedidos {c.pedidoIds.join(", nº ")}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-display font-extrabold tabular-nums text-admin-navy">
                      {formatPreco(c.total)}
                    </span>
                    <button
                      type="button"
                      disabled={fechando === c.clienteTelefone}
                      onClick={() => fecharConta(c)}
                      className="min-h-11 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
                    >
                      {fechando === c.clienteTelefone
                        ? "Fechando..."
                        : "Fechar conta"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
