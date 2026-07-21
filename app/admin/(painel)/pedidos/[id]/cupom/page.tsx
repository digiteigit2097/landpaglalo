import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { formatPreco } from "@/lib/menu";
import AutoPrint from "@/components/admin/AutoPrint";

export const dynamic = "force-dynamic";

type PedidoCupom = {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
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

export default async function CupomPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pedidoId = Number(id);
  if (!Number.isInteger(pedidoId)) notFound();

  const supabase = await supabaseServer();
  const { data: pedido } = await supabase
    .from("pedidos")
    .select(
      `id, cliente_nome, cliente_telefone, total, criado_em,
       pedido_itens (
         id, produto_nome, variacao, quantidade, preco_unitario, observacao,
         pedido_item_adicionais ( id, adicional_nome, quantidade, preco_unitario )
       )`
    )
    .eq("id", pedidoId)
    .maybeSingle<PedidoCupom>();

  if (!pedido) notFound();

  const horario = new Date(pedido.criado_em).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="p-4">
      <style>{`@page { size: 80mm auto; margin: 3mm; }`}</style>
      <AutoPrint />

      <div
        id="area-impressao"
        className="mx-auto w-full max-w-[320px] break-words font-mono text-[13px] leading-snug text-black print:max-w-none"
      >
        <div className="text-center">
          <p className="text-base font-bold">DOGÃO DO LALO</p>
          <p>Pedido nº {pedido.id}</p>
          <p>{horario}</p>
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        <p>Cliente: {pedido.cliente_nome}</p>
        <p>Tel: {pedido.cliente_telefone}</p>

        <div className="my-2 border-t border-dashed border-black" />

        {pedido.pedido_itens.map((item) => (
          <div key={item.id} className="mb-2">
            <p className="font-bold">
              {item.quantidade}x {item.produto_nome}
              {item.variacao ? ` (${item.variacao})` : ""}
            </p>
            {item.pedido_item_adicionais.map((a) => (
              <p key={a.id} className="pl-3">
                + {a.quantidade > 1 ? `${a.quantidade}x ` : ""}
                {a.adicional_nome}
              </p>
            ))}
            {item.observacao && (
              <p className="pl-3 italic">obs: {item.observacao}</p>
            )}
          </div>
        ))}

        <div className="my-2 border-t border-dashed border-black" />

        <p className="flex justify-between text-base font-bold">
          <span>TOTAL</span>
          <span className="tabular-nums">{formatPreco(pedido.total)}</span>
        </p>

        <div className="my-2 border-t border-dashed border-black" />
        <p className="text-center text-xs">Dogão do Lalo — Londrina/PR</p>
      </div>
    </div>
  );
}
