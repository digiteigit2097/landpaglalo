import QRCode from "qrcode";
import { buscarCardapio, buscarAdicionaisFlat } from "@/lib/cardapio";
import { catalogoFallback } from "@/lib/cardapio-fallback";
import { gerarPayloadPix } from "@/lib/pix";
import { supabaseServer } from "@/lib/supabase-server";
import CardapioImpresso from "@/components/admin/CardapioImpresso";
import ChavePixForm from "@/components/admin/ChavePixForm";

export const dynamic = "force-dynamic";

export default async function CardapioImpressoPage() {
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

  const supabase = await supabaseServer();
  const { data: config } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "chave_pix")
    .maybeSingle();
  const chavePix = config?.valor ?? "";

  let pixQrSvg: string | null = null;
  if (chavePix) {
    const payload = gerarPayloadPix({
      chave: chavePix,
      nome: "Dogao do Lalo",
      cidade: "Londrina",
    });
    // preto/branco puro — QR de pagamento precisa do contraste máximo.
    // margin 4 = quiet zone padrão (essencial pra leitura confiável impressa);
    // errorCorrectionLevel M dá boa tolerância sem deixar o QR denso demais.
    pixQrSvg = await QRCode.toString(payload, {
      type: "svg",
      margin: 4,
      width: 400,
      errorCorrectionLevel: "M",
      color: { dark: "#000000", light: "#ffffff" },
    });
  }

  return (
    <div>
      <div className="print:hidden">
        <ChavePixForm chaveAtual={chavePix} />
      </div>
      <CardapioImpresso
        categorias={categorias}
        opcionais={opcionais}
        pixQrSvg={pixQrSvg}
      />
    </div>
  );
}
