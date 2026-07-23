"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/redefinir-senha`,
    });
    setEnviando(false);
    if (error) {
      setErro("Não foi possível enviar o e-mail. Tenta de novo em instantes.");
      return;
    }
    setEnviado(true);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-admin-navy px-4">
      <div className="w-full max-w-sm rounded-3xl bg-admin-branco-creme p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/mascote.png"
            alt="Dogão do Lalo"
            width={72}
            height={72}
          />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-admin-navy">
            Esqueci minha senha
          </h1>
          <p className="mt-1 text-sm text-admin-navy/70">
            Manda o e-mail cadastrado que a gente envia um link pra você criar
            uma senha nova
          </p>
        </div>

        {enviado ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-admin-navy/80">
              Se esse e-mail estiver cadastrado, um link de redefinição já foi
              enviado. Confere sua caixa de entrada (e o spam).
            </p>
            <Link
              href="/admin/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-6 font-bold text-admin-dourado-escuro hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
            >
              Voltar pro login
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-bold uppercase tracking-wide text-admin-navy/70"
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-white px-4 py-3 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
            </div>
            {erro && (
              <p role="alert" className="text-sm font-semibold text-vermelho-texto">
                {erro}
              </p>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="flex min-h-11 w-full items-center justify-center rounded-full bg-admin-dourado px-6 py-3 font-bold text-admin-navy shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy focus-visible:ring-offset-2"
            >
              {enviando ? "Enviando..." : "Enviar link"}
            </button>
            <Link
              href="/admin/login"
              className="block text-center text-sm font-semibold text-admin-navy/70 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-dourado"
            >
              Voltar pro login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
