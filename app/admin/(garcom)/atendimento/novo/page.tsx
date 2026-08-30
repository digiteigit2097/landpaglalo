import { buscarCardapio } from "@/lib/cardapio";
import NovoClienteWizard from "@/components/admin/garcom/NovoClienteWizard";

export const dynamic = "force-dynamic";

export default async function NovoAtendimentoPage() {
  const categorias = await buscarCardapio();
  return <NovoClienteWizard categorias={categorias} />;
}
