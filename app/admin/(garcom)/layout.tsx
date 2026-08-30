import { exigirAdminOuRedirecionar } from "@/lib/admin-auth";
import { logoutAdmin } from "@/app/admin/actions";

// Shell separado do painel desktop — sem a sidebar de 256px (que não tem
// nenhum tratamento responsivo), pensado só pra celular do garçom.
export default async function GarcomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await exigirAdminOuRedirecionar("/admin/atendimento");

  return (
    <div className="min-h-dvh bg-admin-branco-creme">
      <header className="sticky top-0 z-30 flex min-h-14 items-center justify-between gap-3 bg-admin-navy px-4 text-admin-branco-creme">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-extrabold text-admin-dourado-claro">
            Dogão do Lalo
          </p>
          <p className="truncate text-xs text-admin-branco-creme/70">{admin.nome}</p>
        </div>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="min-h-9 rounded-full px-3 text-sm font-semibold text-admin-branco-creme/85 hover:bg-admin-navy-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            Sair
          </button>
        </form>
      </header>
      <main className="mx-auto max-w-[600px] px-4 py-4">{children}</main>
    </div>
  );
}
