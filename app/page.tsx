import Image from "next/image";
import Cardapio from "@/components/Cardapio";
import {
  WHATSAPP_LINK,
  PHONE_DISPLAY,
  FACEBOOK_LINK,
  ADDRESS,
  MAPS_LINK,
  MAPS_EMBED,
  formatPreco,
} from "@/lib/menu";
import { buscarCardapio, buscarAdicionaisFlat, buscarDestaques } from "@/lib/cardapio";
import { catalogoFallback, destaquesFallback } from "@/lib/cardapio-fallback";

export const revalidate = 60;

async function carregarPagina() {
  try {
    const [categorias, opcionais, destaquesDb] = await Promise.all([
      buscarCardapio(),
      buscarAdicionaisFlat(),
      buscarDestaques(),
    ]);
    if (categorias.length === 0) throw new Error("cardápio vazio no banco");

    return {
      categorias,
      opcionais,
      destaques: destaquesDb.length > 0 ? destaquesDb : destaquesFallback,
    };
  } catch {
    const fallback = catalogoFallback();
    return {
      categorias: fallback.categorias,
      opcionais: fallback.opcionais,
      destaques: destaquesFallback,
    };
  }
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.1c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.13.82.84-3.06-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.24 8.25Zm4.52-6.16c-.25-.13-1.47-.72-1.7-.8-.22-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25 0-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
    </svg>
  );
}

