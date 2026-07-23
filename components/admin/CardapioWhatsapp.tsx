"use client";

import { useRef, useState } from "react";
import { toJpeg } from "html-to-image";
import { Download, Loader2 } from "lucide-react";
import { formatPreco, PHONE_DISPLAY, ADDRESS } from "@/lib/menu";
import type { Categoria, OpcionalFlat, Produto } from "@/lib/cardapio";

// largura de exibição reduzida; o JPG exportado sai em LARGURA_EXPORT (nítido
// pra zoom no WhatsApp sem pesar demais o arquivo). Cada bloco vira uma
// imagem separada — uma imagem só com o cardápio inteiro fica alta e
// estreita demais, o WhatsApp encolhe pra caber na tela e o texto sai
// minúsculo, com barras pretas na lateral.
const LARGURA_BASE = 720;
const LARGURA_EXPORT = 1080;

async function gerarJpg(node: HTMLElement) {
  const opcoes = {
    cacheBust: true,
    backgroundColor: "#fff7e6",
    pixelRatio: LARGURA_EXPORT / LARGURA_BASE,
    quality: 0.92,
    style: { margin: "0" },
  };
  // primeira chamada "esquenta" o cache de imagens/fontes no clone;
  // a segunda gera o JPG final correto (mesmo workaround do PNG do
  // cardápio impresso).
  await toJpeg(node, opcoes);
  return toJpeg(node, opcoes);
}

function baixarDataUrl(dataUrl: string, nomeArquivo: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function variacaoAlternativa(produto: Produto) {
  if (produto.variacoes.length < 2) return null;
  return (
    produto.variacoes.find((v) => v.preco !== produto.preco) ??
    produto.variacoes[1]
  );
}

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 inline-block rounded-lg bg-marinho px-4 py-1.5 font-display text-xl font-extrabold uppercase tracking-wide text-amarelo">
      {children}
    </h2>
  );
}

function LinhaNormalArtesanal() {
  return (
    <p className="mb-1 text-right text-xs font-extrabold uppercase tracking-wide text-marinho/70">
      Normal <span className="text-marinho/40">/</span> Artesanal
    </p>
  );
}

function ItemCheese({ produto }: { produto: Produto }) {
  const normal =
    produto.variacoes.find((v) => v.nome === "Normal") ?? {
      nome: "Normal",
      preco: produto.preco,
    };
  const artesanal =
    produto.variacoes.find((v) => v.nome !== "Normal") ?? {
      nome: "Artesanal",
      preco: produto.preco,
    };
  return (
    <div className="border-b border-marinho/10 py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-base font-bold leading-tight text-marinho">
          {produto.nome}
        </p>
        <p className="shrink-0 font-display text-base font-extrabold tabular-nums text-vermelho-texto">
          {formatPreco(normal.preco)}
          <span className="text-marinho/40"> / </span>
          {formatPreco(artesanal.preco)}
        </p>
      </div>
      {produto.descricao && (
        <p className="mt-0.5 text-xs leading-snug text-marinho/60">
          {produto.descricao}
        </p>
      )}
    </div>
  );
}

function ItemSimples({ produto }: { produto: Produto }) {
  const alt = variacaoAlternativa(produto);
  return (
    <div className="border-b border-marinho/10 py-2.5 last:border-b-0">
      {alt && <LinhaNormalArtesanal />}
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-display text-base font-bold leading-tight text-marinho">
          {produto.nome}
        </p>
        <p className="shrink-0 font-display text-base font-extrabold tabular-nums text-vermelho-texto">
          {formatPreco(produto.preco)}
          {alt && (
            <>
              <span className="text-marinho/40"> / </span>
              {formatPreco(alt.preco)}
            </>
          )}
        </p>
      </div>
      {produto.descricao && (
        <p className="mt-0.5 text-xs leading-snug text-marinho/60">
          {produto.descricao}
        </p>
      )}
    </div>
  );
}

function ItemOpcional({ item }: { item: OpcionalFlat }) {
  return (
    <div className="flex items-baseline justify-between gap-2 border-b border-marinho/10 py-2 last:border-b-0">
      <p className="font-semibold text-marinho">{item.nome}</p>
      <p className="shrink-0 font-bold tabular-nums text-vermelho-texto">
        {formatPreco(item.preco)}
      </p>
    </div>
  );
}

function CabecalhoBloco({ subtitulo }: { subtitulo: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-marinho px-6 py-6 text-center">
      <img
        src="/brand/logo-principal.png"
        alt="Dogão do Lalo"
        className="h-14 w-auto rounded-xl"
        crossOrigin="anonymous"
      />
      <p className="font-display text-lg font-extrabold text-amarelo">
        Cardápio — {subtitulo}
      </p>
      <p className="font-display text-sm font-bold tabular-nums text-creme">
        {PHONE_DISPLAY}
      </p>
    </div>
  );
}

function RodapeBloco() {
  return (
    <div className="bg-marinho px-6 py-3 text-center">
      <p className="text-xs font-bold text-amarelo">{ADDRESS}</p>
    </div>
  );
}

