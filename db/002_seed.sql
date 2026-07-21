-- 002: seed com o cardápio atual (Copa Brasil 2026-07)

insert into categorias (nome, ordem) values
  ('Cheese', 1),
  ('Hot Dog', 2),
  ('Bebidas', 3);

-- ===== Cheese (preço base = normal; variações Normal/Artesanal) =====
with cat as (select id from categorias where nome = 'Cheese')
insert into produtos (categoria_id, nome, descricao, preco, ordem)
select cat.id, p.nome, p.descricao, p.preco, p.ordem from cat, (values
  ('X-Burguer', 'Hambúrguer, mussarela, presunto, maionese, catchup e mostarda', 13.00, 1),
  ('X-Salada', 'Hambúrguer, mussarela, presunto, tomate, alface, maionese, catchup e mostarda', 16.00, 2),
  ('X-Bacon', 'Hambúrguer, bacon, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 20.00, 3),
  ('X-Egg', 'Hambúrguer, 2 ovos, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 20.00, 4),
  ('X-Frango', 'Hambúrguer, frango, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 20.00, 5),
  ('X-Frango Bacon', 'Hambúrguer, frango, bacon, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 24.00, 6),
  ('X-Calabresa', 'Hambúrguer, calabresa, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 20.00, 7),
  ('X-Egg Bacon', 'Hambúrguer, bacon, 2 ovos, mussarela, presunto, tomate, alface, catchup, maionese e mostarda', 24.00, 8),
  ('X-Tudo', 'Hambúrguer, salsicha, bacon, ovo, frango, calabresa, mussarela, presunto, tomate, alface, batata palha, catchup, maionese e mostarda', 30.00, 9)
) as p(nome, descricao, preco, ordem);

with precos as (
  select * from (values
    ('X-Burguer', 13.00, 16.00),
    ('X-Salada', 16.00, 20.00),
    ('X-Bacon', 20.00, 23.00),
    ('X-Egg', 20.00, 22.00),
    ('X-Frango', 20.00, 23.00),
    ('X-Frango Bacon', 24.00, 27.00),
    ('X-Calabresa', 20.00, 22.00),
    ('X-Egg Bacon', 24.00, 27.00),
    ('X-Tudo', 30.00, 34.00)
  ) as v(nome, normal, artesanal)
)
insert into produto_variacoes (produto_id, nome, preco, ordem)
select pr.id, v.vnome, v.vpreco, v.vordem
from precos p
join produtos pr on pr.nome = p.nome
cross join lateral (values
  ('Normal', p.normal, 1),
  ('Artesanal', p.artesanal, 2)
) as v(vnome, vpreco, vordem);

-- ===== Hot Dog =====
with cat as (select id from categorias where nome = 'Hot Dog')
insert into produtos (categoria_id, nome, descricao, preco, ordem)
select cat.id, p.nome, p.descricao, p.preco, p.ordem from cat, (values
  ('Dog Simples', 'Salsicha, tomate, batata palha, maionese, catchup e mostarda', 11.00, 1),
  ('Dog Duplo', '2 salsichas, tomate, batata palha, maionese, catchup e mostarda', 13.00, 2),
  ('Dog Queijo', 'Queijo, salsicha, tomate, maionese, catchup e mostarda', 15.00, 3),
  ('Dog Frios', 'Queijo, presunto, salsicha, tomate, maionese, catchup e mostarda', 17.00, 4),
  ('Dog Egg', 'Ovo, salsicha, tomate, maionese, catchup e mostarda', 15.00, 5),
  ('Dog Frango', 'Frango, salsicha, tomate, maionese, catchup e mostarda', 17.00, 6),
  ('Dog Frango Duplo', 'Frango, 2 salsichas, tomate, maionese, catchup e mostarda', 20.00, 7),
  ('Dog Bacon', 'Salsicha, bacon, tomate, maionese, catchup e mostarda', 17.00, 8),
  ('Dog Bacon Duplo', '2 salsichas, bacon, tomate, maionese, catchup e mostarda', 20.00, 9),
  ('Dog Burguer', 'Salsicha, hambúrguer, tomate, maionese, catchup e mostarda', 16.00, 10),
  ('Dog Calabresa', 'Calabresa, salsicha, tomate, maionese, catchup e mostarda', 17.00, 11),
  ('Dog Frango Bacon', 'Bacon, frango, salsicha, tomate, maionese, catchup e mostarda', 20.00, 12),
  ('Dogão do Lalo', 'Frango, bacon, mussarela, salsicha, tomate, maionese, catchup e mostarda', 22.00, 13),
  ('Dogão do Lalo Especial', 'Frango, bacon, mussarela, salsicha, tomate, maionese, catchup, mostarda e hambúrguer artesanal', 27.00, 14)
) as p(nome, descricao, preco, ordem);

-- Dog Burguer tem versão artesanal
insert into produto_variacoes (produto_id, nome, preco, ordem)
select id, v.nome, v.preco, v.ordem
from produtos p
cross join lateral (values
  ('Normal', 16.00, 1),
  ('Artesanal', 18.00, 2)
) as v(nome, preco, ordem)
where p.nome = 'Dog Burguer';

-- ===== Bebidas =====
with cat as (select id from categorias where nome = 'Bebidas')
insert into produtos (categoria_id, nome, preco, ordem)
select cat.id, p.nome, p.preco, p.ordem from cat, (values
  ('Coca-Cola Zero 600 ml', 7.00, 1),
  ('Coca-Cola Zero lata 350 ml', 6.00, 2),
  ('Coca-Cola 2 litros', 13.00, 3),
  ('Refriço 2 litros', 9.00, 4),
  ('Coca-Cola lata 350 ml', 6.00, 5),
  ('Guaraná 350 ml', 6.00, 6),
  ('Fanta lata 350 ml', 6.00, 7),
  ('Suco laranja 1 litro', 13.00, 8),
  ('Suco laranja Frutarelle 330 ml', 7.00, 9),
  ('Suco maracujá Frutarelle 1 litro', 13.00, 10),
  ('Suco maracujá Frutarelle 330 ml', 7.00, 11)
) as p(nome, preco, ordem);

-- ===== Adicionais =====
insert into adicionais (nome, preco, ordem) values
  ('Ovo', 1.00, 1),
  ('Salsicha', 1.00, 2),
  ('Presunto', 1.00, 3),
  ('Queijo', 4.00, 4),
  ('Hambúrguer', 4.00, 5),
  ('Frango', 6.00, 6),
  ('Calabresa', 6.00, 7),
  ('Bacon', 7.00, 8),
  ('Batata palha', 2.00, 9),
  ('Molho verde', 1.00, 10),
  ('Molho pimenta', 1.00, 11),
  ('Tomate', 1.00, 12),
  ('Alface', 1.00, 13),
  ('Hambúrguer artesanal', 7.00, 14);

-- padrão inicial: lanches (Cheese e Hot Dog) aceitam todos os adicionais;
-- bebidas nenhum. Ajuste fino fica pro admin.
insert into produto_adicionais (produto_id, adicional_id)
select p.id, a.id
from produtos p
join categorias c on c.id = p.categoria_id and c.nome in ('Cheese', 'Hot Dog')
cross join adicionais a;

-- mesa de teste (as demais serão criadas no admin)
insert into mesas (numero) values (1);
