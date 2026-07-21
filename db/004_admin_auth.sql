-- 004: acesso do painel admin (login + cadastro de usuários) e realtime

create table admin_usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- security definer: pode ler admin_usuarios pra checar o próprio acesso
-- mesmo sem policy de select liberada pra authenticated em geral.
create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_usuarios au
    where au.id = auth.uid() and au.ativo
  );
$$;

alter table admin_usuarios enable row level security;
create policy "admin le admin_usuarios" on admin_usuarios
  for select using (is_admin());
-- insert/update de admin_usuarios só via service role (criação de usuário
-- roda em server action, nunca client-side).

create policy "admin le pedidos" on pedidos
  for select using (is_admin());
create policy "admin atualiza pedidos" on pedidos
  for update using (is_admin());

create policy "admin le pedido_itens" on pedido_itens
  for select using (is_admin());

create policy "admin le pedido_item_adicionais" on pedido_item_adicionais
  for select using (is_admin());

create policy "admin le clientes" on clientes
  for select using (is_admin());

-- tempo real pra fila de pedidos do caixa
alter publication supabase_realtime add table pedidos;
