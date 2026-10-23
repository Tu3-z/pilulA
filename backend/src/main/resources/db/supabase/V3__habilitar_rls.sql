-- ==========================================================================
-- V3 · Segurança no Supabase (só roda lá, não nos testes).
--
-- O Supabase publica toda tabela do schema "public" numa API REST própria,
-- que qualquer um com a chave pública (anon key) consegue chamar.
-- Ligar o RLS (Row Level Security) SEM criar políticas fecha essa porta:
-- ninguém lê nem escreve por ela. O nosso back-end continua funcionando,
-- porque conecta direto no Postgres como dono das tabelas (o RLS não se
-- aplica ao dono).
-- ==========================================================================

ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE flyway_schema_history ENABLE ROW LEVEL SECURITY;
