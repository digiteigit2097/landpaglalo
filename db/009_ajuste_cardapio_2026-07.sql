-- 009: reajuste de preços e novos itens (cardápio impresso 2026-07)
-- fonte: cardapio-dogao-do-lalo.png (novo layout Cheese/Hot Dog)

-- ===== Cheese: novos preços/descrições (sem "mostarda"), novo item X-Burgue Dog =====
update produtos set descricao = 'Hambúrguer, queijo, presunto, catchup e maionese', preco = 16.00
  where id = '49694ae8-42a2-49e0-8dc1-ae95b6474714'; -- X-Burguer
update produtos set descricao = 'Hambúrguer, queijo, presunto, tomate, alface, catchup e maionese', preco = 20.00
  where id = 'f9dfeb45-e201-4e56-a94b-aec822c26ccb'; -- X-Salada
update produtos set descricao = 'Hambúrguer, queijo, bacon, presunto, tomate, alface, catchup e maionese', preco = 25.00
  where id = '8fc1a744-7f21-496c-93ab-8cf1534610dd'; -- X-Bacon
update produtos set descricao = 'Hambúrguer, queijo, 2 ovos, presunto, tomate, alface, catchup e maionese', preco = 24.00
  where id = 'f592ea1a-9978-4cbe-a8d5-b271e68e2b4d'; -- X-Egg
update produtos set descricao = 'Hambúrguer, queijo, frango, presunto, tomate, alface, catchup e maionese', preco = 25.00
  where id = '099cdc35-155a-4f7e-8a54-6af8d5551e4d'; -- X-Frango
update produtos set descricao = 'Hambúrguer, queijo, frango, bacon, presunto, tomate, alface, catchup e maionese', preco = 28.00
  where id = '010700cb-bf61-4efb-8b56-b09443c757ad'; -- X-Frango Bacon
update produtos set descricao = 'Hambúrguer, queijo, calabresa, presunto, tomate, alface, catchup e maionese', preco = 24.00
  where id = '03900d03-b32a-43c8-b853-6f340623df87'; -- X-Calabresa
update produtos set descricao = 'Hambúrguer, queijo, bacon, 2 ovos, presunto, tomate, alface, catchup e maionese', preco = 28.00, ordem = 9
  where id = 'e90f3368-08d8-438e-95d6-016987579b77'; -- X-Egg Bacon (ordem +1, abre espaço pro X-Burgue Dog)
update produtos set descricao = 'Hambúrguer, queijo, bacon, ovo, frango, calabresa, salsicha, presunto, tomate, alface, batata palha, catchup e maionese', preco = 35.00, ordem = 10
  where id = 'b36b00a1-bf2b-4c0b-a0f9-d1761638d00a'; -- X-Tudo

update produto_variacoes set preco = 16.00 where id = '26108386-dfe1-4012-9a26-84ab0948df7c'; -- X-Burguer Normal
update produto_variacoes set preco = 20.00 where id = '1e11cd59-a53d-4fd8-a19e-1700b39ce706'; -- X-Burguer Artesanal
update produto_variacoes set preco = 20.00 where id = '83daf3e1-9bd0-422d-9c43-ff87f69fc7f0'; -- X-Salada Normal
update produto_variacoes set preco = 25.00 where id = '44cd83ad-851a-49ef-9778-86b06044fcf2'; -- X-Salada Artesanal
update produto_variacoes set preco = 25.00 where id = '3e4fd4f8-ae66-4605-a00f-f05b1b022789'; -- X-Bacon Normal
update produto_variacoes set preco = 30.00 where id = 'c0565e1a-9fe0-4f66-846a-40941eb60eb4'; -- X-Bacon Artesanal
update produto_variacoes set preco = 24.00 where id = '137656a8-da36-48f9-b503-d11b7af51bc7'; -- X-Egg Normal
update produto_variacoes set preco = 28.00 where id = '3eca7802-41dd-4aa9-8a2e-5614c81329d4'; -- X-Egg Artesanal
update produto_variacoes set preco = 25.00 where id = 'fb5024a0-9f1b-43af-81c1-6eea82218193'; -- X-Frango Normal
update produto_variacoes set preco = 30.00 where id = '74284a8d-3c70-4c59-832a-37ade82efd38'; -- X-Frango Artesanal
update produto_variacoes set preco = 28.00 where id = '2fb63373-2a31-408f-9366-8ea62838adb3'; -- X-Frango Bacon Normal
update produto_variacoes set preco = 33.00 where id = '31e801fa-47e3-4042-b642-b529f0a1e3f1'; -- X-Frango Bacon Artesanal
update produto_variacoes set preco = 24.00 where id = '580ffa38-b191-4638-af56-b66e4731f782'; -- X-Calabresa Normal
update produto_variacoes set preco = 28.00 where id = 'a6cc5f09-ca16-4b2a-9a7b-56f7545f5f59'; -- X-Calabresa Artesanal
update produto_variacoes set preco = 28.00 where id = '3573d29b-69af-445c-bb04-1975a0b99dac'; -- X-Egg Bacon Normal
update produto_variacoes set preco = 33.00 where id = 'df521682-1f0e-4969-90de-65e901e0f2fa'; -- X-Egg Bacon Artesanal
update produto_variacoes set preco = 35.00 where id = 'f80714d4-288c-4f09-b0bc-7d38dd254444'; -- X-Tudo Normal
update produto_variacoes set preco = 42.00 where id = '1437faf7-d378-4563-9a91-f74f6ee541b3'; -- X-Tudo Artesanal

