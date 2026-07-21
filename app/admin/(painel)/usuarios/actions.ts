"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

export type EstadoFormUsuario = { erro?: string; sucesso?: boolean };

export async function criarUsuarioAdmin(
  _estado: EstadoFormUsuario,
  formData: FormData
): Promise<EstadoFormUsuario> {
  const chamador = await exigirAdmin();
  if (!chamador) return { erro: "Sem permissão." };

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const senha = String(formData.get("senha") ?? "");

  if (nome.length < 2) return { erro: "Informe o nome." };
  if (!email.includes("@")) return { erro: "E-mail inválido." };
  if (senha.length < 6) return { erro: "Senha precisa de pelo menos 6 caracteres." };

  const admin = supabaseAdmin();
  const { data: criado, error: erroAuth } = await admin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });
  if (erroAuth || !criado.user) {
    return {
      erro:
        erroAuth?.message === "User already registered"
          ? "Já existe um usuário com esse e-mail."
          : erroAuth?.message ?? "Não foi possível criar o usuário.",
    };
  }

  const { error: erroInsert } = await admin
    .from("admin_usuarios")
    .insert({ id: criado.user.id, nome });
  if (erroInsert) {
    return { erro: erroInsert.message };
  }

  revalidatePath("/admin/usuarios");
  return { sucesso: true };
}

export async function alternarAtivoUsuario(id: string, ativo: boolean) {
  const chamador = await exigirAdmin();
  if (!chamador) return;
  const admin = supabaseAdmin();
  await admin.from("admin_usuarios").update({ ativo }).eq("id", id);
  revalidatePath("/admin/usuarios");
}
