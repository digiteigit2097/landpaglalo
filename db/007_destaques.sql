-- 007: "queridinhos da galera" (cards de destaque da home) editáveis pelo
-- admin, em vez de tag/descrição fixas no código.

create table destaques (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  tag text not null,
  descricao text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create index idx_destaques_produto on destaques(produto_id);

alter table destaques enable row level security;

create policy "destaques publico" on destaques
  for select using (ativo);
create policy "admin le todos destaques" on destaques
  for select using (is_admin());
create policy "admin escreve destaques" on destaques
  for insert with check (is_admin());
create policy "admin atualiza destaques" on destaques
  for update using (is_admin());
create policy "admin deleta destaques" on destaques
  for delete using (is_admin());

-- seed: migra os 3 destaques que hoje vivem hardcoded em lib/menu.ts
insert into destaques (produto_id, tag, descricao, ordem)
select id, 'O favorito',
  'O carro-chefe da casa: frango, bacon, mussarela, salsicha e hambúrguer artesanal',
  1
from produtos where nome = 'Dogão do Lalo Especial';

insert into destaques (produto_id, tag, descricao, ordem)
select id, 'Mais completo',
  'Pra matar a fome de verdade: salsicha, bacon, ovo, frango, calabresa e muito mais',
  2
from produtos where nome = 'X-Tudo';

insert into destaques (produto_id, tag, descricao, ordem)
select id, 'A partir de',
  'O clássico que nunca falha, com batata palha crocante',
  3
from produtos where nome = 'Dog Simples';
