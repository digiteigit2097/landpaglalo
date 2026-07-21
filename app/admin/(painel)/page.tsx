import { supabaseServer } from "@/lib/supabase-server";
import { inicioDoDiaBrasil } from "@/lib/tempo-brasil";
import { formatPreco } from "@/lib/menu";
import { STATUS_LABEL } from "@/lib/pedidos-status";

export const dynamic = "force-dynamic";

function CardStat({
  label,
  valor,
  destaque,
}: {
  label: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-admin-navy/10">
      <p className="text-sm font-semibold uppercase tracking-wide text-admin-navy/60">
        {label}
      </p>
      <p
        className={`mt-2 font-display text-3xl font-extrabold tabular-nums ${
          destaque ? "text-admin-dourado-escuro" : "text-admin-navy"
        }`}
      >
        {valor}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await supabaseServer();
  const inicioHoje = inicioDoDiaBrasil().toISOString();

  const [{ data: pedidosHoje }, { count: pendentes }] = await Promise.all([
    supabase
      .from("pedidos")
      .select("total, status")
      .gte("criado_em", inicioHoje),
    supabase
      .from("pedidos")
      .select("id", { count: "exact", head: true })
      .in("status", ["novo", "impresso", "em_preparo"]),
  ]);

  const itens = pedidosHoje ?? [];
  const totalPedidosHoje = itens.length;
  const faturamentoHoje = itens
    .filter((p) => p.status !== "cancelado")
    .reduce((soma, p) => soma + Number(p.total), 0);
  const cancelados = itens.filter((p) => p.status === "cancelado").length;

  const porStatus = itens.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">
        Dashboard
      </h1>
      <p className="mt-1 text-admin-navy/70">Resumo de hoje</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <CardStat label="Pedidos hoje" valor={String(totalPedidosHoje)} />
        <CardStat
          label="Faturamento hoje"
          valor={formatPreco(faturamentoHoje)}
          destaque
        />
        <CardStat label="Pendentes agora" valor={String(pendentes ?? 0)} />
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-admin-navy/10">
        <h2 className="font-display text-lg font-bold text-admin-navy">
          Pedidos de hoje por status
        </h2>
        {totalPedidosHoje === 0 ? (
          <p className="mt-3 text-admin-navy/60">Nenhum pedido ainda hoje.</p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-3">
            {Object.entries(porStatus).map(([status, qtd]) => (
              <li
                key={status}
                className="flex items-center justify-between rounded-xl bg-admin-branco-creme px-4 py-2.5"
              >
                <span className="font-semibold text-admin-navy">
                  {STATUS_LABEL[status] ?? status}
                </span>
                <span className="font-display font-extrabold tabular-nums text-admin-navy">
                  {qtd}
                </span>
              </li>
            ))}
          </ul>
        )}
        {cancelados > 0 && (
          <p className="mt-3 text-sm text-admin-navy/60">
            {cancelados} pedido(s) cancelado(s) hoje — não entram no faturamento.
          </p>
        )}
      </div>
    </div>
  );
}
