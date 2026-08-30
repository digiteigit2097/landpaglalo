-- 011: fila de impressão da comanda do garçom — o celular do garçom não
-- imprime direto (impressora térmica ligada só no computador do caixa);
-- o app grava aqui um pedido de impressão e uma aba aberta no caixa
-- (logada como admin) escuta via Realtime e imprime de verdade.

create table impressoes_pendentes (
  id bigint generated always as identity primary key,
  cliente_telefone text not null,
  criado_em timestamptz not null default now(),
  processado_em timestamptz
);

create index idx_impressoes_pendentes_pendente
  on impressoes_pendentes (criado_em)
  where processado_em is null;

alter table impressoes_pendentes enable row level security;

create policy "admin le impressoes_pendentes" on impressoes_pendentes
  for select using (is_admin());
create policy "admin atualiza impressoes_pendentes" on impressoes_pendentes
  for update using (is_admin());
-- sem policy de insert: só entra linha aqui via fechar_conta_garcom
-- (security definer), pra garantir que fechar conta e enfileirar
-- impressão aconteçam sempre juntos, na mesma transação.

alter publication supabase_realtime add table impressoes_pendentes;

-- fecha todas as rodadas em aberto desse cliente (atendimento presencial
-- do garçom) e enfileira a impressão da comanda consolidada, num passo
-- atômico só — não dá pra fechar conta sem enfileirar a impressão.
create or replace function fechar_conta_garcom(p_cliente_telefone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    raise exception 'sem permissão';
  end if;

  update pedidos
  set status = 'pago'
  where cliente_telefone = p_cliente_telefone
    and status not in ('pago', 'cancelado');

  insert into impressoes_pendentes (cliente_telefone) values (p_cliente_telefone);
end;
$$;

revoke all on function fechar_conta_garcom(text) from public;
grant execute on function fechar_conta_garcom(text) to authenticated;
