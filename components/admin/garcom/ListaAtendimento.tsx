"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserRound } from "lucide-react";
import { supabaseBrowser, supabaseBrowserComAuthRealtime } from "@/lib/supabase-browser";
import { formatPreco } from "@/lib/menu";
import {
  STATUS_CONTA_ABERTA,
  agruparContasAbertas,
  type ContaAberta,
} from "@/lib/contas-abertas";

export default function ListaAtendimento({
  contasIniciais,
}: {
  contasIniciais: ContaAberta[];
}) {
  const router = useRouter();
  const [contas, setContas] = useState<ContaAberta[]>(contasIniciais);

  const carregarContas = useCallback(async () => {
    const supabase = supabaseBrowser();
    const { data } = await supabase
      .from("pedidos")
      .select("id, cliente_nome, cliente_telefone, total, status")
      .in("status", STATUS_CONTA_ABERTA)
      .order("criado_em", { ascending: true });
    setContas(agruparContasAbertas(data ?? []));
  }, []);

  useEffect(() => {
    let cancelado = false;
    let supabase: Awaited<ReturnType<typeof supabaseBrowserComAuthRealtime>> | null = null;

    supabaseBrowserComAuthRealtime().then((cliente) => {
      if (cancelado) return;
      supabase = cliente;
      cliente
        .channel("garcom-atendimento")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos" },
          () => carregarContas()
        )
        .subscribe();
    });

    // rede de segurança contra o realtime morrer silenciosamente (mesmo
    // padrão já usado no restante do painel).
    const intervalo = setInterval(carregarContas, 20000);

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      if (supabase) supabase.removeAllChannels();
    };
  }, [carregarContas]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-admin-navy">
          Atendimento
        </h1>
        <button
          type="button"
          onClick={() => router.push("/admin/atendimento/novo")}
          className="flex min-h-11 items-center gap-2 rounded-full bg-admin-dourado px-4 font-bold text-admin-navy transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
        >
          <Plus aria-hidden className="h-4 w-4" strokeWidth={3} />
          Novo cliente
        </button>
      </div>

      {contas.length === 0 ? (
        <p className="mt-8 text-center text-admin-navy/60">
          Nenhum cliente sendo atendido agora.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {contas.map((c) => (
            <li key={c.clienteTelefone}>
              <Link
                href={`/admin/atendimento/${c.clienteTelefone}`}
                className="flex min-h-11 items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-admin-navy/10 transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-branco-creme">
                    <UserRound aria-hidden className="h-5 w-5 text-admin-navy/60" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-admin-navy">
                      {c.clienteNome}
                    </p>
                    <p className="text-sm text-admin-navy/60">
                      {c.pedidoIds.length}{" "}
                      {c.pedidoIds.length === 1 ? "rodada" : "rodadas"}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-display font-extrabold tabular-nums text-admin-navy">
                  {formatPreco(c.total)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
