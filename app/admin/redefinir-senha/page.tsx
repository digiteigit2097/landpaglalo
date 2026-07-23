"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [linkInvalido, setLinkInvalido] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    // o link do e-mail carrega um token de recuperação na URL; o
    // supabase-js troca isso por uma sessão temporária automaticamente
    // (detectSessionInUrl) — só precisamos aguardar esse evento antes de
    // liberar o formulário.
    let jaLiberou = false;
    const supabase = supabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        jaLiberou = true;
        setPronto(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        jaLiberou = true;
        setPronto(true);
      }
    });

    const semLinkValido = setTimeout(() => {
      if (!jaLiberou) setLinkInvalido(true);
    }, 2500);

    return () => {
      subscription.unsubscribe();
      clearTimeout(semLinkValido);
    };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    if (senha.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }
    setEnviando(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password: senha });
    setEnviando(false);
    if (error) {
      setErro("Não foi possível salvar a senha. Tenta pedir um novo link.");
      return;
    }
    setSucesso(true);
    setTimeout(() => {
      router.push("/admin");
      router.refresh();
    }, 1500);
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
            Criar nova senha
          </h1>
        </div>

        {linkInvalido ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-admin-navy/80">
              Esse link expirou ou já foi usado. Pede um novo em &quot;Esqueci
              minha senha&quot;.
            </p>
            <a
              href="/admin/esqueci-senha"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-admin-dourado px-6 font-bold text-admin-navy shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
            >
              Pedir novo link
            </a>
          </div>
        ) : !pronto ? (
          <p className="mt-6 text-center text-sm text-admin-navy/70">
            Confirmando o link...
          </p>
        ) : sucesso ? (
          <p className="mt-6 text-center text-sm font-semibold text-admin-navy/80">
            Senha atualizada! Entrando no painel...
          </p>
        ) : (
          <form onSubmit={salvar} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="senha"
                className="text-sm font-bold uppercase tracking-wide text-admin-navy/70"
              >
                Nova senha
              </label>
              <input
                id="senha"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="mt-2 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-white px-4 py-3 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
              />
            </div>
            <div>
              <label
                htmlFor="confirmarSenha"
                className="text-sm font-bold uppercase tracking-wide text-admin-navy/70"
              >
                Confirmar senha
              </label>
              <input
                id="confirmarSenha"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
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
              {enviando ? "Salvando..." : "Salvar nova senha"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
