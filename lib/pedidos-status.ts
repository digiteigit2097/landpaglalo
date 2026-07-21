export const STATUS_LABEL: Record<string, string> = {
  novo: "Novo",
  impresso: "Impresso",
  em_preparo: "Em preparo",
  entregue: "Entregue",
  pago: "Pago",
  cancelado: "Cancelado",
};

export const STATUS_ORDEM = [
  "novo",
  "impresso",
  "em_preparo",
  "entregue",
  "pago",
  "cancelado",
] as const;

export type StatusPedido = (typeof STATUS_ORDEM)[number];

export const PROXIMO_STATUS: Partial<Record<StatusPedido, StatusPedido>> = {
  novo: "impresso",
  impresso: "em_preparo",
  em_preparo: "entregue",
};

export const STATUS_CLASSES: Record<string, string> = {
  novo: "bg-vermelho-texto/10 text-vermelho-texto",
  impresso: "bg-admin-dourado-claro/50 text-admin-dourado-escuro",
  em_preparo: "bg-admin-dourado/30 text-admin-dourado-escuro",
  entregue: "bg-admin-navy/10 text-admin-navy",
  pago: "bg-green-600/10 text-green-700",
  cancelado: "bg-gray-400/20 text-gray-600",
};
