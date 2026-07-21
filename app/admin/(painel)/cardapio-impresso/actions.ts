"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export type EstadoAcao = { erro?: string; sucesso?: boolean };

export async function salvarChavePix(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const chave = String(formData.get("chave_pix") ?? "").trim();
  const apenasDigitosOuEmail =
    /^\d{11}$|^\d{14}$|^[+\d][\d]{10,13}$|^[^\s@]+@[^\s@]+\.[^\s@]+$|^[a-zA-Z0-9]{32,36}$/;
  if (!chave) return { erro: "Informe a chave PIX." };
  if (!apenasDigitosOuEmail.test(chave.replace(/[.\-/]/g, ""))) {
    return {
      erro: "Chave PIX não reconhecida (use CPF, CNPJ, telefone, e-mail ou chave aleatória).",
    };
  }

  const supabase = await supabaseServer();
  const { error } = await supabase
    .from("configuracoes")
    .upsert({ chave: "chave_pix", valor: chave.replace(/[.\-/]/g, "") });
  if (error) return { erro: error.message };

  revalidatePath("/admin/cardapio-impresso");
  return { sucesso: true };
}
