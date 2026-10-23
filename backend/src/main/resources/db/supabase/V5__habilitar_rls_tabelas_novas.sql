-- ==========================================================================
-- V5 · RLS de novo nas tabelas do catálogo (só no Supabase).
-- A V4 recriou categoria, subcategoria e produto, e o RLS é uma configuração
-- de cada tabela: as tabelas novas nascem sem ele. Ver a explicação na V3.
-- ==========================================================================

ALTER TABLE categoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE produto ENABLE ROW LEVEL SECURITY;
