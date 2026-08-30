// QR do cardápio online, no rodapé do cupom — igual em qualquer recibo
// impresso (pedido único ou comanda).
export default function ReciboQrCardapio({
  qrSvg,
  site,
}: {
  qrSvg: string;
  site: string;
}) {
  return (
    <div className="flex gap-2 py-3.5">
      <div
        className="flex h-20 w-20 flex-none items-center justify-center border-2 border-[#201e1d] p-1 [&_svg]:h-full [&_svg]:w-full"
        dangerouslySetInnerHTML={{ __html: qrSvg }}
      />
      <div className="flex min-w-0 flex-col gap-1 pt-0.5">
        <div className="text-[9px] font-bold uppercase tracking-[.14em]">
          Cardápio online
        </div>
        <div className="text-[10px] leading-[1.35]">
          Aponte a câmera para pedir de novo em 30 segundos.
        </div>
        <div className="text-[10px] font-bold">{site}</div>
      </div>
    </div>
  );
}
