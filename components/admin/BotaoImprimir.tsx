"use client";

export default function BotaoImprimir() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
    >
      🖨️ Imprimir / Salvar PDF
    </button>
  );
}
