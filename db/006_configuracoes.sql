-- 006: configurações gerais da loja (chave/valor) — começa com o domínio
-- usado pra montar a URL do QR Code do cardápio, editável pelo admin sem
-- precisar mexer em código/deploy.

create table configuracoes (
  chave text primary key,
  valor text not null default '',
  atualizado_em timestamptz not null default now()
);

alter table configuracoes enable row level security;

create policy "admin le configuracoes" on configuracoes
  for select using (is_admin());
create policy "admin escreve configuracoes" on configuracoes
  for insert with check (is_admin());
create policy "admin atualiza configuracoes" on configuracoes
  for update using (is_admin());

insert into configuracoes (chave, valor) values ('dominio_cardapio', '');
