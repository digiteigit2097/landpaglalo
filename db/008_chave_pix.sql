-- 008: chave PIX pra gerar o QR de pagamento no cardápio impresso — mesma
-- tabela configuracoes já usada pro domínio do cardápio (migração 006).
insert into configuracoes (chave, valor) values ('chave_pix', '04459252996')
  on conflict (chave) do update set valor = excluded.valor;
