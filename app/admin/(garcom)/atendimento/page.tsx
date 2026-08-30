import { supabaseServer } from "@/lib/supabase-server";
import { STATUS_CONTA_ABERTA, agruparContasAbertas } from "@/lib/contas-abertas";
import ListaAtendimento from "@/components/admin/garcom/ListaAtendimento";

export const dynamic = "force-dynamic";

export default async function AtendimentoPage() {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("pedidos")
    .select("id, cliente_nome, cliente_telefone, total, status")
    .in("status", STATUS_CONTA_ABERTA)
    .order("criado_em", { ascending: true });

  const contas = agruparContasAbertas(data ?? []);

  return <ListaAtendimento contasIniciais={contas} />;
}
