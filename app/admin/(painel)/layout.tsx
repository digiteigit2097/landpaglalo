import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import Sidebar from "@/components/admin/Sidebar";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: admin } = await supabase
    .from("admin_usuarios")
    .select("nome, ativo")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin || !admin.ativo) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-dvh bg-admin-branco-creme">
      <Sidebar nome={admin.nome} />
      <main className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
        {children}
      </main>
    </div>
  );
}
