// Dados estáticos usados só se o Supabase estiver fora do ar.
// Fonte real do cardápio é o banco (tabelas categorias/produtos/...),
// editável pelo admin. Ver lib/cardapio.ts.
import { cheeses, hotdogs, bebidas, opcionais, destaques } from "./menu";
import type { Categoria, OpcionalFlat } from "./cardapio";

export function catalogoFallback(): {
  categorias: Categoria[];
  opcionais: OpcionalFlat[];
} {
  const categorias: Categoria[] = [
    {
      id: "fallback-cheese",
      nome: "Cheese",
      produtos: cheeses.map((c, i) => ({
        id: `fallback-cheese-${i}`,
        nome: c.nome,
        descricao: c.descricao,
        preco: c.precoNormal,
        variacoes: [
          { id: `fallback-cheese-${i}-normal`, nome: "Normal", preco: c.precoNormal },
          { id: `fallback-cheese-${i}-artesanal`, nome: "Artesanal", preco: c.precoArtesanal },
        ],
        adicionais: [],
      })),
    },
    {
      id: "fallback-hotdog",
      nome: "Hot Dog",
      produtos: hotdogs.map((h, i) => ({
        id: `fallback-hotdog-${i}`,
        nome: h.nome,
        descricao: h.descricao ?? null,
        preco: h.preco,
        variacoes: h.precoAlt
          ? [
              { id: `fallback-hotdog-${i}-normal`, nome: "Normal", preco: h.preco },
              {
                id: `fallback-hotdog-${i}-alt`,
                nome: h.precoAlt.label,
                preco: h.precoAlt.valor,
              },
            ]
          : [],
        adicionais: [],
      })),
    },
    {
      id: "fallback-bebidas",
      nome: "Bebidas",
      produtos: bebidas.map((b, i) => ({
        id: `fallback-bebidas-${i}`,
        nome: b.nome,
        descricao: null,
        preco: b.preco,
        variacoes: [],
        adicionais: [],
      })),
    },
  ];

  return {
    categorias,
    opcionais: opcionais.map((o, i) => ({
      id: `fallback-opcional-${i}`,
      nome: o.nome,
      preco: o.preco,
    })),
  };
}

export const destaquesFallback = destaques.map((d) => ({ ...d }));
