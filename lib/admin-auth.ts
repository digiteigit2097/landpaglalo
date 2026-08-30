import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";

// `proximaRota` é pra onde voltar depois de logar de novo (ex.: a página do
// garçom manda de volta pra /admin/atendimento, não pro painel desktop).
export async function exigirAdminOuRedirecionar(
  proximaRota?: string
): Promise<{ nome: string }> {
  const destinoLogin = proximaRota
    ? `/admin/login?next=${encodeURIComponent(proximaRota)}`
    : "/admin/login";

  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(destinoLogin);
  }

  const { data: admin } = await supabase
    .from("admin_usuarios")
    .select("nome, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.ativo) {
    await supabase.auth.signOut();
    redirect(destinoLogin);
  }

  return { nome: admin.nome };
}
