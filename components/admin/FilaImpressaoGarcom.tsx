"use client";

import { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { supabaseBrowser, supabaseBrowserComAuthRealtime } from "@/lib/supabase-browser";

type JobImpressao = { id: number; cliente_telefone: string };

// Escuta a fila de comandas do garçom (o celular dele não imprime direto —
// só grava um pedido de impressão) e faz a impressão de verdade aqui, na
// tela do admin que estiver aberta no computador do balcão (onde a
// impressora térmica está ligada). Fica montado globalmente no layout do
// painel, sem precisar de uma aba dedicada.
export default function FilaImpressaoGarcom() {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const filaRef = useRef<JobImpressao[]>([]);
  const processandoRef = useRef(false);
  const jaVistoRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    let cancelado = false;
    let supabase: Awaited<ReturnType<typeof supabaseBrowserComAuthRealtime>> | null = null;
    let intervaloPolling: ReturnType<typeof setInterval> | null = null;
    let timeoutToast: ReturnType<typeof setTimeout> | null = null;

    async function processarProximo() {
      if (processandoRef.current) return;
      const proximo = filaRef.current.shift();
      if (!proximo) return;
      processandoRef.current = true;

      const cliente = supabaseBrowser();
      const { data: pedido } = await cliente
        .from("pedidos")
        .select("cliente_nome")
        .eq("cliente_telefone", proximo.cliente_telefone)
        .order("criado_em", { ascending: false })
        .limit(1)
        .maybeSingle();

      setIframeSrc(`/admin/pedidos/comanda/${proximo.cliente_telefone}/cupom`);

      // dá tempo do iframe carregar e do <AutoPrint /> chamar window.print()
      // lá dentro — mais seguro do que confiar só no evento afterprint, que
      // pode não disparar igual em todo driver/configuração de impressora.
      await new Promise((resolve) => setTimeout(resolve, 3500));

      await cliente
        .from("impressoes_pendentes")
        .update({ processado_em: new Date().toISOString() })
        .eq("id", proximo.id);

      setIframeSrc(null);
      setToast(
        `Comanda${pedido?.cliente_nome ? ` de ${pedido.cliente_nome}` : ""} impressa`
      );
      if (timeoutToast) clearTimeout(timeoutToast);
      timeoutToast = setTimeout(() => setToast(null), 5000);

      processandoRef.current = false;
      processarProximo();
    }

    function enfileirar(job: JobImpressao) {
      if (jaVistoRef.current.has(job.id)) return;
      jaVistoRef.current.add(job.id);
      filaRef.current.push(job);
      processarProximo();
    }

    async function buscarPendentes() {
      const cliente = supabaseBrowser();
      const { data } = await cliente
        .from("impressoes_pendentes")
        .select("id, cliente_telefone")
        .is("processado_em", null)
        .order("criado_em", { ascending: true });
      for (const job of data ?? []) enfileirar(job);
    }

    supabaseBrowserComAuthRealtime().then(async (clienteAutenticado) => {
      if (cancelado) return;
      supabase = clienteAutenticado;

      // ao montar, processa qualquer impressão pendente de quando esta aba
      // estava fechada — diferente do alerta de novo pedido, aqui uma
      // impressão perdida não pode ficar esquecida.
      await buscarPendentes();

      clienteAutenticado
        .channel("fila-impressao-garcom")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "impressoes_pendentes" },
          (payload) => {
            const novo = payload.new as JobImpressao & { processado_em: string | null };
            if (!novo.processado_em) {
              enfileirar({ id: novo.id, cliente_telefone: novo.cliente_telefone });
            }
          }
        )
        .subscribe();
    });

    // rede de segurança contra o realtime morrer silenciosamente, mesmo
    // padrão já usado no restante do painel.
    intervaloPolling = setInterval(buscarPendentes, 15000);

    return () => {
      cancelado = true;
      if (intervaloPolling) clearInterval(intervaloPolling);
      if (timeoutToast) clearTimeout(timeoutToast);
      if (supabase) supabase.removeAllChannels();
    };
  }, []);

  return (
    <>
      {iframeSrc && (
        <iframe
          key={iframeSrc}
          src={iframeSrc}
          title="Impressão da comanda"
          aria-hidden
          style={{ position: "fixed", width: 0, height: 0, border: "none", opacity: 0 }}
        />
      )}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[200] flex items-center gap-2 rounded-2xl bg-admin-navy px-4 py-3 text-admin-branco-creme shadow-2xl">
          <Printer aria-hidden className="h-4 w-4 shrink-0 text-admin-dourado-claro" strokeWidth={2.5} />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </>
  );
}
