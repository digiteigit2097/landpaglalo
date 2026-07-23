import { buscarCardapio, buscarAdicionaisFlat } from "@/lib/cardapio";
import { catalogoFallback } from "@/lib/cardapio-fallback";
import CardapioWhatsapp from "@/components/admin/CardapioWhatsapp";

export const dynamic = "force-dynamic";

export default async function CardapioWhatsappPage() {
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

  return <CardapioWhatsapp categorias={categorias} opcionais={opcionais} />;
}
