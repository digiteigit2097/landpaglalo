import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { formatPreco } from "@/lib/menu";
import NovaCategoriaForm from "@/components/admin/NovaCategoriaForm";
import NovoProdutoForm from "@/components/admin/NovoProdutoForm";
import ToggleMostrarAdicionais from "@/components/admin/ToggleMostrarAdicionais";
import {
  alternarAtivoCategoria,
  alternarAtivoProduto,
  atualizarPrecoProduto,
} from "./actions";

export const dynamic = "force-dynamic";

type ProdutoRow = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  ativo: boolean;
  ordem: number;
  mostrar_adicionais: boolean;
  produto_variacoes: { id: string }[];
};

type CategoriaRow = {
  id: string;
  nome: string;
  ativo: boolean;
  ordem: number;
  produtos: ProdutoRow[];
};

export default async function CatalogoPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("categorias")
    .select(
      "id, nome, ativo, ordem, produtos ( id, nome, descricao, preco, ativo, ordem, mostrar_adicionais, produto_variacoes ( id ) )"
    )
    .returns<CategoriaRow[]>();

  const categorias = (data ?? [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
    .map((c) => ({
      ...c,
      produtos: [...c.produtos].sort((a, b) => a.ordem - b.ordem),
    }));

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-admin-navy">
            Catálogo
          </h1>
          <p className="mt-1 text-admin-navy/70">
            Categorias, produtos e preços
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/catalogo/destaques"
            className="min-h-11 rounded-full bg-admin-navy px-5 py-2.5 font-bold text-admin-branco-creme transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado flex items-center"
          >
            Destaques da home
          </Link>
          <Link
            href="/admin/catalogo/adicionais"
            className="min-h-11 rounded-full bg-admin-navy px-5 py-2.5 font-bold text-admin-branco-creme transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado flex items-center"
          >
            Gerenciar adicionais
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <NovaCategoriaForm />
      </div>

      <div className="mt-6">
        <NovoProdutoForm
          categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))}
        />
      </div>

      <div className="mt-8 space-y-8">
        {categorias.map((cat) => (
          <section key={cat.id}>
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-admin-navy">
                {cat.nome}{" "}
                {!cat.ativo && (
                  <span className="text-sm font-normal text-admin-navy/50">
                    (inativa)
                  </span>
                )}
              </h2>
              <form action={alternarAtivoCategoria.bind(null, cat.id, !cat.ativo)}>
                <button
                  type="submit"
                  className={`min-h-9 rounded-full px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy ${
                    cat.ativo
                      ? "text-vermelho-texto hover:underline"
                      : "bg-admin-dourado text-admin-navy"
                  }`}
                >
                  {cat.ativo ? "Desativar categoria" : "Reativar categoria"}
                </button>
              </form>
            </div>

            <ul className="mt-3 space-y-2">
              {cat.produtos.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/catalogo/produtos/${p.id}`}
                      className="font-semibold text-admin-navy hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado rounded"
                    >
                      {p.nome}
                    </Link>
                    {!p.ativo && (
                      <span className="ml-2 text-sm text-admin-navy/50">
                        (inativo)
                      </span>
                    )}
                    {p.descricao && (
                      <p className="text-sm text-admin-navy/60">
                        {p.descricao}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {p.produto_variacoes.length > 0 ? (
                      <Link
                        href={`/admin/catalogo/produtos/${p.id}`}
                        className="text-sm font-semibold text-admin-navy/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado rounded"
                        title="Este produto tem variações (ex.: Normal/Artesanal) — o preço é definido em cada variação, não aqui"
                      >
                        Preço nas variações →
                      </Link>
                    ) : (
                      <form
                        action={atualizarPrecoProduto.bind(null, p.id)}
                        className="flex items-center gap-1"
                      >
                        <span className="text-sm text-admin-navy/60">R$</span>
                        <input
                          name="preco"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={p.preco}
                          className="w-24 min-h-9 rounded-lg border border-admin-navy/15 bg-admin-branco-creme px-2 py-1 tabular-nums text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
                        />
                        <button
                          type="submit"
                          className="min-h-9 rounded-full bg-admin-dourado px-3 text-sm font-bold text-admin-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
                        >
                          Salvar
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/admin/catalogo/produtos/${p.id}`}
                      className="min-h-9 rounded-full px-3 py-1.5 text-sm font-semibold text-admin-dourado-escuro hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado flex items-center"
                    >
                      Detalhes
                    </Link>
                    <ToggleMostrarAdicionais
                      produtoId={p.id}
                      mostrarAdicionais={p.mostrar_adicionais}
                    />
                    <form action={alternarAtivoProduto.bind(null, p.id, !p.ativo)}>
                      <button
                        type="submit"
                        className={`min-h-9 rounded-full px-3 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy ${
                          p.ativo
                            ? "text-vermelho-texto hover:underline"
                            : "bg-admin-dourado text-admin-navy"
                        }`}
                      >
                        {p.ativo ? "Desativar" : "Reativar"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
              {cat.produtos.length === 0 && (
                <p className="text-admin-navy/60">Nenhum produto ainda.</p>
              )}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
