-- Mesma regra da V3/V5/V7: toda tabela no schema public do Supabase precisa de RLS,
-- senão fica aberta pela Data API. Sem policies, só o backend acessa os pedidos.
ALTER TABLE pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_pedido ENABLE ROW LEVEL SECURITY;
