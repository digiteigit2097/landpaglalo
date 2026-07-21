import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import NovoDestaqueForm from "@/components/admin/NovoDestaqueForm";
import {
  atualizarDestaque,
  alternarAtivoDestaque,
  removerDestaque,
} from "../actions";

export const dynamic = "force-dynamic";

type DestaqueRow = {
  id: string;
  tag: string;
  descricao: string;
  ativo: boolean;
  ordem: number;
  produtos: { id: string; nome: string; preco: number } | null;
};

export default async function DestaquesPage() {
  const supabase = await supabaseServer();
  const [{ data: destaques }, { data: produtos }] = await Promise.all([
    supabase
      .from("destaques")
      .select("id, tag, descricao, ativo, ordem, produtos ( id, nome, preco )")
      .order("ordem")
      .returns<DestaqueRow[]>(),
    supabase
      .from("produtos")
      .select("id, nome")
      .eq("ativo", true)
      .order("nome"),
  ]);

  return (
    <div>
      <Link
        href="/admin/catalogo"
        className="text-sm font-semibold text-admin-dourado-escuro hover:underline"
      >
        ← Voltar pro catálogo
      </Link>

      <h1 className="mt-2 font-display text-2xl font-extrabold text-admin-navy">
        Destaques da home
      </h1>
      <p className="mt-1 text-admin-navy/70">
        Os cards "queridinhos da galera" que aparecem logo abaixo do topo do
        site
      </p>

      <div className="mt-6">
        <NovoDestaqueForm produtos={produtos ?? []} />
      </div>

      <ul className="mt-6 space-y-3">
        {(destaques ?? []).map((d) => (
          <li
            key={d.id}
            className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
          >
            <p className="text-sm font-semibold text-admin-navy/60">
              {d.produtos?.nome ?? "(produto removido)"} —{" "}
              <span className="tabular-nums">
                R$ {Number(d.produtos?.preco ?? 0).toFixed(2).replace(".", ",")}
              </span>
              {!d.ativo && <span> · inativo</span>}
            </p>
            <form
              action={atualizarDestaque.bind(null, d.id)}
              className="mt-2 grid gap-2 sm:grid-cols-[200px_1fr_auto]"
            >
              <input
                name="tag"
                defaultValue={d.tag}
                className="min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
              <input
                name="descricao"
                defaultValue={d.descricao}
                className="min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
              <button
                type="submit"
                className="min-h-11 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy"
              >
                Salvar
              </button>
            </form>
            <div className="mt-2 flex gap-3">
              <form action={alternarAtivoDestaque.bind(null, d.id, !d.ativo)}>
                <button
                  type="submit"
                  className={`min-h-9 rounded-full px-3 text-sm font-bold ${
                    d.ativo
                      ? "text-vermelho-texto hover:underline"
                      : "bg-admin-dourado text-admin-navy"
                  }`}
                >
                  {d.ativo ? "Desativar" : "Reativar"}
                </button>
              </form>
              <form action={removerDestaque.bind(null, d.id)}>
                <button
                  type="submit"
                  className="min-h-9 rounded-full px-3 text-sm font-semibold text-admin-navy/50 hover:underline"
                >
                  Remover
                </button>
              </form>
            </div>
          </li>
        ))}
        {(destaques ?? []).length === 0 && (
          <p className="text-admin-navy/60">Nenhum destaque cadastrado.</p>
        )}
      </ul>
    </div>
  );
}
