"use client";

import { useActionState, useRef, useEffect } from "react";
import {
  criarUsuarioAdmin,
  type EstadoFormUsuario,
} from "@/app/admin/(painel)/usuarios/actions";

const estadoInicial: EstadoFormUsuario = {};

export default function NovoUsuarioForm() {
  const [estado, formAction, pendente] = useActionState(
    criarUsuarioAdmin,
    estadoInicial
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (estado.sucesso) {
      formRef.current?.reset();
    }
  }, [estado.sucesso]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-admin-navy/10 sm:grid-cols-3"
    >
      <div>
        <label
          htmlFor="nome"
          className="text-sm font-semibold text-admin-navy/70"
        >
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="text-sm font-semibold text-admin-navy/70"
        >
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>
      <div>
        <label
          htmlFor="senha"
          className="text-sm font-semibold text-admin-navy/70"
        >
          Senha provisória
        </label>
        <input
          id="senha"
          name="senha"
          type="text"
          minLength={6}
          required
          placeholder="mín. 6 caracteres"
          className="mt-1 w-full min-h-11 rounded-xl border border-admin-navy/15 bg-admin-branco-creme px-3 py-2 text-admin-navy focus:border-admin-dourado focus:outline-none focus:ring-2 focus:ring-admin-dourado/40"
        />
      </div>

      {estado.erro && (
        <p role="alert" className="sm:col-span-3 text-sm font-semibold text-vermelho-texto">
          {estado.erro}
        </p>
      )}
      {estado.sucesso && (
        <p className="sm:col-span-3 text-sm font-semibold text-green-700">
          Usuário criado! Passa o e-mail e a senha provisória pra pessoa.
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="sm:col-span-3 min-h-11 rounded-full bg-admin-dourado px-6 font-bold text-admin-navy transition-transform enabled:hover:scale-[1.01] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-navy"
      >
        {pendente ? "Criando..." : "Criar usuário"}
      </button>
    </form>
  );
}
