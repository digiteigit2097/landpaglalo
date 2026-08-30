import { ADDRESS_LINE1, PHONE_DISPLAY, CNPJ } from "@/lib/menu";

// Bloco fixo do topo do cupom térmico — nome da loja, endereço, WhatsApp e
// CNPJ. Igual em qualquer recibo impresso (pedido único ou comanda),
// nenhum dado do pedido entra aqui.
export default function ReciboCabecalho() {
  return (
    <>
      <div className="flex flex-col gap-[3px]">
        <div className="text-[8px] font-bold uppercase tracking-[.2em]">
          Delivery · Londrina/PR
        </div>
        <div className="text-[21px] font-extrabold uppercase leading-[.95] tracking-[-.02em]">
          Dogão
          <br />
          do Lalo
        </div>
      </div>

      <div className="my-3 h-[2px] bg-[#201e1d]" />

      <div className="flex flex-col gap-[2px] text-[10px] leading-[1.4]">
        <div>{ADDRESS_LINE1}</div>
        <div>Santa Mônica — CEP 86079-450</div>
        <div className="mt-1 flex gap-1.5">
          <span className="font-bold">WhatsApp</span>
          <span>{PHONE_DISPLAY}</span>
        </div>
        <div className="flex gap-1.5">
          <span className="font-bold">CNPJ</span>
          <span>{CNPJ}</span>
        </div>
      </div>
    </>
  );
}
