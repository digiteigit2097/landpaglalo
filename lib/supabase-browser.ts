import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function supabaseBrowser() {
  return createBrowserClient(url, anonKey);
}

// Canais de Realtime (postgres_changes) só recebem eventos de tabelas com
// RLS se o socket já estiver autenticado como o usuário logado. Se você
// assina um canal logo após criar o client, a sessão (lida dos cookies)
// pode ainda não ter carregado, e o join do canal acontece como anon —
// as policies de admin bloqueiam os eventos e o canal fica "SUBSCRIBED"
// só na aparência, sem nunca receber nada. Use isso antes de `.channel(...)`
// sempre que o canal depender de RLS de usuário autenticado.
export async function supabaseBrowserComAuthRealtime() {
  const supabase = supabaseBrowser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) supabase.realtime.setAuth(session.access_token);
  return supabase;
}
