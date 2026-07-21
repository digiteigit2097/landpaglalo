import { supabaseServer } from "@/lib/supabase-server";
import NovoUsuarioForm from "@/components/admin/NovoUsuarioForm";
import { alternarAtivoUsuario } from "./actions";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const supabase = await supabaseServer();
  const { data: usuarios } = await supabase
    .from("admin_usuarios")
    .select("id, nome, ativo, criado_em")
    .order("criado_em", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">
        Usuários
      </h1>
      <p className="mt-1 text-admin-navy/70">Quem pode acessar este painel</p>

      <div className="mt-6">
        <NovoUsuarioForm />
      </div>

      <ul className="mt-6 space-y-2">
        {(usuarios ?? []).map((u) => (
          <li
            key={u.id}
            className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
          >
            <div>
              <p className="font-semibold text-admin-navy">{u.nome}</p>
              <p className="text-sm text-admin-navy/60">
                {u.ativo ? "Ativo" : "Inativo"} · desde{" "}
                {new Date(u.criado_em).toLocaleDateString("pt-BR")}
              </p>
            </div>
            <form action={alternarAtivoUsuario.bind(null, u.id, !u.ativo)}>
              <button
                type="submit"
                className={`min-h-11 rounded-full px-4 font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy ${
                  u.ativo
                    ? "text-vermelho-texto hover:underline"
                    : "bg-admin-dourado text-admin-navy"
                }`}
              >
                {u.ativo ? "Desativar" : "Reativar"}
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
