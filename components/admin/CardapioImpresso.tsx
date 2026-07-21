"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { formatPreco, PHONE_DISPLAY, ADDRESS } from "@/lib/menu";
import type { Categoria, OpcionalFlat, Produto } from "@/lib/cardapio";

// preview em 700px, exportado em 3508px (paisagem A4 @300dpi) — fator ~5
const LARGURA = 3508;
const ALTURA = 2480;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.39a9.87 9.87 0 0 0 4.74 1.21c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2Zm0 18.1c-1.48 0-2.94-.4-4.2-1.15l-.3-.18-3.13.82.84-3.06-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 4.54 0 8.24 3.7 8.24 8.24 0 4.55-3.7 8.25-8.24 8.25Zm4.52-6.16c-.25-.13-1.47-.72-1.7-.8-.22-.09-.39-.13-.55.12-.17.25-.64.8-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.38-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.25 0-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.84-.2-.48-.4-.42-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

function variacaoAlternativa(produto: Produto) {
  if (produto.variacoes.length < 2) return null;
  return (
    produto.variacoes.find((v) => v.preco !== produto.preco) ??
    produto.variacoes[1]
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
    <div className="mb-[1px]">
      <div className="flex items-baseline justify-between gap-1">
        <p className="text-[9px] font-bold leading-tight text-marinho">
          {produto.nome}
        </p>
        <p className="shrink-0 text-[9px] font-bold tabular-nums text-vermelho-texto">
          {formatPreco(normal.preco)}
          <span className="text-marinho/50"> / </span>
          {formatPreco(artesanal.preco)}
        </p>
      </div>
      {produto.descricao && (
        <p className="text-[5px] leading-snug text-marinho/60">
          {produto.descricao}
        </p>
      )}
    </div>
  );
}

function ItemSimples({ produto }: { produto: Produto }) {
  const alt = variacaoAlternativa(produto);
  return (
    <div className="mb-[1px]">
      <div className="flex items-baseline justify-between gap-1">
        <p className="text-[9px] font-bold leading-tight text-marinho">
          {produto.nome}
        </p>
        <p className="shrink-0 text-[9px] font-bold tabular-nums text-vermelho-texto">
          {formatPreco(produto.preco)}
          {alt && (
            <>
              <span className="text-marinho/50"> / </span>
              {formatPreco(alt.preco)}
            </>
          )}
        </p>
      </div>
      {produto.descricao && (
        <p className="text-[5px] leading-snug text-marinho/60">
          {produto.descricao}
        </p>
      )}
    </div>
  );
}

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-[4px] inline-block rounded-[3px] bg-marinho px-[6px] py-[1px] text-[9px] font-extrabold uppercase tracking-wide text-amarelo">
      {children}
    </h3>
  );
}

type Bloco =
  | { tipo: "categoria"; categoria: Categoria }
  | { tipo: "opcionais"; itens: OpcionalFlat[] };

function pesoBloco(b: Bloco): number {
  if (b.tipo === "categoria") {
    const temDescricao = b.categoria.produtos.some((p) => p.descricao);
    return b.categoria.produtos.length * (temDescricao ? 2 : 1.1) + 1;
  }
  return b.itens.length * 1 + 1;
}

// distribuição em N colunas via "maior peso primeiro" (LPT bin-packing) —
// dá um balanceamento bem melhor que greedy na ordem original, que deixava
// um bloco grande (ex.: Hot Dog) desequilibrar tudo. Depois reordena cada
// coluna de volta à ordem original das categorias, só pra leitura ficar
// natural (não afeta o peso/balanceamento).
function distribuirColunas(blocos: Bloco[], numColunas: number): Bloco[][] {
  const comIndice = blocos.map((b, indiceOriginal) => ({ b, indiceOriginal }));
  const ordenados = [...comIndice].sort(
    (x, y) => pesoBloco(y.b) - pesoBloco(x.b)
  );

  const colunas: (typeof comIndice)[] = Array.from(
    { length: numColunas },
    () => []
  );
  const pesos = new Array(numColunas).fill(0);
  for (const item of ordenados) {
    let idxMenorPeso = 0;
    for (let i = 1; i < numColunas; i++) {
      if (pesos[i] < pesos[idxMenorPeso]) idxMenorPeso = i;
    }
    colunas[idxMenorPeso].push(item);
    pesos[idxMenorPeso] += pesoBloco(item.b);
  }

  return colunas.map((col) =>
    col.sort((x, y) => x.indiceOriginal - y.indiceOriginal).map((x) => x.b)
  );
}

