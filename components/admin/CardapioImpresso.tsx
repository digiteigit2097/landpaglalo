"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { formatPreco, PHONE_DISPLAY, ADDRESS } from "@/lib/menu";
import type { Categoria, OpcionalFlat, Produto } from "@/lib/cardapio";

// preview em 700px, exportado em 3508px (paisagem A4 @300dpi) — fator ~5
const LARGURA = 3508;
const ALTURA = 2480;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51-.17 0-.37-.02-.57-.02-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35z" />
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.45 1.28 4.93L2 22l5.2-1.36A9.9 9.9 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18.2c-1.55 0-3.06-.42-4.38-1.2l-.31-.19-3.09.81.82-3.01-.2-.32A8.16 8.16 0 0 1 3.8 12c0-4.52 3.68-8.2 8.2-8.2s8.2 3.68 8.2 8.2-3.68 8.2-8.2 8.2z" />
    </svg>
  );
}

function TruckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 18V9a2 2 0 0 1 2-2h6l3 4h1a2 2 0 0 1 2 2v5" />
      <circle cx="7.5" cy="18" r="1.8" />
      <circle cx="16.5" cy="18" r="1.8" />
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

// linha "grifada" com fundo amarelo-claro, usada nos itens que têm
// descrição (Cheese e Hot Dog) — deixa nome+preço mais fáceis de achar
// numa lista comprida.
function LinhaDestacada({
  nome,
  precoLabel,
  descricao,
}: {
  nome: string;
  precoLabel: React.ReactNode;
  descricao: string | null;
}) {
  return (
    <div className="mb-[2px] border-b-[0.75px] border-dashed border-[#9aa3b2] pb-[1.5px] last:border-b-0 last:pb-0">
      <div className="flex items-baseline justify-between gap-1 rounded-[2px] bg-[#fff3b0] p-[2px]">
        <p className="text-[8.5px] font-bold leading-[1.05] text-marinho">
          {nome}
        </p>
        <p className="shrink-0 text-[8.5px] font-bold leading-[1.05] tabular-nums text-vermelho-texto">
          {precoLabel}
        </p>
      </div>
      {descricao && (
        <p className="text-[6.5px] font-semibold leading-[1.15] text-black">
          {descricao}
        </p>
      )}
    </div>
  );
}

// linha compacta com divisória tracejada, usada em itens sem descrição
// (Bebidas) e nos Opcionais — mesma tipografia dos dois pra ficar
// visualmente igual.
function LinhaCompacta({
  nome,
  precoLabel,
}: {
  nome: string;
  precoLabel: React.ReactNode;
}) {
  return (
    <div className="mb-[1.5px] flex items-baseline justify-between gap-1 border-b-[0.75px] border-dashed border-[#9aa3b2] pb-[1px] last:border-b-0 last:pb-0">
      <p className="text-[9.6px] font-semibold text-marinho">{nome}</p>
      <p className="shrink-0 text-[9.6px] font-bold tabular-nums text-vermelho-texto">
        {precoLabel}
      </p>
    </div>
  );
}

function LinhaNormalArtesanal() {
  return (
    <p className="mb-[1px] text-right text-[5.3px] font-extrabold uppercase leading-[1.1] tracking-wide text-marinho">
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
    <LinhaDestacada
      nome={produto.nome}
      descricao={produto.descricao}
      precoLabel={
        <>
          {formatPreco(normal.preco)}
          <span className="text-marinho/50"> / </span>
          {formatPreco(artesanal.preco)}
        </>
      }
    />
  );
}

function ItemSimples({ produto }: { produto: Produto }) {
  const alt = variacaoAlternativa(produto);
  const precoLabel = (
    <>
      {formatPreco(produto.preco)}
      {alt && (
        <>
          <span className="text-marinho/50"> / </span>
          {formatPreco(alt.preco)}
        </>
      )}
    </>
  );

  // com descrição (Hot Dog): linha grifada igual ao Cheese.
  // sem descrição (Bebidas): linha compacta igual aos Opcionais.
  if (produto.descricao) {
    return (
      <>
        {alt && <LinhaNormalArtesanal />}
        <LinhaDestacada
          nome={produto.nome}
          descricao={produto.descricao}
          precoLabel={precoLabel}
        />
      </>
    );
  }
  return <LinhaCompacta nome={produto.nome} precoLabel={precoLabel} />;
}

