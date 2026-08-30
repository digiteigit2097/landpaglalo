import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    // Falha de rede/timeout ao checar a sessão (ex.: Supabase indisponível
    // por um instante). Trata como não autenticado em vez de deixar a
    // exceção propagar — isso é especialmente importante porque o proxy
    // também roda nas requisições POST de Server Actions das páginas do
    // admin, e um erro aqui faz o Next devolver uma resposta que o
    // cliente não reconhece como RSC válido, gerando o erro genérico
    // "An unexpected response was received from the server."
    user = null;
  }

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  // esqueci-senha: sempre pública. redefinir-senha: pública mesmo sem
  // cookie de sessão — o token de recuperação vem na URL (#hash), que o
  // middleware nunca vê (hash não é enviado ao servidor); a página troca
  // esse token por sessão no client, depois do redirect já ter passado.
  const isRecuperacaoSenha =
    pathname === "/admin/esqueci-senha" || pathname === "/admin/redefinir-senha";

  if (!user && !isLoginPage && !isRecuperacaoSenha) {
    const loginUrl = new URL("/admin/login", request.url);
    // preserva pra onde o usuário estava indo (ex.: a página do garçom no
    // celular) — sem isso, expirar a sessão sempre manda de volta pro
    // painel desktop, mesmo quem só usa a página de atendimento.
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const next = request.nextUrl.searchParams.get("next");
    const homeUrl = new URL(
      next && next.startsWith("/admin/") ? next : "/admin",
      request.url
    );
    return NextResponse.redirect(homeUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
