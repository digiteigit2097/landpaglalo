import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import NovoAdicionalForm from "@/components/admin/NovoAdicionalForm";
import { atualizarAdicional, alternarAtivoAdicional } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdicionaisPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("adicionais")
    .select("id, nome, preco, ativo, ordem")
    .order("ordem");

  const adicionais = data ?? [];

  return (
    <div>
      <Link
        href="/admin/catalogo"
        className="text-sm font-semibold text-admin-dourado-escuro hover:underline"
      >
        ← Voltar pro catálogo
      </Link>

      <h1 className="mt-2 font-display text-2xl font-extrabold text-admin-navy">
        Adicionais
      </h1>
      <p className="mt-1 text-admin-navy/70">
        Lista mestre — depois escolha quais valem pra cada produto na página
        de detalhe dele
      </p>

      <div className="mt-6">
        <NovoAdicionalForm />
      </div>

      <ul className="mt-6 space-y-2">
        {adicionais.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
          >
            <form
              action={atualizarAdicional.bind(null, a.id)}
              className="flex flex-1 flex-wrap items-center gap-2"
            >
              <input
                name="nome"
                defaultValue={a.nome}
                className="min-h-9 w-40 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
              <span className="text-sm text-admin-navy/60">R$</span>
              <input
                name="preco"
                type="number"
                step="0.01"
                min="0"
                defaultValue={a.preco}
                className="min-h-9 w-24 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 tabular-nums text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
              <button
                type="submit"
                className="min-h-9 rounded-full bg-admin-dourado px-3 text-sm font-bold text-admin-navy"
              >
                Salvar
              </button>
            </form>
            <form action={alternarAtivoAdicional.bind(null, a.id, !a.ativo)}>
              <button
                type="submit"
                className={`min-h-9 rounded-full px-3 text-sm font-bold ${
                  a.ativo
                    ? "text-vermelho-texto hover:underline"
                    : "bg-admin-dourado text-admin-navy"
                }`}
              >
                {a.ativo ? "Desativar" : "Reativar"}
              </button>
            </form>
          </li>
        ))}
        {adicionais.length === 0 && (
          <p className="text-admin-navy/60">Nenhum adicional cadastrado.</p>
        )}
      </ul>
    </div>
  );
}
