-- =============================================================================
-- V14: fotos reais de 16 produtos, vindas do Open Beauty Facts
-- =============================================================================
-- O Open Beauty Facts (https://world.openbeautyfacts.org) e uma base colaborativa
-- e aberta de produtos de higiene, beleza e dermocosmeticos, irma do Open Food
-- Facts. Cada produto e identificado pelo codigo de barras (EAN) e as fotos sao
-- enviadas por voluntarios.
--
-- Licenca: a base esta sob Open Database License (ODbL) e as fotos sob Creative
-- Commons Atribuicao-CompartilhaIgual (CC BY-SA). Ou seja: da para usar, inclusive
-- num projeto comercial, desde que a fonte seja creditada. O credito ao Open
-- Beauty Facts deve aparecer no rodape do site (ainda nao esta la).
--
-- Por que so 16 produtos: o Open Beauty Facts cataloga cosmeticos, nao
-- medicamentos nem suplementos. Entao nenhum item das categorias "medicamentos"
-- e "vitaminas" tem foto por aqui, e varias marcas brasileiras do catalogo
-- (Bepantol, Hipoglos, Desitin, Sundown, Carmed, Episol, Intimus, Always,
-- Protex, Merthiolate, Asseptgel) ainda nao existem na base. Os produtos sem
-- foto continuam mostrando a caixinha 3D em SVG, como antes.
--
-- A coluna "foto" ja ia direto para o src de uma <img> (ver utils/arte.js), e o
-- layout.js troca pela ilustracao se a imagem nao carregar. Entao uma URL
-- absoluta funciona igual a um caminho local, e uma URL que saia do ar degrada
-- sozinha para a caixinha 3D.
--
-- Atencao: a URL da imagem tem o numero da revisao da foto no meio
-- (.../front_pt.4.400.jpg). Se um voluntario subir uma foto nova la, a revisao
-- muda e esta URL para de responder (e o site cai na ilustracao). Se isso
-- incomodar, o caminho e baixar as imagens e servir do proprio front-end.
--
-- O UPDATE so mexe em quem ainda nao tem foto: assim a migration nao apaga uma
-- foto que alguem tenha cadastrado pelo painel do vendedor, e rodar de novo num
-- banco ja atualizado nao faz nada. Slug que nao existir e simplesmente ignorado.
-- SQL padrao: roda no PostgreSQL (Supabase) e no H2 dos testes.
-- =============================================================================

-- dermo ----------------------------------------------------------------------

-- Neutrogena Hydro Boost Water Gel 50 g (EAN 7891010882983) - foto brasileira
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/789/101/088/2983/front_es.11.400.jpg'
WHERE slug = 'hydro-boost' AND (foto IS NULL OR foto = '');

-- Neutrogena Deep Clean 150 ml (EAN 3574661214771)
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/357/466/121/4771/front_fr.5.400.jpg'
WHERE slug = 'neutrogena-deep-clean' AND (foto IS NULL OR foto = '');

-- CeraVe Locao Hidratante (EAN 7899706159258) - foto brasileira, embalagem de 200 ml
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/789/970/615/9258/front_pt.4.400.jpg'
WHERE slug = 'cerave-locao' AND (foto IS NULL OR foto = '');

-- CeraVe Foaming Facial Cleanser (EAN 3606000537194) = o "Gel de Limpeza Espumante"
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/360/600/053/7194/front_en.4.400.jpg'
WHERE slug = 'cerave-espuma' AND (foto IS NULL OR foto = '');

-- Cetaphil Moisturising Lotion 473 ml (EAN 3499320004558) - mesmo tamanho do catalogo
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/349/932/000/4558/front_en.4.400.jpg'
WHERE slug = 'cetaphil-locao' AND (foto IS NULL OR foto = '');

-- La Roche-Posay Effaclar gel purifiant (EAN 3337875708289) = o "Gel Concentrado"
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/333/787/570/8289/front_fr.5.400.jpg'
WHERE slug = 'effaclar-gel' AND (foto IS NULL OR foto = '');

-- Nivea Sun Protect & Moisture (EAN 4005808430208) = o "Protect & Hidrata"
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/400/580/843/0208/front_en.14.400.jpg'
WHERE slug = 'nivea-sun-50' AND (foto IS NULL OR foto = '');

-- Nivea Creme, a latinha azul (EAN 4005808801053) - foto da lata de 250 ml
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/400/580/880/1053/front_en.27.400.jpg'
WHERE slug = 'nivea-creme-56' AND (foto IS NULL OR foto = '');

-- higiene --------------------------------------------------------------------

-- Nivea Black & White Invisible roll-on 50 ml (EAN 42397304)
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/000/004/239/7304/front_pt.3.400.jpg'
WHERE slug = 'nivea-black-white' AND (foto IS NULL OR foto = '');

-- Colgate Total Clean Mint (EAN 0099176480310) - tubo de 75 ml
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/009/917/648/0310/front_en.6.400.jpg'
WHERE slug = 'colgate-total' AND (foto IS NULL OR foto = '');

-- Colgate Luminous White (EAN 7509546054650)
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/750/954/605/4650/front_es.10.400.jpg'
WHERE slug = 'colgate-luminous' AND (foto IS NULL OR foto = '');

-- Dove Original antitranspirante aerosol 150 ml (EAN 8717163965030)
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/871/716/396/5030/front_en.3.400.jpg'
WHERE slug = 'dove-aerosol' AND (foto IS NULL OR foto = '');

-- Dove Beauty Cream Bar 90 g (EAN 8720182264664) = o sabonete Original em barra
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/872/018/226/4664/front_en.32.400.jpg'
WHERE slug = 'dove-sabonete' AND (foto IS NULL OR foto = '');

-- Head & Shoulders anticaspa 200 ml (EAN 7500435242615) - foto brasileira
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/750/043/524/2615/front_pt.3.400.jpg'
WHERE slug = 'head-shoulders' AND (foto IS NULL OR foto = '');

-- bebe -----------------------------------------------------------------------

-- Johnson's Baby Shampoo 200 ml (EAN 0720212570626)
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/072/021/257/0626/front_es.8.400.jpg'
WHERE slug = 'shampoo-johnsons' AND (foto IS NULL OR foto = '');

-- Johnson's Head-to-Toe Wash & Shampoo (EAN 0381371196654) = "da cabeca aos pes"
UPDATE produto SET foto = 'https://images.openbeautyfacts.org/images/products/038/137/119/6654/front_en.9.400.jpg'
WHERE slug = 'johnsons-cabeca-pes' AND (foto IS NULL OR foto = '');
