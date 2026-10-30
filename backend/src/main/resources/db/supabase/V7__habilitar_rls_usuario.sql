-- Mesma regra da V3/V5: toda tabela no schema public do Supabase precisa de RLS,
-- senão fica aberta pela Data API (a chave anon do projeto conseguiria ler os usuários).
-- Sem nenhuma policy, só o backend (que conecta como postgres) acessa a tabela.
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
