import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";
import {
  formatPreco,
  ADDRESS_LINE1,
  ADDRESS_LINE2,
  PHONE_DISPLAY,
  CNPJ,
  SITE_DOMINIO,
} from "@/lib/menu";
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

  const { data: config } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "dominio_cardapio")
    .maybeSingle();
  const site = (config?.valor as string | undefined)?.replace(/^https?:\/\//i, "") || SITE_DOMINIO;

  const qrSvg = await QRCode.toString(`https://${site}`, {
    type: "svg",
    margin: 0,
    color: { dark: "#000000", light: "#ffffff" },
  });

  const dataPedido = new Date(pedido.criado_em).toLocaleString("pt-BR", {
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
        className="mx-auto w-full max-w-[320px] break-words font-mono text-[12px] leading-snug text-black print:max-w-none"
      >
        <div className="text-center">
          <p className="text-base font-bold">DOGÃO DO LALO</p>
          <p className="font-bold">DELIVERY</p>
          <p>{ADDRESS_LINE1}</p>
          <p>{ADDRESS_LINE2}</p>
          <p>WhatsApp: {PHONE_DISPLAY}</p>
          <p>{site}</p>
          <p>CNPJ: {CNPJ}</p>
        </div>

        <div className="my-2 border-t border-dashed border-black" />

        <p className="font-bold">
          CLIENTE: <span className="font-normal">{pedido.cliente_nome}</span>
        </p>
        <p>Tel: {pedido.cliente_telefone}</p>
        <p className="font-bold">
          DATA: <span className="font-normal">{dataPedido}</span>
        </p>

        <div className="my-2 border-t border-dashed border-black" />

        <div className="grid grid-cols-[26px_1fr_50px_56px] gap-x-1 text-[11px] font-bold uppercase">
          <span>Qtd</span>
          <span>Item</span>
          <span className="text-right">Unit.</span>
          <span className="text-right">Total</span>
        </div>

        {pedido.pedido_itens.map((item) => {
          const totalAdicionais = item.pedido_item_adicionais.reduce(
            (soma, a) => soma + a.preco_unitario * a.quantidade,
            0
          );
          const totalItem = item.preco_unitario * item.quantidade + totalAdicionais;
          return (
            <div key={item.id} className="mt-1.5">
              <div className="grid grid-cols-[26px_1fr_50px_56px] gap-x-1 tabular-nums">
                <span>{item.quantidade}x</span>
                <span className="break-words">
                  {item.produto_nome}
                  {item.variacao ? ` (${item.variacao})` : ""}
                </span>
                <span className="text-right">{formatPreco(item.preco_unitario)}</span>
                <span className="text-right">{formatPreco(totalItem)}</span>
              </div>
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
          );
        })}

        <div className="my-2 border-t border-dashed border-black" />

        <p className="text-base font-bold">TOTAL: {formatPreco(pedido.total)}</p>

        <div className="my-3 flex justify-center [&_svg]:h-[110px] [&_svg]:w-[110px]">
          <div dangerouslySetInnerHTML={{ __html: qrSvg }} />
        </div>
        <p className="text-center">Aponte a câmera para acessar nosso site</p>
        <p className="text-center">{site}</p>

        <div className="my-2 border-t border-dashed border-black" />

        <p className="text-center font-bold">Obrigado pela preferência!</p>
        <p className="text-center font-bold">DOCUMENTO NÃO FISCAL</p>
      </div>
    </div>
  );
}