export default async function Home() {
  const { categorias, opcionais, destaques } = await carregarPagina();

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-marinho shadow-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <a href="#inicio" className="flex items-center">
            <Image
              src="/brand/logo-principal.png"
              alt="Dogão do Lalo"
              width={160}
              height={120}
              className="h-12 w-auto rounded-lg"
              priority
            />
          </a>
          <nav className="hidden items-center gap-6 font-display text-sm font-bold text-creme sm:flex">
            <a
              href="#cardapio"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho hover:text-amarelo"
            >
              Cardápio
            </a>
            <a
              href="#como-pedir"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho hover:text-amarelo"
            >
              Como pedir
            </a>
            <a
              href="#localizacao"
              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho hover:text-amarelo"
            >
              Onde estamos
            </a>
          </nav>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-full bg-amarelo px-4 py-2 font-display text-sm font-bold text-marinho transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-marinho"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Pedir agora
          </a>
        </div>
      </header>

      <main id="inicio" className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-marinho text-creme">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-azul/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-vermelho/20 blur-3xl"
          />
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-12 sm:grid-cols-2 sm:py-20">
            <div className="text-center sm:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-amarelo px-4 py-1.5 font-display text-sm font-bold uppercase tracking-wide text-marinho">
                🚀 Fast Delivery
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
                O dogão mais <span className="text-amarelo">estiloso</span> de
                Londrina
              </h1>
              <p className="mt-4 text-lg text-creme/80">
                Hot dogs caprichados e cheese burgers artesanais, feitos na hora
                e entregues rapidinho. Aceitamos{" "}
                <strong className="text-amarelo">PIX</strong>!
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amarelo px-8 py-4 font-display text-lg font-extrabold text-marinho shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-marinho sm:w-auto"
                >
                  <WhatsAppIcon className="h-6 w-6" />
                  Pedir no WhatsApp
                </a>
                <a
                  href="#cardapio"
                  className="inline-flex w-full items-center justify-center rounded-full border-2 border-creme/40 px-8 py-4 font-display text-lg font-bold text-creme transition-colors hover:border-amarelo hover:text-amarelo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho sm:w-auto"
                >
                  Ver cardápio
                </a>
              </div>
              <p className="mt-4 font-display text-2xl font-extrabold tracking-wide tabular-nums text-amarelo">
                {PHONE_DISPLAY}
              </p>
            </div>
            <div className="relative mx-auto w-56 sm:w-full sm:max-w-sm">
              <div
                aria-hidden
                className="absolute inset-0 scale-90 rounded-full bg-amarelo/15 blur-2xl"
              />
              <Image
                src="/brand/mascote.png"
                alt="Mascote do Dogão do Lalo: hot dog de óculos escuros e boné fazendo joia"
                width={512}
                height={512}
                className="relative drop-shadow-2xl"
                priority
              />
            </div>
          </div>
          <div aria-hidden className="toldo h-4" />
        </section>

        {/* Destaques */}
        <section className="bg-amarelo py-14 sm:py-20">
          <div className="mx-auto max-w-5xl px-4">
            <div className="text-center">
              <h2 className="font-display text-3xl font-extrabold text-marinho sm:text-4xl">
                Os queridinhos da galera
              </h2>
              <p className="mt-2 text-marinho/70">
                Não sabe por onde começar? Vai de um desses:
              </p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {destaques.map((item) => (
                <div
                  key={item.nome}
                  className="flex flex-col rounded-3xl bg-white p-6 shadow-lg ring-1 ring-marinho/10"
                >
                  <span className="self-start rounded-full bg-vermelho-texto px-3 py-1 font-display text-xs font-bold uppercase tracking-wide text-creme">
                    {item.tag}
                  </span>
                  <h3 className="mt-3 font-display text-xl font-extrabold text-marinho">
                    {item.nome}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-marinho/70">
                    {item.descricao}
                  </p>
                  <p className="mt-4 font-display text-2xl font-extrabold tabular-nums text-vermelho-texto">
                    {formatPreco(item.preco)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cardápio */}
        <Cardapio categorias={categorias} opcionais={opcionais} />

        {/* Como pedir */}
        <section
          id="como-pedir"
          className="scroll-mt-20 bg-marinho py-14 text-creme sm:py-20"
        >
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
              Pedir é <span className="text-amarelo">rapidinho</span>
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {[
                {
                  passo: "1",
                  titulo: "Chama no WhatsApp",
                  texto: `Manda mensagem no ${PHONE_DISPLAY} com o seu pedido`,
                },
                {
                  passo: "2",
                  titulo: "Paga como preferir",
                  texto: "Aceitamos PIX pra facilitar sua vida",
                },
                {
                  passo: "3",
                  titulo: "Recebe voando",
                  texto: "Fast delivery pra chegar quentinho na sua casa",
                },
              ].map((s) => (
                <div key={s.passo} className="flex flex-col items-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amarelo font-display text-2xl font-extrabold text-marinho">
                    {s.passo}
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold">
                    {s.titulo}
                  </h3>
                  <p className="mt-2 text-creme/75">{s.texto}</p>
                </div>
              ))}
            </div>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-amarelo px-8 py-4 font-display text-lg font-extrabold text-marinho shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creme focus-visible:ring-offset-2 focus-visible:ring-offset-marinho"
            >
              <WhatsAppIcon className="h-6 w-6" />
              Fazer meu pedido
            </a>
          </div>
        </section>

        {/* Localização */}
        <section
          id="localizacao"
          className="scroll-mt-20 bg-creme py-14 sm:py-20"
        >
          <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 sm:grid-cols-2">
            <div className="text-center sm:text-left">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Onde estamos
              </h2>
              <p className="mt-4 flex items-start justify-center gap-2 text-marinho/80 sm:justify-start">
                <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-vermelho" />
                <span>{ADDRESS}</span>
              </p>
              <a
                href={MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-marinho px-6 py-3 font-display font-bold text-creme transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marinho focus-visible:ring-offset-2 focus-visible:ring-offset-creme"
              >
                <PinIcon className="h-5 w-5 text-amarelo" />
                Abrir no Google Maps
              </a>
            </div>
            <div className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-marinho/10">
              <iframe
                src={MAPS_EMBED}
                title="Mapa: Dogão do Lalo em Londrina"
                className="h-72 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-marinho-escuro pb-24 pt-10 text-creme sm:pb-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center">
          <Image
            src="/brand/logo-principal.png"
            alt="Dogão do Lalo"
            width={180}
            height={135}
            className="h-16 w-auto rounded-xl"
          />
          <p className="text-sm text-creme/70">{ADDRESS}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-display font-bold text-amarelo hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho-escuro"
            >
              WhatsApp {PHONE_DISPLAY}
            </a>
            <span aria-hidden className="text-creme/40">
              •
            </span>
            <a
              href={FACEBOOK_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded font-display font-bold text-amarelo hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amarelo focus-visible:ring-offset-2 focus-visible:ring-offset-marinho-escuro"
            >
              Facebook
            </a>
          </div>
          <p className="text-xs text-creme/50">
            © {new Date().getFullYear()} Dogão do Lalo — Londrina, PR
          </p>
        </div>
      </footer>

      {/* Botão WhatsApp fixo (mobile) */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Pedir pelo WhatsApp"
        className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 font-display text-lg font-extrabold text-white shadow-2xl transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 sm:hidden"
      >
        <WhatsAppIcon className="h-6 w-6" />
        Pedir pelo WhatsApp
      </a>
    </>
  );
}
