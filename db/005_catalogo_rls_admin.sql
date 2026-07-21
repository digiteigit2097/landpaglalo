-- 005: painel admin passa a gerenciar o catálogo (produtos, variações,
-- adicionais, categorias) — precisa de policies de escrita pra authenticated
-- quando is_admin(). O público (anon) continua só lendo o que está ativo
-- (policies da migração 001, mantidas).

create policy "admin le todas categorias" on categorias
  for select using (is_admin());
create policy "admin escreve categorias" on categorias
  for insert with check (is_admin());
create policy "admin atualiza categorias" on categorias
  for update using (is_admin());
create policy "admin deleta categorias" on categorias
  for delete using (is_admin());

create policy "admin le todos produtos" on produtos
  for select using (is_admin());
create policy "admin escreve produtos" on produtos
  for insert with check (is_admin());
create policy "admin atualiza produtos" on produtos
  for update using (is_admin());
create policy "admin deleta produtos" on produtos
  for delete using (is_admin());

create policy "admin escreve variacoes" on produto_variacoes
  for insert with check (is_admin());
create policy "admin atualiza variacoes" on produto_variacoes
  for update using (is_admin());
create policy "admin deleta variacoes" on produto_variacoes
  for delete using (is_admin());

create policy "admin le todos adicionais" on adicionais
  for select using (is_admin());
create policy "admin escreve adicionais" on adicionais
  for insert with check (is_admin());
create policy "admin atualiza adicionais" on adicionais
  for update using (is_admin());
create policy "admin deleta adicionais" on adicionais
  for delete using (is_admin());

create policy "admin escreve produto_adicionais" on produto_adicionais
  for insert with check (is_admin());
create policy "admin atualiza produto_adicionais" on produto_adicionais
  for update using (is_admin());
create policy "admin deleta produto_adicionais" on produto_adicionais
  for delete using (is_admin());
