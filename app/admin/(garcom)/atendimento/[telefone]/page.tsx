import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { buscarCardapio } from "@/lib/cardapio";
import DetalheAtendimento, {
  type PedidoRodada,
} from "@/components/admin/garcom/DetalheAtendimento";

export const dynamic = "force-dynamic";

export default async function AtendimentoDetalhePage({
  params,
}: {
  params: Promise<{ telefone: string }>;
}) {
  const { telefone } = await params;

  const supabase = await supabaseServer();
  const { data: pedidos } = await supabase
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

  if (!pedidos || pedidos.length === 0) notFound();

  const categorias = await buscarCardapio();

  return (
    <DetalheAtendimento
      telefone={telefone}
      clienteNome={pedidos[0].cliente_nome}
      pedidosIniciais={pedidos}
      categorias={categorias}
    />
  );
}
