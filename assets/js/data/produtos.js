/* ==========================================================================
   Catálogo mock com produtos reais do varejo farmacêutico brasileiro.
   Serve para testes do front-end; num projeto com back-end viria de uma API.

   ⚠ Preços aproximados de mercado e ilustrativos. Marcas pertencem aos seus
     respectivos donos e aparecem aqui só como dado de teste.

   receita:
     'livre'      → isento de prescrição (MIP) ou não-medicamento
     'prescricao' → tarja vermelha: exige receita (apresentada, não retida)
     'retencao'   → tarja vermelha com retenção de receita (ex.: antibióticos)
   ========================================================================== */

export const CATEGORIAS = [
  {
    id: 'medicamentos', nome: 'Medicamentos', arquivo: 'remedios.flp', tom: 'blue',
    subs: [
      { id: 'dor-febre', nome: 'Dor e febre' },
      { id: 'gripe', nome: 'Gripe e resfriado' },
      { id: 'estomago', nome: 'Estômago e intestino' },
      { id: 'alergia', nome: 'Alergia' },
      { id: 'garganta', nome: 'Garganta' },
      { id: 'receita', nome: 'Com receita' },
    ],
  },
  {
    id: 'vitaminas', nome: 'Vitaminas', arquivo: 'vitamina.flp', tom: 'ink',
    subs: [
      { id: 'multi', nome: 'Multivitamínicos' },
      { id: 'vitamina-c', nome: 'Vitamina C' },
      { id: 'vitamina-d', nome: 'Vitamina D' },
      { id: 'omega', nome: 'Ômega 3' },
    ],
  },
  {
    id: 'dermo', nome: 'Dermocosméticos', rotulo: 'Dermo­cosméticos', arquivo: 'dermo.flp', tom: 'plastic',
    subs: [
      { id: 'protetor', nome: 'Protetor solar' },
      { id: 'hidratante', nome: 'Hidratantes' },
      { id: 'rosto', nome: 'Rosto' },
      { id: 'labios', nome: 'Lábios' },
    ],
  },
  {
    id: 'higiene', nome: 'Higiene', arquivo: 'higiene.flp', tom: 'blue',
    subs: [
      { id: 'bucal', nome: 'Saúde bucal' },
      { id: 'desodorante', nome: 'Desodorantes' },
      { id: 'banho', nome: 'Banho' },
      { id: 'intimo', nome: 'Higiene íntima' },
    ],
  },
  {
    id: 'socorros', nome: 'Primeiros socorros', arquivo: 'socorro.flp', tom: 'ink',
    subs: [
      { id: 'curativos', nome: 'Curativos' },
      { id: 'antissepticos', nome: 'Antissépticos' },
      { id: 'aparelhos', nome: 'Aparelhos' },
    ],
  },
  {
    id: 'bebe', nome: 'Mamãe & bebê', arquivo: 'bebe.flp', tom: 'plastic',
    subs: [
      { id: 'fraldas', nome: 'Fraldas' },
      { id: 'pele-bebe', nome: 'Pele do bebê' },
      { id: 'banho-bebe', nome: 'Banho' },
    ],
  },
];

/* helper para deixar a lista legível: p(id, categoria/sub, nome, marca, apresentação, preço, receita, arte, extras) */
const p = (id, cs, nome, marca, apresentacao, preco, receita, [forma, rotulo = ''], extra = {}) => {
  const [categoria, subcategoria] = cs.split('/');
  return { id, categoria, subcategoria, nome, marca, sub: apresentacao, preco, receita, arte: { forma, rotulo }, descricao: '', ...extra };
};

