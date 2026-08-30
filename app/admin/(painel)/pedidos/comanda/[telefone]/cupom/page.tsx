import { notFound } from "next/navigation";
import { Archivo } from "next/font/google";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";
import { SITE_DOMINIO, numeroPreco } from "@/lib/menu";
import AutoPrint from "@/components/admin/AutoPrint";
import ReciboCabecalho from "@/components/admin/ReciboCabecalho";
import ReciboQrCardapio from "@/components/admin/ReciboQrCardapio";
import ReciboRodape from "@/components/admin/ReciboRodape";

export const dynamic = "force-dynamic";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

type PedidoComanda = {
  id: number;
  cliente_nome: string;
  criado_em: string;
  total: number;
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

export default async function CupomComandaPage({
  params,
}: {
  params: Promise<{ telefone: string }>;
}) {
  const { telefone } = await params;

  const supabase = await supabaseServer();
  const { data: pedidos } = await supabase
    .from("pedidos")
    .select(
      `id, cliente_nome, criado_em, total,
       pedido_itens (
         id, produto_nome, variacao, quantidade, preco_unitario, observacao,
         pedido_item_adicionais ( id, adicional_nome, quantidade, preco_unitario )
       )`
    )
    .eq("cliente_telefone", telefone)
    .neq("status", "cancelado")
    .order("criado_em", { ascending: true })
    .returns<PedidoComanda[]>();

  if (!pedidos || pedidos.length === 0) notFound();

  const clienteNome = pedidos[0].cliente_nome;
  const totalGeral = pedidos.reduce((soma, p) => soma + Number(p.total), 0);
  const primeiraRodada = pedidos[0].criado_em;

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

  const dataAtendimento = new Date(primeiraRodada).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className="p-4">
      <style>{`@page { size: 80mm auto; margin: 4mm; }`}</style>
      <AutoPrint />

      <div
        id="area-impressao"
        className={`${archivo.className} mx-auto w-full max-w-[302px] bg-white px-[15px] pb-4 pt-5 text-[12px] leading-[1.35] tabular-nums text-[#201e1d] print:max-w-none`}
      >
        <ReciboCabecalho />

        <div className="mt-3 h-px bg-[#201e1d]" />

        {/* Dados do atendimento */}
        <div className="grid grid-cols-[56px_1fr] gap-x-2 gap-y-[5px] py-2.5 text-[10px]">
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Início</div>
          <div>{dataAtendimento}</div>
          <div className="pt-px text-[9px] font-bold uppercase tracking-[.14em]">Cliente</div>
          <div>{clienteNome}</div>
        </div>

        <div className="h-[2px] bg-[#201e1d]" />

        {/* Cabeçalho da tabela de itens */}
        <div className="grid grid-cols-[24px_1fr_60px] items-baseline gap-x-2 py-[7px] text-[9px] font-bold uppercase tracking-[.14em]">
          <div>Qtd</div>
          <div>Item</div>
          <div className="text-right">Valor</div>
        </div>

        <div className="h-px bg-[#201e1d]" />

        {/* Rodadas */}
        {pedidos.map((pedido, indice) => {
          const horarioRodada = new Date(pedido.criado_em).toLocaleTimeString("pt-BR", {
            timeZone: "America/Sao_Paulo",
            hour: "2-digit",
            minute: "2-digit",
          });
          return (
            <div key={pedido.id}>
              <div className="pt-2.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#5c5856]">
                Rodada {indice + 1} · {horarioRodada}
              </div>
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
                        <div className="text-[11px] font-semibold">{item.produto_nome}</div>
                        {descricao && (
                          <div className="text-[10px] text-[#5c5856]">{descricao}</div>
                        )}
                        {item.pedido_item_adicionais.map((a) => (
                          <div key={a.id} className="text-[10px] font-bold text-[#201e1d]">
                            + {a.quantidade > 1 ? `${a.quantidade}x ` : ""}
                            {a.adicional_nome}
                          </div>
                        ))}
                      </div>
                      <div className="text-right text-[11px] font-semibold">
                        {numeroPreco(totalItem)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="mt-2.5 h-[2px] bg-[#201e1d]" />

        {/* Total */}
        <div className="flex items-baseline justify-between py-2.5">
          <div className="text-[11px] font-extrabold uppercase tracking-[.14em]">Total</div>
          <div className="whitespace-nowrap text-[19px] font-extrabold tracking-[-.02em]">
            R$ {numeroPreco(totalGeral)}
          </div>
        </div>

        <div className="h-[2px] bg-[#201e1d]" />

        <ReciboQrCardapio qrSvg={qrSvg} site={site} />

        <div className="h-[2px] bg-[#201e1d]" />

        <ReciboRodape />
      </div>
    </div>
  );
}