-- novo item: X-Burgue Dog (ordem 8, entre X-Calabresa e X-Egg Bacon)
with novo as (
  insert into produtos (categoria_id, nome, descricao, preco, ordem)
  values ('9846f405-c865-49c2-b62e-b5c88b7fa851', 'X-Burgue Dog',
          'Hambúrguer, presunto, queijo, salsicha, catchup e maionese', 20.00, 8)
  returning id
)
insert into produto_variacoes (produto_id, nome, preco, ordem)
select novo.id, v.nome, v.preco, v.ordem
from novo
cross join lateral (values ('Normal', 20.00, 1), ('Artesanal', 24.00, 2)) as v(nome, preco, ordem);

insert into produto_adicionais (produto_id, adicional_id)
select p.id, a.id
from produtos p, adicionais a
where p.nome = 'X-Burgue Dog';

-- ===== Hot Dog: novos preços/descrições (sem "mostarda"), novo item Dog Queijo Duplo =====
update produtos set descricao = 'Salsicha, tomate, batata palha, catchup e maionese', preco = 14.00
  where id = 'c0f2e322-a510-4189-80d4-5a9726522bb4'; -- Dog Simples
update produtos set descricao = '2 salsichas, tomate, batata palha, catchup e maionese', preco = 16.00
  where id = '00454521-334c-47ba-918b-e95b8691c854'; -- Dog Duplo
update produtos set descricao = 'Queijo, salsicha, tomate, catchup e maionese', preco = 18.00
  where id = 'bcc418f5-0cad-47f4-a600-a52d4bba063d'; -- Dog Queijo
update produtos set descricao = 'Queijo, presunto, salsicha, tomate, catchup e maionese', preco = 20.00, ordem = 5
  where id = '76faa182-8e6b-44ae-a365-fd8e25965fd5'; -- Dog Frios (ordem +1, abre espaço pro Dog Queijo Duplo)
update produtos set descricao = 'Ovo, salsicha, tomate, catchup e maionese', preco = 18.00, ordem = 6
  where id = '974d0b45-3212-40ab-acad-958c24ba927e'; -- Dog Egg
update produtos set descricao = 'Frango, salsicha, tomate, catchup e maionese', preco = 22.00, ordem = 7
  where id = 'ea66dac1-b9d6-436a-bb4c-badab56a3039'; -- Dog Frango
update produtos set descricao = 'Frango, 2 salsichas, tomate, catchup e maionese', preco = 24.00, ordem = 8
  where id = '6e7e34c9-ae1d-40b2-805b-5d7312094bbb'; -- Dog Frango Duplo
update produtos set descricao = 'Salsicha, bacon, tomate, catchup e maionese', preco = 22.00, ordem = 9
  where id = '8d816e9c-37b1-48e2-a8d2-2f4875c63146'; -- Dog Bacon
update produtos set descricao = '2 salsichas, bacon, tomate, catchup e maionese', preco = 24.00, ordem = 10
  where id = 'f137c250-d9ea-4f7b-a48f-0a17724a3314'; -- Dog Bacon Duplo
update produtos set descricao = 'Salsicha, hambúrguer, queijo, tomate, catchup e maionese', preco = 20.00, ordem = 11
  where id = 'f227cb14-fc5f-4310-b960-6644c48ac4c5'; -- Dog Burguer
update produtos set descricao = 'Calabresa, salsicha, tomate, catchup e maionese', preco = 20.00, ordem = 12
  where id = 'a916e4b6-d212-42da-8d6c-c8bd5e107082'; -- Dog Calabresa
update produtos set descricao = 'Bacon, frango, salsicha, tomate, catchup e maionese', preco = 26.00, ordem = 13
  where id = 'c39d9f64-a82d-46b5-9b02-f17a6316e8fa'; -- Dog Frango Bacon
update produtos set descricao = 'Frango, bacon, queijo, salsicha, tomate, catchup e maionese', preco = 27.00, ordem = 14
  where id = '8de78b78-4ace-4769-8a82-ec8f2da71139'; -- Dogão do Lalo
update produtos set descricao = 'Hambúrguer artesanal, frango, bacon, queijo, salsicha, tomate, catchup e maionese', preco = 33.00, ordem = 15
  where id = 'e3a8f298-db4b-4dca-845c-31de98241cc6'; -- Dogão do Lalo Especial

update produto_variacoes set preco = 20.00 where id = 'e04d3ef7-68e7-4884-b49e-66d5a7dd4cb9'; -- Dog Burguer Normal
update produto_variacoes set preco = 24.00 where id = 'e9161b1f-3f69-4d22-8daa-2059cee91056'; -- Dog Burguer Artesanal

