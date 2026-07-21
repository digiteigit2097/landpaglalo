-- Dogão do Lalo — cardápio digital de mesa
-- 001: catálogo, mesas e pedidos

create table categorias (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table produtos (
  id uuid primary key default gen_random_uuid(),
  categoria_id uuid not null references categorias(id) on delete cascade,
  nome text not null,
  descricao text,
  preco numeric(10,2) not null check (preco >= 0),
  imagem_url text,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ex.: Normal R$ 20 / Artesanal R$ 23 (produtos sem variação não têm linhas aqui)
create table produto_variacoes (
  id uuid primary key default gen_random_uuid(),
  produto_id uuid not null references produtos(id) on delete cascade,
  nome text not null,
  preco numeric(10,2) not null check (preco >= 0),
  ordem int not null default 0
);

create table adicionais (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  preco numeric(10,2) not null check (preco >= 0),
  ordem int not null default 0,
  ativo boolean not null default true
);

-- quais adicionais cada produto aceita (admin configura)
create table produto_adicionais (
  produto_id uuid not null references produtos(id) on delete cascade,
  adicional_id uuid not null references adicionais(id) on delete cascade,
  max_qtd int not null default 5 check (max_qtd > 0),
  primary key (produto_id, adicional_id)
);

create table mesas (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique check (numero > 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create table pedidos (
  id bigint generated always as identity primary key,
  mesa_id uuid not null references mesas(id),
  mesa_numero int not null,
  status text not null default 'novo'
    check (status in ('novo','impresso','em_preparo','entregue','pago','cancelado')),
  total numeric(10,2) not null check (total >= 0),
  criado_em timestamptz not null default now()
);

create table pedido_itens (
  id bigint generated always as identity primary key,
  pedido_id bigint not null references pedidos(id) on delete cascade,
  produto_id uuid not null references produtos(id),
  produto_nome text not null,
  variacao text,
  quantidade int not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0),
  observacao text
);

create table pedido_item_adicionais (
  id bigint generated always as identity primary key,
  pedido_item_id bigint not null references pedido_itens(id) on delete cascade,
  adicional_id uuid not null references adicionais(id),
  adicional_nome text not null,
  quantidade int not null check (quantidade > 0),
  preco_unitario numeric(10,2) not null check (preco_unitario >= 0)
);

create index idx_produtos_categoria on produtos(categoria_id);
create index idx_variacoes_produto on produto_variacoes(produto_id);
create index idx_prod_adic_produto on produto_adicionais(produto_id);
create index idx_pedidos_status on pedidos(status);
create index idx_pedido_itens_pedido on pedido_itens(pedido_id);
create index idx_pia_item on pedido_item_adicionais(pedido_item_id);

-- ===== RLS =====
alter table categorias enable row level security;
alter table produtos enable row level security;
alter table produto_variacoes enable row level security;
alter table adicionais enable row level security;
alter table produto_adicionais enable row level security;
alter table mesas enable row level security;
alter table pedidos enable row level security;
alter table pedido_itens enable row level security;
alter table pedido_item_adicionais enable row level security;

-- catálogo: leitura pública apenas do que está ativo
create policy "catalogo publico" on categorias for select using (ativo);
create policy "catalogo publico" on produtos for select using (ativo);
create policy "catalogo publico" on produto_variacoes for select using (true);
create policy "catalogo publico" on adicionais for select using (ativo);
create policy "catalogo publico" on produto_adicionais for select using (true);
create policy "mesa publica" on mesas for select using (ativo);

-- pedidos: cliente anônimo NÃO lê nem escreve direto nas tabelas;
-- só cria pedido pela função criar_pedido (security definer).
-- Admin/caixa usam service role (bypassa RLS) por enquanto.

-- ===== função transacional de criação de pedido =====
-- payload de itens:
-- [{ "produto_id": "...", "variacao_id": "..."|null, "quantidade": 2,
--    "observacao": "...", "adicionais": [{"adicional_id":"...","quantidade":1}] }]
create or replace function criar_pedido(p_mesa_numero int, p_itens jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mesa mesas%rowtype;
  v_pedido_id bigint;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_adic jsonb;
  v_produto produtos%rowtype;
  v_preco numeric(10,2);
  v_variacao_nome text;
  v_qtd int;
  v_item_id bigint;
  v_item_total numeric(10,2);
  v_adic_row adicionais%rowtype;
  v_adic_qtd int;
  v_max_qtd int;
begin
  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'pedido vazio';
  end if;

  select * into v_mesa from mesas where numero = p_mesa_numero and ativo;
  if not found then
    raise exception 'mesa % não encontrada ou inativa', p_mesa_numero;
  end if;

  insert into pedidos (mesa_id, mesa_numero, total)
  values (v_mesa.id, v_mesa.numero, 0)
  returning id into v_pedido_id;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := coalesce((v_item->>'quantidade')::int, 0);
    if v_qtd < 1 or v_qtd > 50 then
      raise exception 'quantidade inválida';
    end if;

    select * into v_produto
    from produtos where id = (v_item->>'produto_id')::uuid and ativo;
    if not found then
      raise exception 'produto não encontrado';
    end if;

    v_preco := v_produto.preco;
    v_variacao_nome := null;
    if v_item->>'variacao_id' is not null then
      select nome, preco into v_variacao_nome, v_preco
      from produto_variacoes
      where id = (v_item->>'variacao_id')::uuid and produto_id = v_produto.id;
      if not found then
        raise exception 'variação inválida para %', v_produto.nome;
      end if;
    end if;

    insert into pedido_itens
      (pedido_id, produto_id, produto_nome, variacao, quantidade, preco_unitario, observacao)
    values
      (v_pedido_id, v_produto.id, v_produto.nome, v_variacao_nome, v_qtd, v_preco,
       nullif(trim(coalesce(v_item->>'observacao','')), ''))
    returning id into v_item_id;

    v_item_total := v_preco;

    for v_adic in select * from jsonb_array_elements(coalesce(v_item->'adicionais','[]'::jsonb)) loop
      v_adic_qtd := coalesce((v_adic->>'quantidade')::int, 0);
      if v_adic_qtd < 1 then
        raise exception 'quantidade de adicional inválida';
      end if;

      select a.* into v_adic_row
      from adicionais a
      where a.id = (v_adic->>'adicional_id')::uuid and a.ativo;
      if not found then
        raise exception 'adicional não encontrado';
      end if;

      select pa.max_qtd into v_max_qtd
      from produto_adicionais pa
      where pa.produto_id = v_produto.id and pa.adicional_id = v_adic_row.id;
      if not found then
        raise exception 'adicional % não permitido para %', v_adic_row.nome, v_produto.nome;
      end if;
      if v_adic_qtd > v_max_qtd then
        raise exception 'máximo de % un. de % para %', v_max_qtd, v_adic_row.nome, v_produto.nome;
      end if;

      insert into pedido_item_adicionais
        (pedido_item_id, adicional_id, adicional_nome, quantidade, preco_unitario)
      values
        (v_item_id, v_adic_row.id, v_adic_row.nome, v_adic_qtd, v_adic_row.preco);

      v_item_total := v_item_total + v_adic_row.preco * v_adic_qtd;
    end loop;

    v_total := v_total + v_item_total * v_qtd;
  end loop;

  update pedidos set total = v_total where id = v_pedido_id;

  return jsonb_build_object('pedido_id', v_pedido_id, 'total', v_total);
end;
$$;

revoke all on function criar_pedido(int, jsonb) from public;
grant execute on function criar_pedido(int, jsonb) to anon, authenticated;
