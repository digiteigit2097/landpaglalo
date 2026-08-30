"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Receipt,
  UtensilsCrossed,
  QrCode,
  Printer,
  MessageCircle,
  Users,
  LogOut,
  Volume2,
  VolumeX,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { logoutAdmin } from "@/app/admin/actions";
import { definirVozAlerta, vozAlertaAtiva } from "@/lib/preferencias-admin";

const links: { href: string; label: string; Icone: LucideIcon }[] = [
  { href: "/admin", label: "Dashboard", Icone: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", Icone: Receipt },
  { href: "/admin/atendimento", label: "Atendimento (garçom)", Icone: Smartphone },
  { href: "/admin/catalogo", label: "Catálogo", Icone: UtensilsCrossed },
  { href: "/admin/qrcode", label: "QR Code", Icone: QrCode },
  { href: "/admin/cardapio-impresso", label: "Cardápio p/ imprimir", Icone: Printer },
  { href: "/admin/cardapio-whatsapp", label: "Cardápio p/ WhatsApp", Icone: MessageCircle },
  { href: "/admin/usuarios", label: "Usuários", Icone: Users },
];

function ativo(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export default function Sidebar({ nome }: { nome: string }) {
  const pathname = usePathname();
  const [vozAtiva, setVozAtiva] = useState(true);

  useEffect(() => {
    setVozAtiva(vozAlertaAtiva());
  }, []);

  function alternarVoz() {
    setVozAtiva((atual) => {
      const novo = !atual;
      definirVozAlerta(novo);
      return novo;
    });
  }

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
        <button
          type="button"
          onClick={alternarVoz}
          aria-pressed={vozAtiva}
          title="Alerta de novo pedido: som toca sempre; isso liga/desliga só o aviso falado"
          className="flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-4 font-semibold text-admin-branco-creme/85 transition-colors hover:bg-admin-navy-suave focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
        >
          <span className="flex items-center gap-3">
            {vozAtiva ? (
              <Volume2 aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
            ) : (
              <VolumeX aria-hidden className="h-4 w-4 shrink-0" strokeWidth={2} />
            )}
            Voz no alerta
          </span>
          <span
            className={`flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors ${
              vozAtiva ? "bg-admin-dourado justify-end" : "bg-admin-branco-creme/20 justify-start"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-admin-navy" />
          </span>
        </button>

        <p className="mt-2 truncate px-2 text-sm text-admin-branco-creme/70">
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
