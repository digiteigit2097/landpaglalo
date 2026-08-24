import { supabaseAnon } from "./supabase";

export type Adicional = {
  id: string;
  nome: string;
  preco: number;
  maxQtd: number;
};

export type Variacao = {
  id: string;
  nome: string;
  preco: number;
};

export type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  variacoes: Variacao[];
  adicionais: Adicional[];
};

export type Categoria = {
  id: string;
  nome: string;
  produtos: Produto[];
};

type CategoriaRow = {
  id: string;
  nome: string;
  ordem: number;
  produtos: {
    id: string;
    nome: string;
    descricao: string | null;
    preco: number;
    ordem: number;
    mostrar_adicionais: boolean;
    produto_variacoes: { id: string; nome: string; preco: number; ordem: number }[];
    produto_adicionais: {
      max_qtd: number;
      adicionais: { id: string; nome: string; preco: number; ordem: number } | null;
    }[];
  }[];
};

export async function buscarCardapio(): Promise<Categoria[]> {
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from("categorias")
    .select(
      `id, nome, ordem,
       produtos (
         id, nome, descricao, preco, ordem, mostrar_adicionais,
         produto_variacoes ( id, nome, preco, ordem ),
         produto_adicionais ( max_qtd, adicionais ( id, nome, preco, ordem ) )
       )`
    )
    .order("ordem")
    .returns<CategoriaRow[]>();

  if (error) throw error;

  return (data ?? []).map((cat) => ({
    id: cat.id,
    nome: cat.nome,
    produtos: [...cat.produtos]
      .sort((a, b) => a.ordem - b.ordem)
      .map((p) => ({
        id: p.id,
        nome: p.nome,
        descricao: p.descricao,
        preco: Number(p.preco),
        variacoes: [...p.produto_variacoes]
          .sort((a, b) => a.ordem - b.ordem)
          .map((v) => ({ id: v.id, nome: v.nome, preco: Number(v.preco) })),
        adicionais: !p.mostrar_adicionais
          ? []
          : p.produto_adicionais
              .filter((pa) => pa.adicionais)
              .map((pa) => ({
                id: pa.adicionais!.id,
                nome: pa.adicionais!.nome,
                preco: Number(pa.adicionais!.preco),
                maxQtd: pa.max_qtd,
                ordem: pa.adicionais!.ordem,
              }))
              .sort((a, b) => a.ordem - b.ordem)
              .map(({ ordem: _ordem, ...a }) => a),
      })),
  }));
}

export type OpcionalFlat = {
  id: string;
  nome: string;
  preco: number;
};

export type Destaque = {
  id: string;
  tag: string;
  descricao: string;
  nome: string;
  preco: number;
};

type DestaqueRow = {
  id: string;
  tag: string;
  descricao: string;
  ordem: number;
  produtos: { nome: string; preco: number; ativo: boolean } | null;
};

export async function buscarDestaques(): Promise<Destaque[]> {
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from("destaques")
    .select("id, tag, descricao, ordem, produtos ( nome, preco, ativo )")
    .eq("ativo", true)
    .order("ordem")
    .returns<DestaqueRow[]>();
  if (error) throw error;
  return (data ?? [])
    .filter((d) => d.produtos?.ativo)
    .map((d) => ({
      id: d.id,
      tag: d.tag,
      descricao: d.descricao,
      nome: d.produtos!.nome,
      preco: Number(d.produtos!.preco),
    }));
}

export async function buscarAdicionaisFlat(): Promise<OpcionalFlat[]> {
  const supabase = supabaseAnon();
  const { data, error } = await supabase
    .from("adicionais")
    .select("id, nome, preco, ordem")
    .eq("ativo", true)
    .order("ordem");
  if (error) throw error;
  return (data ?? []).map((a) => ({
    id: a.id as string,
    nome: a.nome as string,
    preco: Number(a.preco),
  }));
}

