import type { Metadata } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Dogão do Lalo — Hot Dog e Lanches em Londrina",
  description:
    "O melhor dogão de Londrina! Hot dogs, cheese burgers artesanais, fast delivery e pagamento por PIX. Peça pelo WhatsApp (43) 99624-2893. Av. Henrique Mansano, 1490 - Santa Mônica.",
  keywords: [
    "hot dog Londrina",
    "dogão Londrina",
    "lanche delivery Londrina",
    "Dogão do Lalo",
    "hambúrguer artesanal Londrina",
  ],
  openGraph: {
    title: "Dogão do Lalo — Hot Dog e Lanches em Londrina",
    description:
      "Hot dogs e cheese burgers artesanais com fast delivery. Peça pelo WhatsApp!",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${baloo.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
