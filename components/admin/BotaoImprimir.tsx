"use client";

import { Printer } from "lucide-react";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex min-h-11 items-center gap-2 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
    >
      <Printer aria-hidden className="h-4 w-4" strokeWidth={2.5} />
      Imprimir / Salvar PDF
    </button>
  );
}