function RenderBloco({ bloco }: { bloco: Bloco }) {
  if (bloco.tipo === "categoria") {
    const ehCheese = bloco.categoria.nome === "Cheese";
    return (
      <section className="mb-[4px]">
        <TituloSecao>{bloco.categoria.nome}</TituloSecao>
        <div>
          {bloco.categoria.produtos.map((p) =>
            ehCheese ? (
              <ItemCheese key={p.id} produto={p} />
            ) : (
              <ItemSimples key={p.id} produto={p} />
            )
          )}
        </div>
      </section>
    );
  }
  return (
    <section className="mb-[4px]">
      <TituloSecao>Opcionais</TituloSecao>
      <div>
        {bloco.itens.map((o) => (
          <div
            key={o.id}
            className="mb-[1px] flex items-baseline justify-between gap-1"
          >
            <p className="text-[8px] font-semibold text-marinho">{o.nome}</p>
            <p className="shrink-0 text-[8px] font-bold tabular-nums text-vermelho-texto">
              {formatPreco(o.preco)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function CardapioImpresso({
  categorias,
  opcionais,
  pixQrSvg,
}: {
  categorias: Categoria[];
  opcionais: OpcionalFlat[];
  pixQrSvg: string | null;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [gerandoPng, setGerandoPng] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function baixarPng() {
    const node = areaRef.current;
    if (!node) return;
    setGerandoPng(true);
    setErro(null);
    try {
      const escalaReal = LARGURA / node.clientWidth;
      const dataUrl = await toPng(node, {
        width: LARGURA,
        height: ALTURA,
        cacheBust: true,
        backgroundColor: "#fff7e6",
        style: {
          transform: `scale(${escalaReal})`,
          transformOrigin: "top left",
          width: `${node.clientWidth}px`,
          height: `${node.clientHeight}px`,
        },
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "cardapio-dogao-do-lalo.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setErro("Não foi possível gerar o PNG. Tenta de novo.");
    } finally {
      setGerandoPng(false);
    }
  }

  const blocos: Bloco[] = [
    ...categorias.map((c) => ({ tipo: "categoria" as const, categoria: c })),
    ...(opcionais.length > 0
      ? [{ tipo: "opcionais" as const, itens: opcionais }]
      : []),
  ];
  const colunas = distribuirColunas(blocos, 3);

  return (
    <div>
      <style>{`@page { size: A4 landscape; margin: 0; }`}</style>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-admin-navy">
            Cardápio pra imprimir
          </h1>
          <p className="mt-1 text-admin-navy/70">
            Sempre atualizado com os preços e itens do catálogo — A4 paisagem,{" "}
            {LARGURA}×{ALTURA}px
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-11 rounded-full bg-admin-navy px-5 font-bold text-admin-branco-creme transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            📄 Baixar PDF
          </button>
          <button
            type="button"
            onClick={baixarPng}
            disabled={gerandoPng}
            className="min-h-11 rounded-full bg-admin-dourado px-5 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            {gerandoPng ? "Gerando..." : "🖼️ Baixar PNG"}
          </button>
        </div>
      </div>

      {erro && (
        <p role="alert" className="mt-3 text-sm font-semibold text-vermelho-texto print:hidden">
          {erro}
        </p>
      )}
      {!pixQrSvg && (
        <p className="mt-3 text-sm font-semibold text-vermelho-texto print:hidden">
          Cadastre a chave PIX acima pra o QR de pagamento aparecer no
          cardápio.
        </p>
      )}

      <p className="mt-4 text-sm text-admin-navy/60 print:hidden">
        Prévia reduzida — o PDF e o PNG saem em tamanho real (A4 paisagem,{" "}
        {LARGURA}×{ALTURA}px)
      </p>

      <div
        id="area-impressao"
        ref={areaRef}
        className="mx-auto mt-2 flex w-full max-w-[700px] overflow-hidden bg-creme text-marinho shadow-2xl print:max-w-none print:w-[297mm] print:shadow-none"
        style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}
      >
        {/* Coluna principal — largura fixa (não flex-1) pra somar exatamente
            700px com a lateral, sem depender de recálculo do flexbox na
            clonagem do html-to-image */}
        <div className="flex w-[550px] shrink-0 flex-col">
          <div className="bg-marinho px-[14px] py-[8px]">
            <p className="font-display text-[14px] font-extrabold leading-none text-creme">
              Dogão do Lalo{" "}
              <span className="text-[8px] font-normal uppercase tracking-wide text-amarelo">
                · Cardápio completo
              </span>
            </p>
          </div>

          <div className="flex flex-1 gap-[12px] overflow-hidden px-[14px] py-[10px]">
            {colunas.map((coluna, idxColuna) => (
              <div key={idxColuna} className="min-w-0 flex-1">
                {coluna.map((b, i) => (
                  <RenderBloco key={i} bloco={b} />
                ))}
              </div>
            ))}
          </div>

          <div className="bg-marinho px-[14px] py-[6px] text-center">
            <p className="text-[7px] font-bold text-amarelo">{ADDRESS}</p>
          </div>
        </div>

        {/* Painel lateral promocional */}
        <div className="flex w-[150px] shrink-0 flex-col items-center justify-between bg-amarelo px-[10px] py-[12px] text-center">
          <div>
            <img
              src="/brand/mascote.png"
              alt=""
              className="mx-auto h-[52px] w-[52px] object-contain"
              crossOrigin="anonymous"
            />
            <p className="font-display text-[15px] font-extrabold leading-[0.95] text-marinho">
              Dogão
              <br />
              do Lalo
            </p>
          </div>

          <div className="flex flex-col items-center gap-[3px]">
            <span className="rounded-full bg-marinho px-[6px] py-[2px] text-[6px] font-extrabold uppercase tracking-wide text-amarelo">
              🛵 Fast Delivery
            </span>
            <div className="flex items-center gap-[3px] text-marinho">
              <WhatsAppIcon className="h-[10px] w-[10px]" />
              <p className="font-display text-[13px] font-extrabold tabular-nums leading-none">
                {PHONE_DISPLAY}
              </p>
            </div>
            <p className="font-display text-[11px] italic font-bold text-vermelho-texto">
              Aceitamos PIX
            </p>
          </div>

          {pixQrSvg ? (
            <div className="flex flex-col items-center gap-[3px]">
              <div
                className="rounded-[6px] border-[2px] border-marinho bg-white p-[4px] [&_svg]:block [&_svg]:h-[76px] [&_svg]:w-[76px]"
                dangerouslySetInnerHTML={{ __html: pixQrSvg }}
              />
              <p className="text-[6px] font-bold text-marinho">
                Escaneie e pague com PIX
              </p>
            </div>
          ) : (
            <div className="h-[80px] w-[80px] rounded-[6px] border-[2px] border-dashed border-marinho/40" />
          )}
        </div>
      </div>
    </div>
  );
}
