import { supabaseServer } from "@/lib/supabase-server";
import {
  inicioDoDiaBrasilPorData,
  dataBrasilISO,
} from "@/lib/tempo-brasil";
import PainelPedidos, {
  type PedidoCompleto,
} from "@/components/admin/PainelPedidos";

export const dynamic = "force-dynamic";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; status?: string }>;
}) {
  const params = await searchParams;
  const diaSelecionado = params.data ?? dataBrasilISO();
  const inicio = inicioDoDiaBrasilPorData(diaSelecionado);
  const fim = new Date(inicio.getTime() + 24 * 60 * 60 * 1000);

  const supabase = await supabaseServer();
  let query = supabase
    .from("pedidos")
    .select(
      `id, cliente_nome, cliente_telefone, status, total, criado_em,
       pedido_itens (
         id, produto_nome, variacao, quantidade, preco_unitario, observacao,
         pedido_item_adicionais ( id, adicional_nome, quantidade, preco_unitario )
       )`
    )
    .gte("criado_em", inicio.toISOString())
    .lt("criado_em", fim.toISOString())
    .order("criado_em", { ascending: false });

  if (params.status) {
    query = query.eq("status", params.status);
  }

  const { data, error } = await query.returns<PedidoCompleto[]>();

  return (
    <PainelPedidos
      pedidosIniciais={data ?? []}
      erroCarregamento={error ? error.message : null}
      diaSelecionado={diaSelecionado}
      statusSelecionado={params.status ?? ""}
    />
  );
}
