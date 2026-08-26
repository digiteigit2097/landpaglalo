import { notFound } from "next/navigation";
import { Archivo } from "next/font/google";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";
import {
  ADDRESS_LINE1,
  PHONE_DISPLAY,
  CNPJ,
  SITE_DOMINIO,
} from "@/lib/menu";
import AutoPrint from "@/components/admin/AutoPrint";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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

function numero(valor: number) {
  return valor.toFixed(2).replace(".", ",");
}

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
    color: { dark: "#201e1d", light: "#ffffff" },
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
        className={`${archivo.className} mx-auto w-full max-w-[302px] bg-white px-[15px] pb-4 pt-5 text-[12px] leading-[1.35] tabular-nums text-[#201e1d] print:max-w-none`}
      >
        {/* Cabeçalho */}
        <div className="flex flex-col gap-[3px]">
          <div className="text-[9px] font-bold uppercase tracking-[.22em]">
            Delivery · Londrina/PR
          </div>
          <div className="text-[27px] font-extrabold uppercase leading-[.95] tracking-[-.02em]">
            Dogão
            <br />
            do Lalo
          </div>
        </div>

        <div className="my-3 h-[2px] bg-[#201e1d]" />

        <div className="flex flex-col gap-[2px] text-[11px] leading-[1.4]">
          <div>{ADDRESS_LINE1}</div>
          <div>Santa Mônica — CEP 86079-450</div>
          <div className="mt-1 flex gap-1.5">
            <span className="font-bold">WhatsApp</span>
            <span>{PHONE_DISPLAY}</span>
          </div>
          <div className="flex gap-1.5">
            <span className="font-bold">CNPJ</span>
            <span>{CNPJ}</span>
          </div>
        </div>

        <div className="mt-3 h-px bg-[#201e1d]" />

        {/* Dados do pedido */}
        <div className="grid grid-cols-[56px_1fr] gap-x-2 gap-y-[5px] py-2.5 text-[11px]">
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Pedido</div>
          <div className="font-bold">#{pedido.id}</div>
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Data</div>
          <div>{dataPedido}</div>
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Cliente</div>
          <div>{pedido.cliente_nome}</div>
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Tel</div>
          <div>{pedido.cliente_telefone}</div>
        </div>

        <div className="h-[2px] bg-[#201e1d]" />

        {/* Cabeçalho da tabela de itens */}
        <div className="grid grid-cols-[24px_1fr_60px] items-baseline gap-x-2 py-[7px] text-[9px] font-bold uppercase tracking-[.14em]">
          <div>Qtd</div>
          <div>Item</div>
          <div className="text-right">Valor</div>
        </div>

        <div className="h-px bg-[#201e1d]" />

        {/* Itens */}
        <div className="flex flex-col">
          {pedido.pedido_itens.map((item) => {
            const totalAdicionais = item.pedido_item_adicionais.reduce(
              (soma, a) => soma + a.preco_unitario * a.quantidade,
              0
            );
            const totalItem = item.preco_unitario * item.quantidade + totalAdicionais;
            const descricao = [item.variacao, item.observacao]
              .filter(Boolean)
              .join(" · ");

            return (
              <div
                key={item.id}
                className="grid grid-cols-[24px_1fr_60px] gap-x-2 border-b border-[#cdcbc9] py-[9px]"
              >
                <div className="font-bold">{item.quantidade}×</div>
                <div>
                  <div className="font-semibold">{item.produto_nome}</div>
                  {descricao && (
                    <div className="text-[10px] text-[#5c5856]">{descricao}</div>
                  )}
                  {item.pedido_item_adicionais.map((a) => (
                    <div key={a.id} className="text-[10px] text-[#5c5856]">
                      + {a.quantidade > 1 ? `${a.quantidade}x ` : ""}
                      {a.adicional_nome}
                    </div>
                  ))}
                </div>
                <div className="text-right font-semibold">{numero(totalItem)}</div>
              </div>
            );
          })}
        </div>

        <div className="mt-2.5 h-[2px] bg-[#201e1d]" />

        {/* Total */}
        <div className="flex items-baseline justify-between py-2.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[.14em]">Total</div>
          <div className="text-[24px] font-extrabold tracking-[-.02em]">
            R$ {numero(pedido.total)}
          </div>
        </div>

        <div className="h-[2px] bg-[#201e1d]" />

        {/* QR do cardápio online */}
        <div className="flex gap-3 py-3.5">
          <div
            className="flex h-24 w-24 flex-none items-center justify-center border-2 border-[#201e1d] p-1 [&_svg]:h-full [&_svg]:w-full"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
          <div className="flex flex-col gap-1 pt-0.5">
            <div className="text-[9px] font-bold uppercase tracking-[.14em]">
              Cardápio online
            </div>
            <div className="text-[11px] leading-[1.35]">
              Aponte a câmera para pedir de novo em 30 segundos.
            </div>
            <div className="text-[11px] font-bold">{site}</div>
          </div>
        </div>

        <div className="h-[2px] bg-[#201e1d]" />

        {/* Rodapé */}
        <div className="flex flex-col gap-1 pt-3">
          <div className="text-[15px] font-extrabold tracking-[-.01em]">
            Obrigado pela preferência.
          </div>
          <div className="text-[10px] leading-[1.4] text-[#5c5856]">
            Dúvidas ou trocas: fale com a gente no WhatsApp em até 24h.
          </div>
          <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[.14em]">
            Documento não fiscal
          </div>
        </div>
      </div>
    </div>
  );
}
