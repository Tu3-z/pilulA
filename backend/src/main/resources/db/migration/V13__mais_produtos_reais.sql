-- =============================================================================
-- V13: mais 43 produtos reais (o catálogo vai de 57 para 100)
-- =============================================================================
-- Nomes, marcas e apresentações de produtos vendidos em farmácias no Brasil;
-- preços aproximados de mercado. Sem foto: o site mostra a caixinha 3D.
--
-- Cada linha só entra se a categoria e a subcategoria existirem (JOIN) e se o
-- slug ainda não existir (ON CONFLICT DO NOTHING). Assim a migration não quebra
-- num banco em que alguém já tenha cadastrado um desses produtos pelo painel.

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'advil-400', 'Advil 400 mg', 'Advil', '8 cápsulas', NULL, 'Analgésico, antitérmico e anti-inflamatório (ibuprofeno).', 19.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'CAPSULA', NULL, 57
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'dor-febre'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'buscopan-composto', 'Buscopan Composto', 'Buscopan', '20 comprimidos', '-15%', 'Alívio de cólicas e dores abdominais (escopolamina + dipirona).', 27.90, 32.90, 'LIVRE', TRUE, c.id, s.id, 'BLISTER', 'BUSCO', 58
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'estomago'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'estomazil-sache', 'Estomazil sachê', 'Estomazil', '6 envelopes de 5 g', NULL, 'Antiácido efervescente para azia e má digestão.', 14.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PACOTE', 'ESTOM', 59
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'estomago'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'omeprazol-20', 'Omeprazol 20 mg', 'Genérico', '28 cápsulas', NULL, 'Reduz a produção de ácido no estômago. Medicamento genérico.', 15.90, NULL, 'PRESCRICAO', FALSE, c.id, s.id, 'CAPSULA', NULL, 60
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'estomago'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'claritin-10', 'Claritin 10 mg', 'Claritin', '12 comprimidos', NULL, 'Antialérgico que não dá sono (loratadina).', 29.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'CAIXA', '10 MG', 61
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'alergia'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'vick-vaporub', 'Vick VapoRub', 'Vick', 'pote 30 g', NULL, 'Pomada para aliviar a congestão nasal e a tosse do resfriado.', 24.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'POTE', 'VICK', 62
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'gripe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'resfenol-20', 'Resfenol', 'Resfenol', '20 cápsulas', NULL, 'Alívio dos sintomas de gripes e resfriados (paracetamol + clorfeniramina + fenilefrina).', 19.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'CAPSULA', NULL, 63
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'gripe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'maresis-spray', 'Maresis spray nasal', 'Maresis', '100 ml', NULL, 'Solução de água do mar para limpar e descongestionar o nariz.', 29.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'SPRAY', 'MARESIS', 64
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'gripe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'benalet-mel', 'Benalet mel e limão', 'Benalet', '12 pastilhas', NULL, 'Pastilhas para irritação da garganta e tosse.', 15.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BLISTER', 'MEL', 65
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'garganta'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'sinvastatina-20', 'Sinvastatina 20 mg', 'Genérico', '30 comprimidos', NULL, 'Controle do colesterol. Medicamento genérico.', 12.90, NULL, 'PRESCRICAO', FALSE, c.id, s.id, 'CAIXA', '20 MG', 66
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'receita'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'metformina-850', 'Cloridrato de Metformina 850 mg', 'Genérico', '30 comprimidos', NULL, 'Controle da glicose no diabetes tipo 2. Medicamento genérico.', 9.90, NULL, 'PRESCRICAO', FALSE, c.id, s.id, 'CAIXA', '850', 67
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'receita'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'sertralina-50', 'Sertralina 50 mg', 'Genérico', '30 comprimidos', NULL, 'Antidepressivo. Venda com retenção da receita.', 24.90, NULL, 'RETENCAO', FALSE, c.id, s.id, 'BLISTER', '50 MG', 68
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'medicamentos' AND s.slug = 'receita'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'centrum-homem', 'Centrum Homem', 'Centrum', '60 comprimidos', NULL, 'Multivitamínico com vitaminas e minerais para homens.', 89.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'A-Z', 69
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'multi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'supradyn-energia', 'Supradyn Energia', 'Supradyn', '30 comprimidos', '-14%', 'Polivitamínico com vitaminas do complexo B, ferro e magnésio.', 59.90, 69.90, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'ENERGIA', 70
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'multi'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'cenevit-1g', 'Cenevit 1 g', 'Cenevit', '10 comprimidos efervescentes', NULL, 'Vitamina C efervescente sabor laranja.', 22.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'C', 71
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'vitamina-c'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'vitamina-c-sundown', 'Vitamina C 1000 mg', 'Sundown', '100 tabletes', NULL, 'Suplemento de vitamina C em tabletes.', 69.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'C 1000', 72
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'vitamina-c'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'lavitan-d3', 'Vitamina D3 2.000 UI', 'Lavitan', '60 comprimidos', NULL, 'Suplemento de vitamina D3.', 29.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'D3', 73
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'vitamina-d'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'lavitan-omega3', 'Ômega 3 1.000 mg', 'Lavitan', '60 cápsulas', NULL, 'Óleo de peixe em cápsulas, fonte de EPA e DHA.', 49.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'Ω3', 74
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'vitaminas' AND s.slug = 'omega'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'sun-fresh-70', 'Sun Fresh FPS 70', 'Neutrogena', '120 ml', '-13%', 'Protetor solar corporal de textura leve, resistente à água.', 69.90, 79.90, 'LIVRE', TRUE, c.id, s.id, 'BISNAGA', 'FPS70', 75
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'protetor'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'nivea-sun-50', 'Nivea Sun Protect & Hidrata FPS 50', 'Nivea', '200 ml', NULL, 'Protetor solar com hidratação, resistente à água.', 64.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'FPS50', 76
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'protetor'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'sundown-praia-50', 'Sundown Praia e Piscina FPS 50', 'Sundown', '200 ml', NULL, 'Protetor solar para praia e piscina, resistente à água.', 54.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'FPS50', 77
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'protetor'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'nivea-creme-56', 'Nivea Creme', 'Nivea', 'lata 56 g', NULL, 'Creme hidratante para rosto, corpo e mãos.', 14.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'POTE', 'NIVEA', 78
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'hidratante'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'neutrogena-norwegian', 'Hidratante Norwegian Formula', 'Neutrogena', '400 ml', NULL, 'Hidratante corporal para pele extrasseca.', 49.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PUMP', 'NORW', 79
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'hidratante'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'cerave-espuma', 'CeraVe Gel de Limpeza Espumante', 'CeraVe', '473 ml', NULL, 'Limpa a pele normal a oleosa sem ressecar, com ceramidas.', 109.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PUMP', 'CERAVE', 80
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'rosto'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'nivea-micelar', 'Água Micelar 7 em 1', 'Nivea', '400 ml', NULL, 'Remove a maquiagem e limpa o rosto sem enxágue.', 39.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'MICELAR', 81
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'rosto'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'neutrogena-deep-clean', 'Sabonete facial Deep Clean', 'Neutrogena', '150 ml', NULL, 'Gel de limpeza facial para pele oleosa.', 34.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'DEEP', 82
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'rosto'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'carmed-labial', 'Hidratante labial Carmed', 'Carmed', '10 g', NULL, 'Hidratante labial com manteiga de karité.', 22.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'CARMED', 83
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'dermo' AND s.slug = 'labios'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'colgate-luminous', 'Colgate Luminous White', 'Colgate', '70 g', NULL, 'Creme dental clareador.', 14.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'WHITE', 84
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'bucal'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'sorriso-dentes-brancos', 'Sorriso Dentes Brancos', 'Sorriso', '90 g', NULL, 'Creme dental com flúor.', 4.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'SORRISO', 85
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'bucal'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'rexona-men-v8', 'Desodorante Rexona Men V8 aerosol', 'Rexona', '150 ml', NULL, 'Antitranspirante masculino, proteção 72h.', 17.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'SPRAY', 'V8', 86
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'desodorante'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'nivea-black-white', 'Desodorante Nivea Black & White roll-on', 'Nivea', '50 ml', NULL, 'Antitranspirante que não mancha roupas pretas nem brancas.', 16.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BASTAO', 'B&W', 87
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'desodorante'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'dove-sabonete', 'Sabonete Dove Original', 'Dove', 'barra 90 g', NULL, 'Sabonete em barra com 1/4 de creme hidratante.', 4.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'CAIXA', 'DOVE', 88
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'banho'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'head-shoulders', 'Shampoo Head & Shoulders anticaspa', 'Head & Shoulders', '200 ml', NULL, 'Shampoo anticaspa de uso diário.', 26.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', 'H&S', 89
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'banho'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'lucretin-intimo', 'Sabonete íntimo Lucretin', 'Lucretin', '200 ml', NULL, 'Sabonete líquido para a higiene íntima.', 24.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PUMP', 'LUCRET', 90
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'intimo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'intimus-gel', 'Absorvente Intimus Gel com abas', 'Intimus', '8 unidades', NULL, 'Absorvente com gel e abas, cobertura suave.', 7.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PACOTE', '8 UN', 91
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'higiene' AND s.slug = 'intimo'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'nebacetin-15', 'Nebacetin pomada', 'Nebacetin', '15 g', NULL, 'Pomada antibacteriana para pequenos ferimentos (neomicina + bacitracina).', 21.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'NEBA', 92
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'socorros' AND s.slug = 'antissepticos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'agua-oxigenada', 'Água oxigenada 10 volumes', 'Farmax', '100 ml', NULL, 'Para limpeza de ferimentos.', 4.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRASCO', '10 VOL', 93
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'socorros' AND s.slug = 'antissepticos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'micropore-3m', 'Fita Micropore', '3M', '25 mm x 10 m', NULL, 'Fita cirúrgica hipoalergênica para fixar curativos.', 12.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'CAIXA', '3M', 94
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'socorros' AND s.slug = 'curativos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'oximetro-gtech', 'Oxímetro de dedo', 'G-Tech', '1 unidade', '-23%', 'Mede a saturação de oxigênio e os batimentos.', 99.90, 129.90, 'LIVRE', FALSE, c.id, s.id, 'APARELHO', NULL, 95
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'socorros' AND s.slug = 'aparelhos'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'pampers-premium-p', 'Fralda Pampers Premium Care P', 'Pampers', '40 unidades', NULL, 'Fralda com camada extra macia e até 12h seca.', 89.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'FRALDA', 'P', 96
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'bebe' AND s.slug = 'fraldas'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'huggies-lencos', 'Lenços umedecidos Huggies Max Clean', 'Huggies', '48 unidades', NULL, 'Lenços umedecidos para a troca de fraldas.', 12.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PACOTE', '48 UN', 97
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'bebe' AND s.slug = 'pele-bebe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'desitin-57', 'Desitin creme preventivo de assaduras', 'Desitin', '57 g', NULL, 'Creme com óxido de zinco que protege contra assaduras.', 34.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'BISNAGA', 'DESITIN', 98
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'bebe' AND s.slug = 'pele-bebe'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO produto (slug, nome, marca, sub, selo, descricao, preco, preco_antigo, receita, destaque, categoria_id, subcategoria_id, forma, rotulo, ordem)
SELECT 'johnsons-cabeca-pes', 'Sabonete líquido Johnson''s Baby da cabeça aos pés', 'Johnson''s', '200 ml', NULL, 'Sabonete líquido suave para cabelo e corpo do bebê.', 21.90, NULL, 'LIVRE', FALSE, c.id, s.id, 'PUMP', 'BABY', 99
FROM categoria c JOIN subcategoria s ON s.categoria_id = c.id
WHERE c.slug = 'bebe' AND s.slug = 'banho-bebe'
ON CONFLICT (slug) DO NOTHING;