function TituloSecao({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-[4px] inline-block rounded-[3px] bg-marinho px-[7px] py-[1.5px] text-[8.5px] font-extrabold uppercase tracking-wide text-amarelo">
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
      <section className="mb-[8px]">
        <TituloSecao>{bloco.categoria.nome}</TituloSecao>
        {ehCheese && <LinhaNormalArtesanal />}
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
    <section className="mb-[8px]">
      <TituloSecao>Opcionais</TituloSecao>
      <div>
        {bloco.itens.map((o) => (
          <LinhaCompacta
            key={o.id}
            nome={o.nome}
            precoLabel={formatPreco(o.preco)}
          />
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
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // largura lógica fixa do layout (550 + 150). Forçamos no clone que o
  // html-to-image cria (via `style`), pra não depender da largura
  // renderizada na tela — que pode ser menor e fazer o painel lateral ser
  // cortado pelo overflow-hidden.
  const LARGURA_BASE = 700;
  const ALTURA_BASE = Math.round((LARGURA_BASE * ALTURA) / LARGURA);

  async function capturarImagemAltaResolucao() {
    const node = areaRef.current;
    if (!node) throw new Error("área de impressão não encontrada");

    const opcoes = {
      cacheBust: true,
      backgroundColor: "#fff7e6",
      pixelRatio: LARGURA / LARGURA_BASE,
      width: LARGURA_BASE,
      height: ALTURA_BASE,
      style: {
        width: `${LARGURA_BASE}px`,
        maxWidth: "none",
        height: `${ALTURA_BASE}px`,
        margin: "0",
      },
    };
    // Primeira chamada "esquenta" o cache de imagens/fontes no clone;
    // a segunda gera a imagem final correta — workaround conhecido do
    // html-to-image em navegadores Chromium. LARGURA×ALTURA = 3508×2480,
    // ou seja A4 paisagem a ~300dpi — nítido o bastante pra impressão.
    await toPng(node, opcoes);
    return toPng(node, opcoes);
  }

  async function baixarPng() {
    setGerandoPng(true);
    setErro(null);
    try {
      const dataUrl = await capturarImagemAltaResolucao();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "cardapio-dogao-do-lalo.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error("Falha ao gerar PNG do cardápio:", e);
      setErro("Não foi possível gerar o PNG. Tenta de novo.");
    } finally {
      setGerandoPng(false);
    }
  }

  async function baixarPdf() {
    setGerandoPdf(true);
    setErro(null);
    try {
      // gera o PDF a partir da MESMA captura em alta resolução do PNG, em
      // vez do diálogo de impressão do navegador — a qualidade do
      // window.print() varia conforme DPI/configuração de cada navegador
      // (foi o que dava aquele PDF borrado); assim fica sempre nítido.
      const dataUrl = await capturarImagemAltaResolucao();
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
        compress: true,
      });
      pdf.addImage(dataUrl, "PNG", 0, 0, 297, 210, undefined, "FAST");
      pdf.save("cardapio-dogao-do-lalo.pdf");
    } catch (e) {
      console.error("Falha ao gerar PDF do cardápio:", e);
      setErro("Não foi possível gerar o PDF. Tenta de novo.");
    } finally {
      setGerandoPdf(false);
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
            onClick={baixarPdf}
            disabled={gerandoPdf}
            className="flex min-h-11 items-center gap-2 rounded-full bg-admin-navy px-5 font-bold text-admin-branco-creme transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            {gerandoPdf ? (
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            ) : (
              <FileText aria-hidden className="h-4 w-4" strokeWidth={2.5} />
            )}
            {gerandoPdf ? "Gerando..." : "Baixar PDF"}
          </button>
          <button
            type="button"
            onClick={baixarPng}
            disabled={gerandoPng}
            className="flex min-h-11 items-center gap-2 rounded-full bg-admin-dourado px-5 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            <ImageIcon aria-hidden className="h-4 w-4" strokeWidth={2.5} />
            {gerandoPng ? "Gerando..." : "Baixar PNG"}
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
        className="mx-auto mt-2 flex w-full max-w-[700px] overflow-hidden bg-white text-marinho shadow-2xl print:shadow-none"
        style={{ aspectRatio: `${LARGURA} / ${ALTURA}` }}
      >
        {/* Coluna principal — largura fixa (não flex-1) pra somar exatamente
            700px com a lateral, sem depender de recálculo do flexbox na
            clonagem do html-to-image */}
        <div className="flex w-[550px] shrink-0 flex-col">
          <div className="flex flex-1 gap-[12px] overflow-hidden px-[14px] pb-[7px] pt-[9px]">
            {colunas.map((coluna, idxColuna) => (
              <div key={idxColuna} className="min-w-0 flex-1">
                {coluna.map((b, i) => (
                  <RenderBloco key={i} bloco={b} />
                ))}
              </div>
            ))}
          </div>

          <div className="bg-vermelho-texto px-[14px] py-[4px] text-center">
            <p className="text-[8px] font-extrabold uppercase tracking-wide text-white">
              Dog Simples, Dog Duplo e X-Burguer não adicionamos
            </p>
          </div>
        </div>

        {/* Painel lateral promocional */}
        <div className="flex w-[150px] shrink-0 flex-col items-center gap-[9px] overflow-hidden bg-amarelo px-[10px] py-[12px] text-center">
          {/* Logo */}
          <img
            src="/brand/logo-principal.png"
            alt="Dogão do Lalo"
            className="max-h-[64px] w-full object-contain"
            crossOrigin="anonymous"
          />

          {/* Badge Delivery */}
          <span className="inline-flex items-center gap-[3px] rounded-full border-[1.5px] border-marinho px-[8px] py-[2px] text-[7px] font-extrabold uppercase tracking-[0.1em] text-marinho">
            <TruckIcon className="h-[9px] w-[9px]" />
            Delivery
          </span>

          {/* Círculo WhatsApp */}
          <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-[#25D366] shadow-[0_3px_0_#128C7E]">
            <WhatsAppIcon className="h-[26px] w-[26px] text-white" />
          </span>

          {/* Chame no WhatsApp */}
          <p className="text-[7px] font-bold uppercase tracking-[0.16em] text-marinho">
            Chame no WhatsApp
          </p>

          {/* Número — destaque principal */}
          <p className="whitespace-nowrap font-display text-[13px] font-extrabold leading-none tracking-tight text-marinho tabular-nums">
            {PHONE_DISPLAY}
          </p>

          {/* Botão Peça agora */}
          <span className="inline-flex items-center gap-[4px] rounded-[8px] bg-[#25D366] px-[12px] py-[5px] text-[9px] font-extrabold uppercase tracking-wide text-white shadow-[0_3px_0_#128C7E]">
            <WhatsAppIcon className="h-[11px] w-[11px] text-white" />
            Peça agora
          </span>

          {/* QR PIX */}
          {pixQrSvg ? (
            <div className="flex flex-col items-center gap-[3px]">
              <p className="text-[6px] font-extrabold uppercase tracking-wide text-marinho/80">
                Pague com PIX
              </p>
              <div
                className="rounded-[5px] border-[2px] border-marinho bg-white p-[3px] [&_svg]:block [&_svg]:h-[60px] [&_svg]:w-[60px]"
                dangerouslySetInnerHTML={{ __html: pixQrSvg }}
              />
            </div>
          ) : (
            <div className="h-[66px] w-[66px] rounded-[5px] border-[2px] border-dashed border-marinho/40" />
          )}

          {/* Endereço — fica grudado no rodapé do painel amarelo */}
          <p className="mt-auto rounded-[8px] border border-white/[0.16] bg-marinho px-[7px] py-[6px] text-[5px] font-bold leading-[1.4] text-amarelo shadow-[0_3px_0_#0e1f38]">
            {ADDRESS.replace(/ - /g, " · ")}
          </p>
        </div>
      </div>
    </div>
  );
}
