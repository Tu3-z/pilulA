-- ==========================================================================
-- V1 · Tabelas do catálogo: categoria, subcategoria e produto.
--
-- Migrations do Flyway: cada arquivo roda UMA vez, em ordem (V1, V2, V3…),
-- e o Flyway anota na tabela flyway_schema_history o que já rodou.
-- Para mudar o banco depois, crie um arquivo novo (V4__...). Nunca edite
-- um arquivo que já rodou no Supabase: o Flyway confere e recusa.
--
-- SQL padrão: roda no PostgreSQL (Supabase) e no H2 dos testes.
-- ==========================================================================

CREATE TABLE categoria (
  id       VARCHAR(50)  PRIMARY KEY,           -- ex.: 'medicamentos'
  nome     VARCHAR(100) NOT NULL,
  rotulo   VARCHAR(100),                       -- nome com quebra opcional (&shy;)
  arquivo  VARCHAR(100),
  tom      VARCHAR(20),
  ordem    INTEGER      NOT NULL DEFAULT 0     -- posição no menu
);

CREATE TABLE subcategoria (
  id            VARCHAR(50)  PRIMARY KEY,      -- ex.: 'dor-febre'
  nome          VARCHAR(100) NOT NULL,
  categoria_id  VARCHAR(50)  NOT NULL REFERENCES categoria (id),
  ordem         INTEGER      NOT NULL DEFAULT 0
);

CREATE TABLE produto (
  id               VARCHAR(80)   PRIMARY KEY,  -- ex.: 'dorflex-36'
  nome             VARCHAR(150)  NOT NULL,
  marca            VARCHAR(100)  NOT NULL,
  sub              VARCHAR(100),               -- apresentação: '36 comprimidos'
  selo             VARCHAR(30),                -- '-22%', 'novo'…
  descricao        VARCHAR(500),
  preco            NUMERIC(10,2) NOT NULL CHECK (preco >= 0),
  preco_antigo     NUMERIC(10,2) CHECK (preco_antigo >= 0),
  receita          VARCHAR(20)   NOT NULL CHECK (receita IN ('LIVRE', 'PRESCRICAO', 'RETENCAO')),
  destaque         BOOLEAN       NOT NULL DEFAULT FALSE,
  categoria_id     VARCHAR(50)   NOT NULL REFERENCES categoria (id),
  subcategoria_id  VARCHAR(50)   REFERENCES subcategoria (id),
  forma            VARCHAR(20),                -- ilustração: 'CAIXA', 'FRASCO'… (classe Arte)
  rotulo           VARCHAR(40),                -- texto na ilustração
  foto             VARCHAR(255),               -- caminho da foto no front-end (opcional)
  ordem            INTEGER       NOT NULL DEFAULT 0
);

CREATE INDEX idx_subcategoria_categoria ON subcategoria (categoria_id);
CREATE INDEX idx_produto_categoria ON produto (categoria_id);
CREATE INDEX idx_produto_subcategoria ON produto (subcategoria_id);