export const PRODUTOS = [
  // ---------------- medicamentos ----------------
  p('dorflex-36', 'medicamentos/dor-febre', 'Dorflex', 'Dorflex', '36 comprimidos', 22.9, 'livre', ['blister', 'DORFLEX'],
    { destaque: true, descricao: 'Analgésico e relaxante muscular (dipirona + citrato de orfenadrina + cafeína).' }),
  p('neosaldina-30', 'medicamentos/dor-febre', 'Neosaldina', 'Neosaldina', '30 drágeas', 31.9, 'livre', ['caixa', 'NEOSALD'],
    { descricao: 'Analgésico indicado para dor de cabeça (dipirona + isometepteno + cafeína).' }),
  p('novalgina-1g', 'medicamentos/dor-febre', 'Novalgina 1 g', 'Novalgina', '10 comprimidos', 21.9, 'livre', ['blister', '1 G'],
    { descricao: 'Analgésico e antitérmico (dipirona monoidratada).' }),
  p('tylenol-750', 'medicamentos/dor-febre', 'Tylenol 750 mg', 'Tylenol', '20 comprimidos', 26.9, 'livre', ['caixa', '750'],
    { descricao: 'Analgésico e antitérmico (paracetamol).' }),
  p('dipirona-500-generico', 'medicamentos/dor-febre', 'Dipirona 500 mg', 'Genérico', '10 comprimidos', 6.9, 'livre', ['blister', '500 MG'],
    { descricao: 'Analgésico e antitérmico. Medicamento genérico.' }),
  p('benegrip-12', 'medicamentos/gripe', 'Benegrip', 'Benegrip', '12 comprimidos', 18.9, 'livre', ['blister', 'GRIPE'],
    { descricao: 'Antigripal: alivia sintomas de gripes e resfriados.' }),
  p('cimegripe-20', 'medicamentos/gripe', 'Cimegripe', 'Cimegripe', '20 cápsulas', 17.9, 'livre', ['capsula'],
    { descricao: 'Antigripal: alivia sintomas de gripes e resfriados.' }),
  p('luftal-gotas', 'medicamentos/estomago', 'Luftal gotas 75 mg/ml', 'Luftal', 'frasco 15 ml', 24.9, 'livre', ['gotas', 'LUFTAL'],
    { descricao: 'Antiflatulento (simeticona) para alívio de gases.' }),
  p('eno-100g', 'medicamentos/estomago', 'Sal de Frutas Eno', 'Eno', 'pote 100 g', 29.9, 'livre', ['pote', 'ENO'],
    { descricao: 'Antiácido efervescente para azia e má digestão.' }),
  p('dramin-b6', 'medicamentos/estomago', 'Dramin B6', 'Dramin', '10 comprimidos', 16.9, 'livre', ['blister', 'B6'],
    { descricao: 'Para náuseas, vômitos e enjoo de movimento.' }),
  p('loratadina-generico', 'medicamentos/alergia', 'Loratadina 10 mg', 'Genérico', '12 comprimidos', 12.9, 'livre', ['caixa', '10 MG'],
    { descricao: 'Antialérgico. Medicamento genérico.' }),
  p('strepsils-mel', 'medicamentos/garganta', 'Strepsils mel e limão', 'Strepsils', '8 pastilhas', 19.9, 'livre', ['blister', 'MEL'],
    { descricao: 'Pastilhas para alívio da dor de garganta.' }),
  p('amoxicilina-500', 'medicamentos/receita', 'Amoxicilina 500 mg', 'Genérico', '21 cápsulas', 32.9, 'retencao', ['capsula'],
    { destaque: true, descricao: 'Antibiótico. Venda somente com receita médica, que fica retida na entrega.' }),
  p('azitromicina-500', 'medicamentos/receita', 'Azitromicina 500 mg', 'Genérico', '3 comprimidos', 24.9, 'retencao', ['blister', '500 MG'],
    { descricao: 'Antibiótico. Venda somente com receita médica, que fica retida na entrega.' }),
  p('losartana-50', 'medicamentos/receita', 'Losartana potássica 50 mg', 'Genérico', '30 comprimidos', 14.9, 'prescricao', ['caixa', '50 MG'],
    { descricao: 'Anti-hipertensivo. Venda sob prescrição médica.' }),

  // ---------------- vitaminas ----------------
  p('centrum-mulher', 'vitaminas/multi', 'Centrum Mulher', 'Centrum', '60 comprimidos', 89.9, 'livre', ['frasco', 'A-Z'],
    { precoAntigo: 104.9, selo: '-14%', destaque: true, descricao: 'Multivitamínico e multimineral de A a Z.' }),
  p('lavitan-mulher', 'vitaminas/multi', 'Lavitan Mulher', 'Lavitan', '60 comprimidos', 39.9, 'livre', ['frasco', 'MULHER'],
    { descricao: 'Suplemento vitamínico-mineral.' }),
  p('redoxon-1g', 'vitaminas/vitamina-c', 'Redoxon 1 g laranja', 'Redoxon', '10 comprimidos efervescentes', 29.9, 'livre', ['bisnaga', 'C'],
    { selo: 'novo', destaque: true, descricao: 'Vitamina C em comprimidos efervescentes sabor laranja.' }),
  p('cewin-500', 'vitaminas/vitamina-c', 'Cewin 500 mg', 'Cewin', '30 comprimidos', 22.9, 'livre', ['frasco', 'C 500'],
    { descricao: 'Vitamina C (ácido ascórbico).' }),
  p('addera-d3', 'vitaminas/vitamina-d', 'Addera D3 1.000 UI', 'Addera', '30 comprimidos', 49.9, 'livre', ['caixa', 'D3'],
    { descricao: 'Suplemento de vitamina D3 (colecalciferol).' }),
  p('depura-gotas', 'vitaminas/vitamina-d', 'Depura 2.000 UI gotas', 'Depura', 'frasco 20 ml', 59.9, 'livre', ['gotas', 'D3'],
    { descricao: 'Vitamina D3 em gotas.' }),
  p('omega3-catarinense', 'vitaminas/omega', 'Ômega 3 1.000 mg', 'Catarinense', '120 cápsulas', 59.9, 'livre', ['frasco', 'Ω3'],
    { precoAntigo: 69.9, descricao: 'Óleo de peixe em cápsulas.' }),

  // ---------------- dermo ----------------
  p('anthelios-airlicium-70', 'dermo/protetor', 'Anthelios Airlicium FPS 70', 'La Roche-Posay', '50 g · toque seco', 99.9, 'livre', ['bisnaga', 'FPS70'],
    { precoAntigo: 119.9, selo: '-17%', destaque: true, descricao: 'Protetor solar facial com toque seco e efeito antibrilho.' }),
  p('isdin-fusion-water', 'dermo/protetor', 'Fusion Water Magic FPS 50', 'ISDIN', '50 ml', 129.9, 'livre', ['bisnaga', 'FPS50'],
    { descricao: 'Protetor solar facial de textura ultraleve.' }),
  p('episol-color-70', 'dermo/protetor', 'Episol Color FPS 70 pele clara', 'Episol', '40 g', 79.9, 'livre', ['bisnaga', 'COLOR'],
    { descricao: 'Protetor solar facial com cor.' }),
  p('cetaphil-locao', 'dermo/hidratante', 'Cetaphil Loção Hidratante', 'Cetaphil', '473 ml', 109.9, 'livre', ['pump', 'CETAPH'],
    { descricao: 'Loção hidratante para pele seca e sensível.' }),
  p('cerave-locao', 'dermo/hidratante', 'CeraVe Loção Hidratante', 'CeraVe', '473 ml', 99.9, 'livre', ['pump', 'CERAVE'],
    { destaque: true, descricao: 'Hidratante corporal com ceramidas e ácido hialurônico.' }),
  p('hydro-boost', 'dermo/rosto', 'Hydro Boost Water Gel', 'Neutrogena', '50 g', 79.9, 'livre', ['pote', 'HYDRO'],
    { descricao: 'Hidratante facial em gel com ácido hialurônico.' }),
  p('effaclar-gel', 'dermo/rosto', 'Effaclar Gel Concentrado', 'La Roche-Posay', '60 g', 59.9, 'livre', ['bisnaga', 'EFFAC'],
    { descricao: 'Gel de limpeza facial para pele oleosa.' }),
  p('bepantol-derma', 'dermo/hidratante', 'Bepantol Derma creme', 'Bepantol', '20 g', 39.9, 'livre', ['bisnaga', 'BEPAN'],
    { descricao: 'Creme hidratante com dexpantenol.' }),
  p('nivea-lip', 'dermo/labios', 'Nivea Lip Care Original', 'Nivea', '4,8 g', 16.9, 'livre', ['bastao', 'LIP'],
    { descricao: 'Hidratante labial.' }),
  p('bepantol-labial', 'dermo/labios', 'Bepantol Derma Lábios FPS 30', 'Bepantol', '7,5 ml', 34.9, 'livre', ['bastao', 'FPS30'],
    { descricao: 'Hidratante labial com proteção solar.' }),

  // ---------------- higiene ----------------
  p('colgate-total', 'higiene/bucal', 'Colgate Total 12 Clean Mint', 'Colgate', '90 g', 12.9, 'livre', ['bisnaga', 'TOTAL'],
    { descricao: 'Creme dental com flúor.' }),
  p('sensodyne-repara', 'higiene/bucal', 'Sensodyne Repara & Protege', 'Sensodyne', '100 g', 29.9, 'livre', ['bisnaga', 'SENSO'],
    { destaque: true, descricao: 'Creme dental para dentes sensíveis.' }),
  p('oralb-indicator', 'higiene/bucal', 'Escova Oral-B Indicator Plus', 'Oral-B', '2 unidades · macia', 19.9, 'livre', ['escova'],
    { descricao: 'Escova dental com cerdas macias.' }),
  p('listerine-zero', 'higiene/bucal', 'Listerine Cool Mint Zero Álcool', 'Listerine', '500 ml', 26.9, 'livre', ['frasco', 'ZERO'],
    { descricao: 'Enxaguante bucal sem álcool.' }),
  p('oralb-fio', 'higiene/bucal', 'Fio dental Oral-B Essential Floss', 'Oral-B', '50 m', 14.9, 'livre', ['caixa', '50 M'],
    { descricao: 'Fio dental encerado.' }),
  p('dove-aerosol', 'higiene/desodorante', 'Desodorante Dove Original aerosol', 'Dove', '150 ml', 19.9, 'livre', ['spray', 'DOVE'],
    { descricao: 'Antitranspirante aerosol 48h.' }),
  p('rexona-clinical', 'higiene/desodorante', 'Rexona Clinical Classic', 'Rexona', '48 g', 32.9, 'livre', ['bastao', 'CLINIC'],
    { descricao: 'Antitranspirante em creme.' }),
  p('protex-liquido', 'higiene/banho', 'Sabonete líquido Protex Erva-Doce', 'Protex', '250 ml', 17.9, 'livre', ['pump', 'PROTEX'],
    { descricao: 'Sabonete líquido antibacteriano.' }),
  p('always-noturno', 'higiene/intimo', 'Absorvente Always Noturno', 'Always', '8 unidades', 12.9, 'livre', ['pacote', '8 UN'],
    { descricao: 'Absorvente com abas para a noite.' }),

  // ---------------- primeiros socorros ----------------
  p('band-aid-40', 'socorros/curativos', 'Curativos Band-Aid', 'Band-Aid', '40 unidades', 16.9, 'livre', ['caixa', '40 UN'],
    { descricao: 'Curativos adesivos transparentes.' }),
  p('gaze-cremer', 'socorros/curativos', 'Gaze estéril', 'Cremer', '10 unidades', 8.9, 'livre', ['pacote', 'GAZE'],
    { descricao: 'Compressa de gaze estéril 7,5 × 7,5 cm.' }),
  p('kit-socorros', 'socorros/curativos', 'Kit primeiros socorros', 'pílula*', '12 itens', 39.9, 'livre', ['kit'],
    { selo: 'essencial', destaque: true, descricao: 'Curativos, gaze, esparadrapo, tesoura, luvas e mais. Marca própria.' }),
  p('merthiolate-spray', 'socorros/antissepticos', 'Merthiolate spray', 'Merthiolate', '45 ml', 24.9, 'livre', ['spray', 'MERTH'],
    { descricao: 'Antisséptico para pequenos ferimentos.' }),
  p('asseptgel-500', 'socorros/antissepticos', 'Álcool em gel 70% Asseptgel', 'Asseptgel', '500 ml', 14.9, 'livre', ['pump', '70%'],
    { descricao: 'Antisséptico para as mãos.' }),
  p('soro-fisiologico', 'socorros/antissepticos', 'Soro fisiológico 0,9%', 'Genérico', '500 ml', 9.9, 'livre', ['frasco', '0,9%'],
    { descricao: 'Solução de cloreto de sódio para limpeza.' }),
  p('termometro-gtech', 'socorros/aparelhos', 'Termômetro digital', 'G-Tech', 'ponta rígida', 29.9, 'livre', ['termometro'],
    { descricao: 'Termômetro clínico digital com bipe.' }),
  p('medidor-pressao', 'socorros/aparelhos', 'Medidor de pressão de pulso', 'G-Tech', 'automático', 149.9, 'livre', ['aparelho'],
    { precoAntigo: 179.9, descricao: 'Monitor de pressão arterial automático de pulso.' }),

  // ---------------- bebê ----------------
  p('pampers-confort-g', 'bebe/fraldas', 'Fralda Pampers Confort Sec G', 'Pampers', '34 unidades', 69.9, 'livre', ['fralda', 'G'],
    { destaque: true, descricao: 'Fralda descartável tamanho G.' }),
  p('huggies-supreme-m', 'bebe/fraldas', 'Fralda Huggies Supreme Care M', 'Huggies', '42 unidades', 79.9, 'livre', ['fralda', 'M'],
    { descricao: 'Fralda descartável tamanho M.' }),
  p('bepantol-baby', 'bebe/pele-bebe', 'Bepantol Baby', 'Bepantol', '60 g', 39.9, 'livre', ['bisnaga', 'BABY'],
    { descricao: 'Pomada para prevenir assaduras.' }),
  p('hipoglos-40', 'bebe/pele-bebe', 'Hipoglós pomada', 'Hipoglós', '40 g', 29.9, 'livre', ['bisnaga', 'HIPO'],
    { descricao: 'Pomada protetora contra assaduras.' }),
  p('lencos-pampers', 'bebe/pele-bebe', 'Lenços umedecidos Pampers Aloe Vera', 'Pampers', '48 unidades', 14.9, 'livre', ['pacote', '48 UN'],
    { descricao: 'Lenços umedecidos com aloe vera.' }),
  p('shampoo-johnsons', 'bebe/banho-bebe', "Shampoo Johnson's Baby", "Johnson's", '200 ml', 17.9, 'livre', ['frasco', 'BABY'],
    { descricao: 'Shampoo suave, fórmula sem lágrimas.' }),
];

