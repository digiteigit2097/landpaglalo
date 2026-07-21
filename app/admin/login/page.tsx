"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    if (error) {
      setErro("E-mail ou senha incorretos.");
      setEnviando(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-admin-navy px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm rounded-3xl bg-admin-branco-creme p-8 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <Image
            src="/brand/mascote.png"
            alt="Dogão do Lalo"
            width={72}
            height={72}
          />
          <h1 className="mt-3 font-display text-2xl font-extrabold text-admin-navy">
            Painel Administrativo
          </h1>
          <p className="mt-1 text-sm text-admin-navy/70">Dogão do Lalo</p>
        </div>

        <div className="mt-6 space-y-4">
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
          <div>
            <label
              htmlFor="senha"
              className="text-sm font-bold uppercase tracking-wide text-admin-navy/70"
            >
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="current-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-2 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-white px-4 py-3 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
            />
          </div>
          {erro && (
            <p role="alert" className="text-sm font-semibold text-vermelho-texto">
              {erro}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="mt-6 flex min-h-11 w-full items-center justify-center rounded-full bg-admin-dourado px-6 py-3 font-bold text-admin-navy shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy focus-visible:ring-offset-2"
        >
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
