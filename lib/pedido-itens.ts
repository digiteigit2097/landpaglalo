import type { Variacao } from "@/lib/cardapio";

export type ItemSacola = {
  key: string;
  produtoId: string;
  nome: string;
  variacao: Variacao | null;
  adicionais: { id: string; nome: string; preco: number; quantidade: number }[];
  quantidade: number;
  observacao: string;
};

export function precoUnitario(item: ItemSacola, base: number) {
  const variacao = item.variacao?.preco ?? base;
  const extras = item.adicionais.reduce(
    (soma, a) => soma + a.preco * a.quantidade,
    0
  );
  return variacao + extras;
}

export function itemTotal(item: ItemSacola, base: number) {
  return precoUnitario(item, base) * item.quantidade;
}

export type ItemPedidoInput = {
  produto_id: string;
  variacao_id: string | null;
  quantidade: number;
  observacao: string | null;
  adicionais: { adicional_id: string; quantidade: number }[];
};

// Transforma os itens da sacola no formato que a função `criar_pedido`
// (RPC no banco) espera em `p_itens`.
export function paraPayloadCriarPedido(itens: ItemSacola[]): ItemPedidoInput[] {
  return itens.map((item) => ({
    produto_id: item.produtoId,
    variacao_id: item.variacao?.id ?? null,
    quantidade: item.quantidade,
    observacao: item.observacao || null,
    adicionais: item.adicionais.map((a) => ({
      adicional_id: a.id,
      quantidade: a.quantidade,
    })),
  }));
}
