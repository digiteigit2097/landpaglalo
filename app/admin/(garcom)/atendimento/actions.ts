"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { gerarTelefoneSintetico } from "@/lib/contas-abertas";
import type { ItemPedidoInput } from "@/lib/pedido-itens";

export type ResultadoAtendimento = { erro?: string; telefone?: string };

async function exigirAdmin() {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("admin_usuarios")
    .select("ativo")
    .eq("id", user.id)
    .maybeSingle();
  return data?.ativo ? user : null;
}

// gera um telefone sintético garantindo (na prática) que não existe
// atendimento em aberto usando o mesmo — colisão real é ~impossível (10^9
// combinações), isso é só uma segurança a mais e sai barato.
async function gerarTelefoneSinteticoLivre(
  supabase: Awaited<ReturnType<typeof supabaseServer>>
): Promise<string> {
  for (let tentativa = 0; tentativa < 5; tentativa++) {
    const candidato = gerarTelefoneSintetico();
    const { data } = await supabase
      .from("pedidos")
      .select("id")
      .eq("cliente_telefone", candidato)
      .not("status", "in", "(pago,cancelado)")
      .limit(1)
      .maybeSingle();
    if (!data) return candidato;
  }
  return gerarTelefoneSintetico();
}

export async function abrirNovoAtendimento(
  nome: string,
  itens: ItemPedidoInput[]
): Promise<ResultadoAtendimento> {
  const chamador = await exigirAdmin();
  if (!chamador) return { erro: "Sem permissão." };

  const nomeLimpo = nome.trim();
  if (nomeLimpo.length < 2) return { erro: "Informe o nome do cliente." };
  if (itens.length === 0) return { erro: "Adicione pelo menos um item." };

  const supabase = await supabaseServer();
  const telefone = await gerarTelefoneSinteticoLivre(supabase);

  const { error } = await supabase.rpc("criar_pedido", {
    p_cliente_nome: nomeLimpo,
    p_cliente_telefone: telefone,
    p_itens: itens,
  });
  if (error) return { erro: error.message };

  revalidatePath("/admin/atendimento");
  return { telefone };
}

export async function adicionarRodada(
  telefone: string,
  nome: string,
  itens: ItemPedidoInput[]
): Promise<ResultadoAtendimento> {
  const chamador = await exigirAdmin();
  if (!chamador) return { erro: "Sem permissão." };
  if (itens.length === 0) return { erro: "Adicione pelo menos um item." };

  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("criar_pedido", {
    p_cliente_nome: nome,
    p_cliente_telefone: telefone,
    p_itens: itens,
  });
  if (error) return { erro: error.message };

  revalidatePath("/admin/atendimento");
  revalidatePath(`/admin/atendimento/${telefone}`);
  return { telefone };
}

export async function imprimirEFecharConta(
  telefone: string
): Promise<ResultadoAtendimento> {
  const chamador = await exigirAdmin();
  if (!chamador) return { erro: "Sem permissão." };

  const supabase = await supabaseServer();
  const { error } = await supabase.rpc("fechar_conta_garcom", {
    p_cliente_telefone: telefone,
  });
  if (error) return { erro: error.message };

  revalidatePath("/admin/atendimento");
  return { telefone };
}

export async function cancelarRodada(pedidoId: number): Promise<void> {
  const chamador = await exigirAdmin();
  if (!chamador) return;

  const supabase = await supabaseServer();
  await supabase.from("pedidos").update({ status: "cancelado" }).eq("id", pedidoId);
  revalidatePath("/admin/atendimento");
}
