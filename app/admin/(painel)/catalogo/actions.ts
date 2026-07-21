"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase-server";

export type EstadoAcao = { erro?: string; sucesso?: boolean };

async function proximaOrdem(
  tabela: "categorias" | "produtos" | "adicionais" | "produto_variacoes" | "destaques",
  filtroColuna?: string,
  filtroValor?: string
) {
  const supabase = await supabaseServer();
  let query = supabase
    .from(tabela)
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1);
  if (filtroColuna && filtroValor) {
    query = query.eq(filtroColuna, filtroValor);
  }
  const { data } = await query.maybeSingle();
  return (data?.ordem ?? 0) + 1;
}

// ---------- Categorias ----------

export async function criarCategoria(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const nome = String(formData.get("nome") ?? "").trim();
  if (nome.length < 2) return { erro: "Informe o nome da categoria." };

  const supabase = await supabaseServer();
  const ordem = await proximaOrdem("categorias");
  const { error } = await supabase.from("categorias").insert({ nome, ordem });
  if (error) return { erro: error.message };

  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
  return { sucesso: true };
}

export async function alternarAtivoCategoria(id: string, ativo: boolean) {
  const supabase = await supabaseServer();
  await supabase.from("categorias").update({ ativo }).eq("id", id);
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

// ---------- Produtos ----------

export async function criarProduto(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const categoria_id = String(formData.get("categoria_id") ?? "");
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const preco = Number(formData.get("preco"));

  if (!categoria_id) return { erro: "Escolha a categoria." };
  if (nome.length < 2) return { erro: "Informe o nome do produto." };
  if (!Number.isFinite(preco) || preco < 0) return { erro: "Preço inválido." };

  const supabase = await supabaseServer();
  const ordem = await proximaOrdem("produtos", "categoria_id", categoria_id);
  const { error } = await supabase.from("produtos").insert({
    categoria_id,
    nome,
    descricao: descricao || null,
    preco,
    ordem,
  });
  if (error) return { erro: error.message };

  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
  return { sucesso: true };
}

export async function atualizarProduto(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const preco = Number(formData.get("preco"));
  if (nome.length < 2 || !Number.isFinite(preco) || preco < 0) return;

  const supabase = await supabaseServer();
  await supabase
    .from("produtos")
    .update({ nome, descricao: descricao || null, preco })
    .eq("id", id);

  revalidatePath("/admin/catalogo");
  revalidatePath(`/admin/catalogo/produtos/${id}`);
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function atualizarPrecoProduto(id: string, formData: FormData) {
  const preco = Number(formData.get("preco"));
  if (!Number.isFinite(preco) || preco < 0) return;

  const supabase = await supabaseServer();
  await supabase.from("produtos").update({ preco }).eq("id", id);

  revalidatePath("/admin/catalogo");
  revalidatePath(`/admin/catalogo/produtos/${id}`);
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function alternarAtivoProduto(id: string, ativo: boolean) {
  const supabase = await supabaseServer();
  await supabase.from("produtos").update({ ativo }).eq("id", id);
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

// ---------- Variações ----------

export async function criarVariacao(produtoId: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const preco = Number(formData.get("preco"));
  if (nome.length < 1 || !Number.isFinite(preco) || preco < 0) return;

  const supabase = await supabaseServer();
  const ordem = await proximaOrdem(
    "produto_variacoes",
    "produto_id",
    produtoId
  );
  await supabase
    .from("produto_variacoes")
    .insert({ produto_id: produtoId, nome, preco, ordem });

  revalidatePath(`/admin/catalogo/produtos/${produtoId}`);
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function atualizarVariacao(
  id: string,
  produtoId: string,
  formData: FormData
) {
  const nome = String(formData.get("nome") ?? "").trim();
  const preco = Number(formData.get("preco"));
  if (nome.length < 1 || !Number.isFinite(preco) || preco < 0) return;

  const supabase = await supabaseServer();
  await supabase.from("produto_variacoes").update({ nome, preco }).eq("id", id);

  revalidatePath(`/admin/catalogo/produtos/${produtoId}`);
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function removerVariacao(id: string, produtoId: string) {
  const supabase = await supabaseServer();
  await supabase.from("produto_variacoes").delete().eq("id", id);
  revalidatePath(`/admin/catalogo/produtos/${produtoId}`);
  revalidatePath("/");
  revalidatePath("/cardapio");
}

// ---------- Adicionais (lista global) ----------

export async function criarAdicional(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const nome = String(formData.get("nome") ?? "").trim();
  const preco = Number(formData.get("preco"));
  if (nome.length < 2) return { erro: "Informe o nome." };
  if (!Number.isFinite(preco) || preco < 0) return { erro: "Preço inválido." };

  const supabase = await supabaseServer();
  const ordem = await proximaOrdem("adicionais");
  const { error } = await supabase
    .from("adicionais")
    .insert({ nome, preco, ordem });
  if (error) return { erro: error.message };

  revalidatePath("/admin/catalogo/adicionais");
  revalidatePath("/");
  revalidatePath("/cardapio");
  return { sucesso: true };
}

export async function atualizarAdicional(id: string, formData: FormData) {
  const nome = String(formData.get("nome") ?? "").trim();
  const preco = Number(formData.get("preco"));
  if (nome.length < 2 || !Number.isFinite(preco) || preco < 0) return;

  const supabase = await supabaseServer();
  await supabase.from("adicionais").update({ nome, preco }).eq("id", id);

  revalidatePath("/admin/catalogo/adicionais");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

export async function alternarAtivoAdicional(id: string, ativo: boolean) {
  const supabase = await supabaseServer();
  await supabase.from("adicionais").update({ ativo }).eq("id", id);
  revalidatePath("/admin/catalogo/adicionais");
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

// ---------- Produto <-> Adicionais permitidos ----------

export async function salvarAdicionaisPermitidos(
  produtoId: string,
  formData: FormData
) {
  const supabase = await supabaseServer();
  const permitidos: { adicional_id: string; max_qtd: number }[] = [];

  for (const [chave, valor] of formData.entries()) {
    if (chave.startsWith("marcado_") && valor === "on") {
      const adicionalId = chave.replace("marcado_", "");
      const maxQtd = Number(formData.get(`max_${adicionalId}`) ?? 5);
      permitidos.push({
        adicional_id: adicionalId,
        max_qtd: Number.isFinite(maxQtd) && maxQtd > 0 ? maxQtd : 5,
      });
    }
  }

  await supabase.from("produto_adicionais").delete().eq("produto_id", produtoId);
  if (permitidos.length > 0) {
    await supabase.from("produto_adicionais").insert(
      permitidos.map((p) => ({
        produto_id: produtoId,
        adicional_id: p.adicional_id,
        max_qtd: p.max_qtd,
      }))
    );
  }

  revalidatePath(`/admin/catalogo/produtos/${produtoId}`);
  revalidatePath("/admin/catalogo");
  revalidatePath("/");
  revalidatePath("/cardapio");
}

// ---------- Destaques (cards "queridinhos da galera" da home) ----------

export async function criarDestaque(
  _estado: EstadoAcao,
  formData: FormData
): Promise<EstadoAcao> {
  const produto_id = String(formData.get("produto_id") ?? "");
  const tag = String(formData.get("tag") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!produto_id) return { erro: "Escolha o produto." };
  if (tag.length < 2) return { erro: "Informe o selo (ex.: O favorito)." };
  if (descricao.length < 5) return { erro: "Informe a descrição." };

  const supabase = await supabaseServer();
  const ordem = await proximaOrdem("destaques");
  const { error } = await supabase
    .from("destaques")
    .insert({ produto_id, tag, descricao, ordem });
  if (error) return { erro: error.message };

  revalidatePath("/admin/catalogo/destaques");
  revalidatePath("/");
  return { sucesso: true };
}

export async function atualizarDestaque(id: string, formData: FormData) {
  const tag = String(formData.get("tag") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  if (tag.length < 2 || descricao.length < 5) return;

  const supabase = await supabaseServer();
  await supabase.from("destaques").update({ tag, descricao }).eq("id", id);

  revalidatePath("/admin/catalogo/destaques");
  revalidatePath("/");
}

export async function alternarAtivoDestaque(id: string, ativo: boolean) {
  const supabase = await supabaseServer();
  await supabase.from("destaques").update({ ativo }).eq("id", id);
  revalidatePath("/admin/catalogo/destaques");
  revalidatePath("/");
}

export async function removerDestaque(id: string) {
  const supabase = await supabaseServer();
  await supabase.from("destaques").delete().eq("id", id);
  revalidatePath("/admin/catalogo/destaques");
  revalidatePath("/");
}
