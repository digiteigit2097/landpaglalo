"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { supabaseBrowserComAuthRealtime } from "@/lib/supabase-browser";
import { formatPreco } from "@/lib/menu";
import { vozAlertaAtiva } from "@/lib/preferencias-admin";

type PedidoNovo = {
  id: number;
  nome: string;
};

let audioCtx: AudioContext | null = null;

function tocarTom(frequencia: number, atraso: number, duracao: number, pico: number) {
  if (!audioCtx) return;
  const inicio = audioCtx.currentTime + atraso;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "triangle";
  osc.frequency.value = frequencia;
  gain.gain.setValueAtTime(0.0001, inicio);
  gain.gain.exponentialRampToValueAtTime(pico, inicio + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracao + 0.05);
}

// cada nota toca dobrada com uma oitava abaixo, por baixo, pra dar peso
// (não é só um "bip" fino de sino — fica mais parecido com alerta de caixa).
function tocarNota(frequencia: number, atraso: number, duracao: number) {
  tocarTom(frequencia, atraso, duracao, 0.55);
  tocarTom(frequencia / 2, atraso, duracao, 0.3);
}

// acorde de 3 notas ascendente, alto e rápido — pra chamar atenção de
// verdade em ambiente de balcão/cozinha. Sem depender de arquivo de áudio.
function tocarSino() {
  if (typeof window === "undefined") return;
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioContextCtor) return;
  if (!audioCtx) audioCtx = new AudioContextCtor();
  if (audioCtx.state === "suspended") audioCtx.resume();
  tocarNota(784, 0, 0.16); // G5
  tocarNota(988, 0.13, 0.16); // B5
  tocarNota(1319, 0.26, 0.36); // E6
}

function falar(texto: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 1;
  fala.pitch = 1;
  window.speechSynthesis.speak(fala);
}

function alertar(nomeCliente: string) {
  tocarSino();
  if (vozAlertaAtiva()) {
    window.setTimeout(() => falar(`Atenção, atendente! Novo pedido de ${nomeCliente}.`), 650);
  }
}

export default function AlertaNovoPedido() {
  const router = useRouter();
  const [pedido, setPedido] = useState<PedidoNovo | null>(null);
  const [total, setTotal] = useState(0);
  const pedidoIdRef = useRef<number | null>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    pedidoIdRef.current = pedido?.id ?? null;
  }, [pedido]);

  useEffect(() => {
    let cancelado = false;
    let supabase: Awaited<ReturnType<typeof supabaseBrowserComAuthRealtime>> | null = null;

    supabaseBrowserComAuthRealtime().then((cliente) => {
      if (cancelado) return;
      supabase = cliente;
      cliente
        .channel("admin-alerta-novo-pedido")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "pedidos" },
          (payload) => {
            const novo = payload.new as {
              id: number;
              cliente_nome: string;
              total: number;
            };
            setPedido({ id: novo.id, nome: novo.cliente_nome });
            setTotal(Number(novo.total));
          }
        )
        .on(
          // criar_pedido insere o pedido com total 0 e só atualiza o valor
          // certo logo em seguida (mesma transação) — sem isso o popup
          // mostraria sempre R$ 0,00.
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "pedidos" },
          (payload) => {
            const atualizado = payload.new as { id: number; total: number };
            if (atualizado.id === pedidoIdRef.current) {
              setTotal(Number(atualizado.total));
            }
          }
        )
        .subscribe();
    });

    return () => {
      cancelado = true;
      if (supabase) {
        supabase.removeAllChannels();
      }
    };
  }, []);

  useEffect(() => {
    if (!pedido) return;
    botaoRef.current?.focus();
    alertar(pedido.nome);
    const intervalo = setInterval(() => alertar(pedido.nome), 5000);
    return () => {
      clearInterval(intervalo);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pedido]);

  useEffect(() => {
    if (!pedido) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPedido(null);
    };
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [pedido]);

  if (!pedido) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="titulo-novo-pedido"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-admin-navy/60 p-4"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-admin-dourado">
          <Bell
            aria-hidden
            className="h-8 w-8 animate-bounce text-admin-navy"
            strokeWidth={2.5}
          />
        </div>
        <h2
          id="titulo-novo-pedido"
          className="mt-4 font-display text-2xl font-extrabold text-admin-navy"
        >
          Novo pedido!
        </h2>
        <p className="mt-2 text-admin-navy/70">
          Pedido nº {pedido.id} · {pedido.nome}
        </p>
        <p className="mt-1 font-display text-3xl font-extrabold tabular-nums text-admin-navy">
          {formatPreco(total)}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            ref={botaoRef}
            type="button"
            onClick={() => {
              setPedido(null);
              router.push("/admin/pedidos");
            }}
            className="min-h-11 w-full rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
          >
            Ver pedido
          </button>
          <button
            type="button"
            onClick={() => setPedido(null)}
            className="min-h-11 w-full rounded-full px-4 font-semibold text-admin-navy/60 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
