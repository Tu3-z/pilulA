-- ==========================================================================
-- V3 · Segurança no Supabase (só roda lá, não nos testes).
--
-- O Supabase publica toda tabela do schema "public" numa API REST própria,
-- que qualquer um com a chave pública (anon key) consegue chamar.
-- Ligar o RLS (Row Level Security) SEM criar políticas fecha essa porta:
-- ninguém lê nem escreve por ela. O nosso back-end continua funcionando,
-- porque conecta direto no Postgres como dono das tabelas (o RLS não se
-- aplica ao dono).
--
-- A tabela do próprio Flyway (flyway_schema_history) NÃO pode ser alterada
-- aqui: o Flyway está usando ela durante a migration e o ALTER TABLE fica
-- esperando até estourar o tempo. O RLS dela é ligado uma vez, à mão, no
-- SQL Editor do Supabase (ver backend/README.md).
-- ==========================================================================

ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
