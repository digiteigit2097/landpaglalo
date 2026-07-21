import type { Metadata } from "next";
import { buscarCardapio, buscarAdicionaisFlat } from "@/lib/cardapio";
import { catalogoFallback } from "@/lib/cardapio-fallback";
import CardapioCliente from "@/components/pedido/CardapioCliente";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Cardápio — Dogão do Lalo",
  description: "Peça direto do seu celular no Dogão do Lalo.",
  robots: { index: false },
};

export default async function CardapioPage() {
  let categorias, opcionais;
  try {
    [categorias, opcionais] = await Promise.all([
      buscarCardapio(),
      buscarAdicionaisFlat(),
    ]);
    if (categorias.length === 0) throw new Error("cardápio vazio no banco");
  } catch {
    const fallback = catalogoFallback();
    categorias = fallback.categorias;
    opcionais = fallback.opcionais;
  }

  return <CardapioCliente categorias={categorias} opcionais={opcionais} />;
}