-- novo item: Dog Queijo Duplo (ordem 4, logo após Dog Queijo)
with novo as (
  insert into produtos (categoria_id, nome, descricao, preco, ordem)
  values ('59dd3bfd-2ce6-4aed-bcbb-1ff28181f9f1', 'Dog Queijo Duplo',
          '2 salsichas, queijo, tomate, catchup e maionese', 21.00, 4)
  returning id
)
insert into produto_adicionais (produto_id, adicional_id)
select novo.id, a.id from novo, adicionais a;

-- ===== Adicionais: reajuste de preços + renomeações (contagem inalterada: 14) =====
update adicionais set preco = 4.00, ordem = 6 where id = '2c88a59b-e642-4aca-95b1-8ce128d2e0b8'; -- Ovo
update adicionais set preco = 4.00, ordem = 7 where id = '0d886db9-8262-48dc-8026-323b59328b22'; -- Salsicha
update adicionais set preco = 4.00, ordem = 9 where id = '152f75b0-acf5-492f-a686-b18a1a89e5cc'; -- Presunto
update adicionais set preco = 5.00, ordem = 8 where id = '3ae74b2e-a404-4303-ae18-88cbe8edc509'; -- Queijo
update adicionais set nome = 'Hambúrguer simples', preco = 4.00, ordem = 5 where id = '207ac585-fc88-413a-9d36-9a5c63ca0055'; -- Hambúrguer -> Hambúrguer simples
update adicionais set preco = 7.00, ordem = 1 where id = 'ceb135d0-2c5f-4d83-b60c-8b94469938cf'; -- Frango
update adicionais set preco = 7.00, ordem = 3 where id = '77d1e304-28d8-4327-b623-adf67cefa391'; -- Calabresa
update adicionais set preco = 8.00, ordem = 2 where id = '417cfad9-9b21-4409-9785-0d1161621025'; -- Bacon
update adicionais set preco = 3.00, ordem = 10 where id = 'ae351966-b2b3-4107-acdd-cba721317bbc'; -- Batata palha
update adicionais set nome = 'Molho verde sachê', preco = 1.00, ordem = 14 where id = 'f9e2a9fe-57fa-4dbc-81a1-202130c0d070'; -- Molho verde -> sachê
update adicionais set nome = 'Pimenta sachê', preco = 1.00, ordem = 13 where id = '2d98c9c8-a01a-4f48-ba29-e51c53a94dd2'; -- Molho pimenta -> Pimenta sachê
update adicionais set preco = 2.00, ordem = 12 where id = '1453b37b-8913-4c8d-80cb-542ab5af4569'; -- Tomate
update adicionais set preco = 2.00, ordem = 11 where id = '432f40af-122e-456f-bd65-0571109a4bf9'; -- Alface
update adicionais set preco = 8.00, ordem = 4 where id = 'e2f8af83-e1c3-4c15-b850-cba08314b8b1'; -- Hambúrguer artesanal

-- ===== Bebidas: novo cardápio simplificado (4 itens). Sem excluir linhas
-- (produto_id é referenciado por pedido_itens sem cascade) — reaproveita 4
-- linhas existentes e desativa as demais, que saem da lista pública. =====
update produtos set nome = 'Refrigerante lata 350 ml (Coca, Fanta, Guaraná)', descricao = null, preco = 7.00, ordem = 1
  where id = '308ed384-4ac9-4f3e-95c6-cd0c2629a020'; -- era Coca-Cola Zero lata 350 ml
update produtos set nome = 'Refrigerante 600 ml', descricao = null, preco = 10.00, ordem = 2
  where id = '9d91e607-2b23-47a5-998d-945e73e25cfa'; -- era Coca-Cola Zero 600 ml
update produtos set nome = 'Refrigerante 1 litro', descricao = null, preco = 8.00, ordem = 3
  where id = '4b0852db-8437-4a51-b6dc-50ebd641cc4f'; -- era Suco laranja 1 litro
update produtos set nome = 'Refrigerante Refriko Guaraná 2L', descricao = null, preco = 11.00, ordem = 4
  where id = '03fdcd8f-9527-49ed-a9d5-dd67e18c2867'; -- era Refriço 2 litros

update produtos set ativo = false
  where id in (
    '5a1592e1-017c-4823-8ab8-e59d63c72a27', -- Coca-Cola 2 litros
    '865cc8db-40b8-4011-af19-e2efa91265b0', -- Coca-Cola lata 350 ml
    '895534c5-0d07-4a60-b187-0c6878fc2f42', -- Guaraná 350 ml
    '05abb7f7-66bc-4078-bb93-dbd99a2a7ea9', -- Fanta lata 350 ml
    '6c489c63-45c6-4419-a2be-e7b400ba7049', -- Suco laranja Frutarelle 330 ml
    'c751eb87-1ebe-40af-b73b-94e032114e9f', -- Suco maracujá Frutarelle 1 litro
    '9a38d8e3-d0b1-4a68-ad95-43411c05392c'  -- Suco maracujá Frutarelle 330 ml
  );
