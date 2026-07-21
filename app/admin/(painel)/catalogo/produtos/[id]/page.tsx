import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import {
  atualizarProduto,
  alternarAtivoProduto,
  criarVariacao,
  atualizarVariacao,
  removerVariacao,
  salvarAdicionaisPermitidos,
} from "../../actions";

export const dynamic = "force-dynamic";

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await supabaseServer();

  const [{ data: produto }, { data: variacoes }, { data: adicionaisTodos }, { data: permitidos }] =
    await Promise.all([
      supabase.from("produtos").select("*").eq("id", id).maybeSingle(),
      supabase
        .from("produto_variacoes")
        .select("id, nome, preco, ordem")
        .eq("produto_id", id)
        .order("ordem"),
      supabase
        .from("adicionais")
        .select("id, nome, preco, ordem")
        .order("ordem"),
      supabase
        .from("produto_adicionais")
        .select("adicional_id, max_qtd")
        .eq("produto_id", id),
    ]);

  if (!produto) notFound();

  const permitidosMapa = new Map(
    (permitidos ?? []).map((p) => [p.adicional_id, p.max_qtd])
  );

  return (
    <div>
      <Link
        href="/admin/catalogo"
        className="text-sm font-semibold text-admin-dourado-escuro hover:underline"
      >
        ← Voltar pro catálogo
      </Link>

      <h1 className="mt-2 font-display text-2xl font-extrabold text-admin-navy">
        {produto.nome}
      </h1>

      {/* Dados do produto */}
      <form
        action={atualizarProduto.bind(null, id)}
        className="mt-6 grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-admin-navy/10 sm:grid-cols-2"
      >
        <div>
          <label className="text-sm font-semibold text-admin-navy/70">
            Nome
          </label>
          <input
            name="nome"
            defaultValue={produto.nome}
            required
            className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-admin-navy/70">
            Preço base
          </label>
          <input
            name="preco"
            type="number"
            step="0.01"
            min="0"
            defaultValue={produto.preco}
            required
            className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          />
          {(variacoes?.length ?? 0) > 0 && (
            <p className="mt-1 text-xs text-admin-navy/50">
              Este produto tem variações abaixo — o preço mostrado no
              cardápio vem delas, este campo não aparece pro cliente.
            </p>
          )}
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold text-admin-navy/70">
            Descrição
          </label>
          <textarea
            name="descricao"
            defaultValue={produto.descricao ?? ""}
            rows={2}
            className="mt-1 w-full rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
          />
        </div>
        <button
          type="submit"
          className="sm:col-span-2 min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
        >
          Salvar dados do produto
        </button>
      </form>

      <form
        action={alternarAtivoProduto.bind(null, id, !produto.ativo)}
        className="mt-3"
      >
        <button
          type="submit"
          className={`min-h-9 rounded-full px-4 text-sm font-bold ${
            produto.ativo
              ? "text-vermelho-texto hover:underline"
              : "bg-admin-dourado text-admin-navy"
          }`}
        >
          {produto.ativo
            ? "Desativar produto (some do cardápio)"
            : "Reativar produto"}
        </button>
      </form>

      {/* Variações */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-admin-navy">
          Variações (ex.: Normal / Artesanal)
        </h2>
        <p className="text-sm text-admin-navy/60">
          Se o produto não tem variação, deixe essa lista vazia — o preço
          base acima é usado direto.
        </p>

        <ul className="mt-3 space-y-2">
          {(variacoes ?? []).map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
            >
              <form
                action={atualizarVariacao.bind(null, v.id, id)}
                className="flex flex-1 flex-wrap items-center gap-2"
              >
                <input
                  name="nome"
                  defaultValue={v.nome}
                  className="min-h-9 w-32 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
                />
                <input
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={v.preco}
                  className="min-h-9 w-24 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 tabular-nums text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
                />
                <button
                  type="submit"
                  className="min-h-9 rounded-full bg-admin-dourado px-3 text-sm font-bold text-admin-navy"
                >
                  Salvar
                </button>
              </form>
              <form action={removerVariacao.bind(null, v.id, id)}>
                <button
                  type="submit"
                  className="min-h-9 rounded-full px-3 text-sm font-semibold text-vermelho-texto hover:underline"
                >
                  Remover
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form
          action={criarVariacao.bind(null, id)}
          className="mt-3 flex flex-wrap items-end gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
        >
          <div>
            <label className="text-sm font-semibold text-admin-navy/70">
              Nome
            </label>
            <input
              name="nome"
              placeholder="Ex.: Artesanal"
              required
              className="mt-1 min-h-9 w-32 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-admin-navy/70">
              Preço
            </label>
            <input
              name="preco"
              type="number"
              step="0.01"
              min="0"
              required
              className="mt-1 min-h-9 w-24 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
            />
          </div>
          <button
            type="submit"
            className="min-h-9 rounded-full bg-admin-navy px-4 text-sm font-bold text-admin-branco-creme"
          >
            + Adicionar variação
          </button>
        </form>
      </section>

      {/* Adicionais permitidos */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-bold text-admin-navy">
          Adicionais permitidos neste produto
        </h2>
        <p className="text-sm text-admin-navy/60">
          Marque quais adicionais o cliente pode escolher e o máximo de cada
          um.
        </p>

        <form
          action={salvarAdicionaisPermitidos.bind(null, id)}
          className="mt-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
        >
          <ul className="divide-y divide-admin-navy/10">
            {(adicionaisTodos ?? []).map((a) => {
              const marcado = permitidosMapa.has(a.id);
              return (
                <li
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 py-2.5"
                >
                  <label className="flex min-h-9 flex-1 items-center gap-2">
                    <input
                      type="checkbox"
                      name={`marcado_${a.id}`}
                      defaultChecked={marcado}
                      className="h-5 w-5 rounded border-admin-navy/30 text-admin-dourado-escuro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
                    />
                    <span className="font-medium text-admin-navy">
                      {a.nome}
                    </span>
                    <span className="text-sm text-admin-navy/50">
                      + R$ {Number(a.preco).toFixed(2).replace(".", ",")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-admin-navy/70">
                    máx.
                    <input
                      type="number"
                      min={1}
                      name={`max_${a.id}`}
                      defaultValue={permitidosMapa.get(a.id) ?? 5}
                      className="min-h-9 w-16 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 tabular-nums text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
                    />
                  </label>
                </li>
              );
            })}
          </ul>

          <button
            type="submit"
            className="mt-4 min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            Salvar adicionais permitidos
          </button>
        </form>
      </section>
    </div>
  );
}
