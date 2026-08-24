export const WHATSAPP_NUMBER = "5543996242893";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Olá! Quero fazer um pedido no Dogão do Lalo 🌭"
)}`;
export const PHONE_DISPLAY = "(43) 99624-2893";
export const FACEBOOK_LINK =
  "https://www.facebook.com/p/Dog%C3%A3o-Do-Lalo-100079507205536/";
export const ADDRESS =
  "Av. Henrique Mansano, 1490 - Loja 02 - Santa Mônica, Londrina - PR, 86079-450";
export const ADDRESS_LINE1 = "Av. Henrique Mansano, 1490 - Loja 02";
export const ADDRESS_LINE2 = "Santa Mônica - Londrina/PR - CEP 86079-450";
export const CNPJ = "24.725.254/0001-35";
export const SITE_DOMINIO = "dogaodolalo.com.br";
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  "Dogão do Lalo - " + ADDRESS
)}`;
export const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  ADDRESS
)}&output=embed`;

export type CheeseItem = {
  nome: string;
  descricao: string;
  precoNormal: number;
  precoArtesanal: number;
};

export type SimpleItem = {
  nome: string;
  descricao?: string;
  preco: number;
  precoAlt?: { label: string; valor: number };
};

export const cheeses: CheeseItem[] = [
  {
    nome: "X-Burguer",
    descricao: "Hambúrguer, mussarela, presunto, maionese, catchup e mostarda",
    precoNormal: 13,
    precoArtesanal: 16,
  },
  {
    nome: "X-Salada",
    descricao:
      "Hambúrguer, mussarela, presunto, tomate, alface, maionese, catchup e mostarda",
    precoNormal: 16,
    precoArtesanal: 20,
  },
  {
    nome: "X-Bacon",
    descricao:
      "Hambúrguer, bacon, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 20,
    precoArtesanal: 23,
  },
  {
    nome: "X-Egg",
    descricao:
      "Hambúrguer, 2 ovos, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 20,
    precoArtesanal: 22,
  },
  {
    nome: "X-Frango",
    descricao:
      "Hambúrguer, frango, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 20,
    precoArtesanal: 23,
  },
  {
    nome: "X-Frango Bacon",
    descricao:
      "Hambúrguer, frango, bacon, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 24,
    precoArtesanal: 27,
  },
  {
    nome: "X-Calabresa",
    descricao:
      "Hambúrguer, calabresa, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 20,
    precoArtesanal: 22,
  },
  {
    nome: "X-Egg Bacon",
    descricao:
      "Hambúrguer, bacon, 2 ovos, mussarela, presunto, tomate, alface, catchup, maionese e mostarda",
    precoNormal: 24,
    precoArtesanal: 27,
  },
  {
    nome: "X-Tudo",
    descricao:
      "Hambúrguer, salsicha, bacon, ovo, frango, calabresa, mussarela, presunto, tomate, alface, batata palha, catchup, maionese e mostarda",
    precoNormal: 30,
    precoArtesanal: 34,
  },
];

export const hotdogs: SimpleItem[] = [
  {
    nome: "Dog Simples",
    descricao: "Salsicha, tomate, batata palha, maionese, catchup e mostarda",
    preco: 11,
  },
  {
    nome: "Dog Duplo",
    descricao: "2 salsichas, tomate, batata palha, maionese, catchup e mostarda",
    preco: 13,
  },
  {
    nome: "Dog Queijo",
    descricao: "Queijo, salsicha, tomate, maionese, catchup e mostarda",
    preco: 15,
  },
  {
    nome: "Dog Frios",
    descricao: "Queijo, presunto, salsicha, tomate, maionese, catchup e mostarda",
    preco: 17,
  },
  {
    nome: "Dog Egg",
    descricao: "Ovo, salsicha, tomate, maionese, catchup e mostarda",
    preco: 15,
  },
  {
    nome: "Dog Frango",
    descricao: "Frango, salsicha, tomate, maionese, catchup e mostarda",
    preco: 17,
  },
  {
    nome: "Dog Frango Duplo",
    descricao: "Frango, 2 salsichas, tomate, maionese, catchup e mostarda",
    preco: 20,
  },
  {
    nome: "Dog Bacon",
    descricao: "Salsicha, bacon, tomate, maionese, catchup e mostarda",
    preco: 17,
  },
  {
    nome: "Dog Bacon Duplo",
    descricao: "2 salsichas, bacon, tomate, maionese, catchup e mostarda",
    preco: 20,
  },
  {
    nome: "Dog Burguer",
    descricao: "Salsicha, hambúrguer, tomate, maionese, catchup e mostarda",
    preco: 16,
    precoAlt: { label: "Artesanal", valor: 18 },
  },
  {
    nome: "Dog Calabresa",
    descricao: "Calabresa, salsicha, tomate, maionese, catchup e mostarda",
    preco: 17,
  },
  {
    nome: "Dog Frango Bacon",
    descricao: "Bacon, frango, salsicha, tomate, maionese, catchup e mostarda",
    preco: 20,
  },
  {
    nome: "Dogão do Lalo",
    descricao:
      "Frango, bacon, mussarela, salsicha, tomate, maionese, catchup e mostarda",
    preco: 22,
  },
  {
    nome: "Dogão do Lalo Especial",
    descricao:
      "Frango, bacon, mussarela, salsicha, tomate, maionese, catchup, mostarda e hambúrguer artesanal",
    preco: 27,
  },
];

export const bebidas: SimpleItem[] = [
  { nome: "Coca-Cola Zero 600 ml", preco: 7 },
  { nome: "Coca-Cola Zero lata 350 ml", preco: 6 },
  { nome: "Coca-Cola 2 litros", preco: 13 },
  { nome: "Refriço 2 litros", preco: 9 },
  { nome: "Coca-Cola lata 350 ml", preco: 6 },
  { nome: "Guaraná 350 ml", preco: 6 },
  { nome: "Fanta lata 350 ml", preco: 6 },
  { nome: "Suco laranja 1 litro", preco: 13 },
  { nome: "Suco laranja Frutarelle 330 ml", preco: 7 },
  { nome: "Suco maracujá Frutarelle 1 litro", preco: 13 },
  { nome: "Suco maracujá Frutarelle 330 ml", preco: 7 },
];

export const opcionais: SimpleItem[] = [
  { nome: "Ovo, salsicha ou presunto", preco: 1 },
  { nome: "Queijo ou hambúrguer", preco: 4 },
  { nome: "Frango ou calabresa", preco: 6 },
  { nome: "Bacon", preco: 7 },
  { nome: "Batata palha", preco: 2 },
  { nome: "Molho verde", preco: 1 },
  { nome: "Molho pimenta", preco: 1 },
  { nome: "Tomate", preco: 1 },
  { nome: "Alface", preco: 1 },
  { nome: "Hambúrguer artesanal", preco: 7 },
];

export const destaques = [
  {
    nome: "Dogão do Lalo Especial",
    descricao:
      "O carro-chefe da casa: frango, bacon, mussarela, salsicha e hambúrguer artesanal",
    preco: 27,
    tag: "O favorito",
  },
  {
    nome: "X-Tudo",
    descricao:
      "Pra matar a fome de verdade: salsicha, bacon, ovo, frango, calabresa e muito mais",
    preco: 30,
    tag: "Mais completo",
  },
  {
    nome: "Dog Simples",
    descricao: "O clássico que nunca falha, com batata palha crocante",
    preco: 11,
    tag: "A partir de",
  },
] as const;

export function formatPreco(valor: number) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}
