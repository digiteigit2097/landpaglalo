"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export type EstadoAcao = { erro?: string; sucesso?: boolean };

function normalizarDominio(valor: string) {
  let v = valor.trim();
  if (!v) return "";
  if (!/^https?:\/\//i.test(v)) v = `https://${v}`;
  return v.replace(/\/+$/, "");
}

export async function salvarDominio(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const dominio = normalizarDominio(String(formData.get("dominio") ?? ""));
  if (!dominio) return { erro: "Informe o domínio (ex.: dogaodolalo.com.br)." };

  try {
    new URL(dominio);
  } catch {
    return { erro: "Domínio inválido." };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("configuracoes")
    .upsert({ chave: "dominio_cardapio", valor: dominio, atualizado_em: new Date().toISOString() });
  if (error) return { erro: error.message };

  revalidatePath("/admin/qrcode");
  return { sucesso: true };
}
