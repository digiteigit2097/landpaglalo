// "Conta aberta" = todos os pedidos de um mesmo cliente (mesmo telefone)
// ainda não pagos/cancelados, agrupados. Usado tanto na tela de pedidos do
// admin (contas de delivery) quanto na tela do garçom (atendimento presencial).
export const STATUS_CONTA_ABERTA = [
  "novo",
  "impresso",
  "em_preparo",
  "entregue",
] as const;

export type PedidoParaConta = {
  id: number;
  cliente_nome: string;
  cliente_telefone: string;
  total: number;
};

export type ContaAberta = {
  clienteTelefone: string;
  clienteNome: string;
  pedidoIds: number[];
  total: number;
};

export function agruparContasAbertas(
  pedidos: PedidoParaConta[]
): ContaAberta[] {
  const grupos = new Map<string, ContaAberta>();
  for (const p of pedidos) {
    const atual = grupos.get(p.cliente_telefone);
    if (atual) {
      atual.pedidoIds.push(p.id);
      atual.total += Number(p.total);
    } else {
      grupos.set(p.cliente_telefone, {
        clienteTelefone: p.cliente_telefone,
        clienteNome: p.cliente_nome,
        pedidoIds: [p.id],
        total: Number(p.total),
      });
    }
  }
  return [...grupos.values()];
}

// Cliente presencial (atendido pelo garçom, sem telefone de verdade) recebe
// um telefone sintético só pra poder usar o mesmo `criar_pedido`/agrupamento
// por telefone já existentes. DDD real nunca começa em "00", então nunca
// colide com um telefone de cliente de delivery de verdade.
const PREFIXO_TELEFONE_SINTETICO = "00";

export function gerarTelefoneSintetico(): string {
  let digitos = "";
  for (let i = 0; i < 9; i++) digitos += Math.floor(Math.random() * 10);
  return PREFIXO_TELEFONE_SINTETICO + digitos;
}

export function ehTelefoneSintetico(telefone: string): boolean {
  return telefone.startsWith(PREFIXO_TELEFONE_SINTETICO);
}
