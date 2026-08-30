import { exigirAdminOuRedirecionar } from "@/lib/admin-auth";
import Sidebar from "@/components/admin/Sidebar";
import AlertaNovoPedido from "@/components/admin/AlertaNovoPedido";
import FilaImpressaoGarcom from "@/components/admin/FilaImpressaoGarcom";

export default async function PainelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await exigirAdminOuRedirecionar();

  return (
    <div className="flex h-dvh overflow-hidden bg-admin-branco-creme">
      <Sidebar nome={admin.nome} />
      <main className="min-w-0 flex-1 overflow-y-auto p-6 sm:p-8">
        {children}
      </main>
      <AlertaNovoPedido />
      <FilaImpressaoGarcom />
    </div>
  );
}