type Bloco = {
  id: string;
  nome: string;
  arquivo: string;
  render: () => React.ReactNode;
};

function useExportarBloco() {
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function exportar(node: HTMLElement | null, arquivo: string) {
    if (!node) return;
    setGerando(true);
    setErro(null);
    try {
      const dataUrl = await gerarJpg(node);
      baixarDataUrl(dataUrl, arquivo);
    } catch (e) {
      console.error("Falha ao gerar JPG do cardápio:", e);
      setErro("Não foi possível gerar o JPG. Tenta de novo.");
    } finally {
      setGerando(false);
    }
  }

  return { gerando, erro, exportar };
}

function CartaoBloco({ bloco }: { bloco: Bloco }) {
  const ref = useRef<HTMLDivElement>(null);
  const { gerando, erro, exportar } = useExportarBloco();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold text-admin-navy">
          {bloco.nome}
        </h2>
        <button
          type="button"
          onClick={() => exportar(ref.current, bloco.arquivo)}
          disabled={gerando}
          className="flex min-h-11 items-center gap-2 rounded-full bg-admin-dourado px-5 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
        >
          {gerando ? (
            <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
          ) : (
            <Download aria-hidden className="h-4 w-4" strokeWidth={2.5} />
          )}
          {gerando ? "Gerando..." : "Baixar JPG"}
        </button>
      </div>

      {erro && (
        <p role="alert" className="mt-2 text-sm font-semibold text-vermelho-texto">
          {erro}
        </p>
      )}

      <div className="mt-3 flex justify-center overflow-x-auto rounded-xl bg-admin-navy/5 p-4">
        <div
          ref={ref}
          className="shrink-0 bg-creme text-marinho shadow-2xl"
          style={{ width: LARGURA_BASE }}
        >
          {bloco.render()}
        </div>
      </div>
    </div>
  );
}

export default function CardapioWhatsapp({
  categorias,
  opcionais,
}: {
  categorias: Categoria[];
  opcionais: OpcionalFlat[];
}) {
  const cheese = categorias.find((c) => c.nome === "Cheese");
  const hotDog = categorias.find((c) => c.nome === "Hot Dog");
  const outras = categorias.filter((c) => c.nome !== "Cheese" && c.nome !== "Hot Dog");

  const blocos: Bloco[] = [];

  if (cheese) {
    blocos.push({
      id: cheese.id,
      nome: "Cheese",
      arquivo: "cardapio-dogao-do-lalo-cheese.jpg",
      render: () => (
        <>
          <CabecalhoBloco subtitulo="Cheese" />
          <div className="px-6 py-6">
            <TituloSecao>Cheese</TituloSecao>
            <LinhaNormalArtesanal />
            <div>
              {cheese.produtos.map((p) => (
                <ItemCheese key={p.id} produto={p} />
              ))}
            </div>
          </div>
          <RodapeBloco />
        </>
      ),
    });
  }

  if (hotDog) {
    blocos.push({
      id: hotDog.id,
      nome: "Hot Dog",
      arquivo: "cardapio-dogao-do-lalo-hotdog.jpg",
      render: () => (
        <>
          <CabecalhoBloco subtitulo="Hot Dog" />
          <div className="px-6 py-6">
            <TituloSecao>Hot Dog</TituloSecao>
            <div>
              {hotDog.produtos.map((p) => (
                <ItemSimples key={p.id} produto={p} />
              ))}
            </div>
          </div>
          <RodapeBloco />
        </>
      ),
    });
  }

  if (outras.length > 0 || opcionais.length > 0) {
    blocos.push({
      id: "bebidas-opcionais",
      nome: "Bebidas e Opcionais",
      arquivo: "cardapio-dogao-do-lalo-bebidas-opcionais.jpg",
      render: () => (
        <>
          <CabecalhoBloco subtitulo="Bebidas e Opcionais" />
          <div className="px-6 py-6">
            {outras.map((cat) => (
              <section key={cat.id} className="mb-6">
                <TituloSecao>{cat.nome}</TituloSecao>
                <div>
                  {cat.produtos.map((p) => (
                    <ItemSimples key={p.id} produto={p} />
                  ))}
                </div>
              </section>
            ))}
            {opcionais.length > 0 && (
              <section>
                <TituloSecao>Opcionais</TituloSecao>
                <div>
                  {opcionais.map((o) => (
                    <ItemOpcional key={o.id} item={o} />
                  ))}
                </div>
              </section>
            )}
          </div>
          <RodapeBloco />
        </>
      ),
    });
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-admin-navy">
        Cardápio pra WhatsApp
      </h1>
      <p className="mt-1 text-admin-navy/70">
        3 imagens separadas (Cheese, Hot Dog, Bebidas e Opcionais) — coluna
        única, do tamanho certo pra ler sem precisar dar zoom
      </p>

      <div className="mt-6 space-y-8">
        {blocos.map((bloco) => (
          <CartaoBloco key={bloco.id} bloco={bloco} />
        ))}
      </div>
    </div>
  );
}
