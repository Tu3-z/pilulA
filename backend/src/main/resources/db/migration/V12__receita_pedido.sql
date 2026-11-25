-- =============================================================================
-- V12: Adiciona suporte a envio e revisão de receita médica nos pedidos
-- =============================================================================

-- URL da foto da receita (armazenada como link externo ou base64)
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS receita_url TEXT;

-- Status de validação da receita
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS receita_status VARCHAR(30) DEFAULT 'NAO_EXIGIDA';

-- Observação do farmacêutico ao aprovar/rejeitar
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS receita_obs TEXT;

-- Data em que a receita foi revisada
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS receita_revisada_em TIMESTAMPTZ;
