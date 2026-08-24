-- 010: por produto, permite esconder os adicionais no cardápio público
-- sem precisar desmarcar cada adicional permitido individualmente.

alter table produtos
  add column mostrar_adicionais boolean not null default true;
