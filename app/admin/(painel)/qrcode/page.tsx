import Image from "next/image";
import QRCode from "qrcode";
import { supabaseServer } from "@/lib/supabase-server";
import DominioForm from "@/components/admin/DominioForm";
import BotaoImprimir from "@/components/admin/BotaoImprimir";

export const dynamic = "force-dynamic";

export default async function QrCodePage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("configuracoes")
    .select("valor")
    .eq("chave", "dominio_cardapio")
    .maybeSingle();

  const dominio = data?.valor ?? "";
  const url = dominio ? `${dominio}/cardapio` : "";

  const qrSvg = url
    ? await QRCode.toString(url, {
        type: "svg",
        margin: 1,
        width: 600,
        color: { dark: "#152a4a", light: "#fff7e6" },
      })
    : null;

  return (
    <div>
      <style>{`@page { size: A4; margin: 0; }`}</style>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy print:hidden">
        QR Code do cardápio
      </h1>
      <p className="mt-1 text-admin-navy/70 print:hidden">
        Gere o QR Code e imprima em A4 pra colar no balcão / mesas de apoio
      </p>

      <div className="mt-6 print:hidden">
        <DominioForm dominioAtual={dominio} />
      </div>

      {!qrSvg ? (
        <p className="mt-6 text-admin-navy/60 print:hidden">
          Configure o domínio acima pra gerar o QR Code.
        </p>
      ) : (
        <>
          <div className="mt-6 print:hidden">
            <BotaoImprimir />
          </div>

          <p className="mt-6 text-sm text-admin-navy/60 print:hidden">
            Prévia (reduzida) — a impressão sai em folha A4 inteira
          </p>

          {/* Área impressa — identidade pública, não a do admin */}
          <div
            id="area-impressao"
            className="mx-auto mt-2 flex aspect-[210/297] w-full max-w-[240px] flex-col items-center justify-between rounded-3xl bg-marinho p-5 text-center text-creme shadow-2xl print:m-0 print:aspect-auto print:w-[210mm] print:max-w-none print:rounded-none print:p-[15mm] print:shadow-none"
          >
            <div>
              <Image
                src="/brand/logo-principal.png"
                alt="Dogão do Lalo"
                width={220}
                height={165}
                className="mx-auto w-24 rounded-xl print:w-[45mm] print:rounded-2xl"
              />
              <h2 className="mt-3 font-display text-base font-extrabold print:mt-6 print:text-3xl">
                Peça pelo celular!
              </h2>
              <p className="mt-1 text-xs text-creme/85 print:mt-2 print:text-lg">
                Aponte a câmera pro QR Code abaixo
              </p>
            </div>

            <div
              className="w-28 rounded-xl bg-creme p-2 shadow-xl print:w-[100mm] print:rounded-3xl print:p-6 [&_svg]:h-auto [&_svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <div>
              <p className="font-display text-xs font-extrabold text-amarelo print:text-xl">
                Fast Delivery • PIX aceito
              </p>
              <p className="mt-1 text-[10px] text-creme/70 print:mt-2 print:text-sm">
                {url}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
