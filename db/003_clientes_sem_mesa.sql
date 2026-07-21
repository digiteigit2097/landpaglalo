-- 003: substitui "mesa" por "cliente" (nome + telefone) — ambiente sem
-- mesas fixas, com gente em pé. Ver docs da decisão: caixa confere pedido
-- antes de mandar pra cozinha (não há trava técnica de presença física).

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text not null,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

create index idx_clientes_telefone on clientes(telefone);

alter table pedidos
  drop column mesa_id,
  drop column mesa_numero,
  add column cliente_id uuid references clientes(id),
  add column cliente_nome text not null default '',
  add column cliente_telefone text not null default '';

alter table pedidos alter column cliente_nome drop default;
alter table pedidos alter column cliente_telefone drop default;

drop table mesas;

alter table clientes enable row level security;
-- sem policy de select/insert direto: tudo passa pela função criar_pedido
-- (security definer), então anon não lê nem escreve a tabela clientes à toa.

create or replace function criar_pedido(
  p_cliente_nome text,
  p_cliente_telefone text,
  p_itens jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_telefone_norm text;
  v_nome text;
  v_cliente_id uuid;
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
  v_nome := nullif(trim(coalesce(p_cliente_nome, '')), '');
  v_telefone_norm := regexp_replace(coalesce(p_cliente_telefone, ''), '\D', '', 'g');

  if v_nome is null or length(v_nome) < 2 then
    raise exception 'informe o nome';
  end if;
  if length(v_telefone_norm) < 10 then
    raise exception 'informe um telefone válido com DDD';
  end if;

  if p_itens is null or jsonb_array_length(p_itens) = 0 then
    raise exception 'pedido vazio';
  end if;

  select id into v_cliente_id from clientes where telefone = v_telefone_norm;
  if v_cliente_id is null then
    insert into clientes (nome, telefone) values (v_nome, v_telefone_norm)
    returning id into v_cliente_id;
  else
    update clientes set nome = v_nome, ativo = true where id = v_cliente_id;
  end if;

  insert into pedidos (cliente_id, cliente_nome, cliente_telefone, total)
  values (v_cliente_id, v_nome, v_telefone_norm, 0)
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

  return jsonb_build_object('pedido_id', v_pedido_id, 'total', v_total, 'cliente_nome', v_nome);
end;
$$;

revoke all on function criar_pedido(int, jsonb) from public;
drop function if exists criar_pedido(int, jsonb);

revoke all on function criar_pedido(text, text, jsonb) from public;
grant execute on function criar_pedido(text, text, jsonb) to anon, authenticated;