export const RECEITA = {
  livre: { rotulo: 'Sem receita', aviso: 'Se persistirem os sintomas, o médico deverá ser consultado.' },
  prescricao: { rotulo: 'Tarja vermelha · exige receita', aviso: 'Venda sob prescrição médica. Apresente a receita na compra.' },
  retencao: { rotulo: 'Tarja vermelha · receita retida', aviso: 'Venda sob prescrição médica. A receita original é retida na entrega.' },
};

const porId = new Map(PRODUTOS.map((x) => [x.id, x]));

export const getProduto = (id) => porId.get(id) || null;
export const getCategoria = (id) => CATEGORIAS.find((c) => c.id === id) || null;
export const getSub = (catId, subId) => getCategoria(catId)?.subs.find((s) => s.id === subId) || null;
export const contarPorCategoria = (id) => PRODUTOS.filter((x) => x.categoria === id).length;
export const contarPorSub = (cat, sub) => PRODUTOS.filter((x) => x.categoria === cat && x.subcategoria === sub).length;
export const MARCAS = [...new Set(PRODUTOS.map((x) => x.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
export const precisaReceita = (prod) => prod.receita !== 'livre';

const semAcento = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Busca por início de palavra ("dor" acha Dorflex e "dor de cabeça", mas não "desodorante").
 * Todas as palavras digitadas precisam aparecer.
 */
export function buscarProdutos(termo, lista = PRODUTOS) {
  const partes = semAcento(termo).split(/[^a-z0-9%]+/).filter(Boolean);
  if (!partes.length) return lista;
  return lista.filter((x) => {
    const cat = getCategoria(x.categoria);
    const sub = getSub(x.categoria, x.subcategoria);
    const palavras = semAcento(`${x.nome} ${x.marca} ${x.sub} ${x.descricao} ${cat?.nome} ${sub?.nome}`).split(/[^a-z0-9%]+/);
    return partes.every((t) => palavras.some((w) => w.startsWith(t)));
  });
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (n) => brl.format(n);
