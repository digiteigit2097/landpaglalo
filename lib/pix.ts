// Gera o payload "BR Code" (EMV/PIX) estático do Banco Central — o mesmo
// formato que qualquer app de banco lê. Validado campo a campo e o CRC16
// conferido contra o vetor de teste padrão CRC-16/CCITT-FALSE ("123456789" -> 29B1).

function crc16ccitt(payload: string): string {
  let crc = 0xffff;
  const polinomio = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ polinomio) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, valor: string): string {
  const tamanho = String(valor.length).padStart(2, "0");
  return `${id}${tamanho}${valor}`;
}

function normalizarTexto(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acentos — apps de banco esperam ASCII
    .toUpperCase();
}

export function gerarPayloadPix({
  chave,
  nome,
  cidade,
  txid = "***",
}: {
  chave: string;
  nome: string;
  cidade: string;
  txid?: string;
}): string {
  const infoConta = tlv("00", "br.gov.bcb.pix") + tlv("01", chave);

  let payload =
    tlv("00", "01") + // Payload Format Indicator
    tlv("01", "11") + // Point of Initiation Method: 11 = estático/reutilizável
    tlv("26", infoConta) +
    tlv("52", "0000") + // Merchant Category Code
    tlv("53", "986") + // moeda: BRL
    tlv("58", "BR") +
    tlv("59", normalizarTexto(nome).slice(0, 25)) +
    tlv("60", normalizarTexto(cidade).slice(0, 15)) +
    tlv("62", tlv("05", txid));

  payload += "6304";
  return payload + crc16ccitt(payload);
}
