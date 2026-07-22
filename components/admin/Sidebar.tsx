"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  QrCode,
  Printer,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";

const links: { href: string; label: string; Icone: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", Icone: Receipt },
  { href: "/admin/catalogo", label: "Catálogo", Icone: UtensilsCrossed },
  { href: "/admin/qrcode", label: "QR Code", Icone: QrCode },
  { href: "/admin/cardapio-impresso", label: "Cardápio p/ imprimir", Icone: Printer },
  { href: "/admin/usuarios", label: "Usuários", Icone: Users },
];

function ativo(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function Sidebar({ nome }: { nome: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col bg-admin-navy text-admin-branco-creme">
      <div className="p-6">
        <p className="font-display text-lg font-extrabold text-admin-dourado-claro">
          Dogão do Lalo
        </p>
        <p className="text-xs uppercase tracking-wide text-admin-branco-creme/60">
          Painel administrativo
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-4 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado ${
              ativo(pathname, l.href)
                ? "bg-admin-dourado text-admin-navy"
                : "text-admin-branco-creme/85 hover:bg-admin-navy-suave"
            }`}
          >
            <l.Icone aria-hidden className="h-5 w-5 shrink-0" strokeWidth={2} />
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-admin-branco-creme/10 p-4">
        <p className="truncate px-2 text-sm text-admin-branco-creme/70">
          {nome}
        </p>
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl px-4 font-semibold text-admin-branco-creme/85 transition-colors hover:bg-admin-navy-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
          >
            <LogOut aria-hidden className="h-4 w-4" strokeWidth={2} />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
