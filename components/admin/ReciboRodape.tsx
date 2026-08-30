// Rodapé fixo do cupom térmico — igual em qualquer recibo impresso (pedido
// único ou comanda).
export default function ReciboRodape() {
  return (
    <div className="flex flex-col gap-1 pt-3">
      <div className="text-[15px] font-extrabold tracking-[-.01em]">
        Obrigado pela preferência.
      </div>
      <div className="text-[10px] leading-[1.4] text-[#5c5856]">
        Dúvidas ou trocas: fale com a gente no WhatsApp em até 24h.
      </div>
      <div className="mt-1.5 text-[9px] font-bold uppercase tracking-[.14em]">
        Documento não fiscal
      </div>
    </div>
  );
}
