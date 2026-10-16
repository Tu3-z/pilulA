/* ==========================================================================
   Catálogo (mock). Num projeto com back-end, isso viria de uma API.
   Preços e produtos são ilustrativos.
   receita: 'livre'    → medicamento isento de prescrição (MIP) ou não-medicamento
            'retencao' → tarja vermelha com retenção de receita (ex.: antibióticos)
   ========================================================================== */

export const CATEGORIAS = [
  { id: 'medicamentos', nome: 'Medicamentos', arquivo: 'remedios.flp', tom: 'blue' },
  { id: 'vitaminas', nome: 'Vitaminas', arquivo: 'vitamina.flp', tom: 'ink' },
  { id: 'dermo', nome: 'Dermocosméticos', rotulo: 'Dermo­cosméticos', arquivo: 'dermo.flp', tom: 'plastic' },
  { id: 'higiene', nome: 'Higiene', arquivo: 'higiene.flp', tom: 'blue' },
  { id: 'socorros', nome: 'Primeiros socorros', arquivo: 'socorro.flp', tom: 'ink' },
  { id: 'bebe', nome: 'Mamãe & bebê', arquivo: 'bebe.flp', tom: 'plastic' },
];

export const PRODUTOS = [
  // medicamentos
  { id: 'dipirona-500', nome: 'Dipirona 500 mg', sub: '10 comprimidos', categoria: 'medicamentos', preco: 8.9, receita: 'livre', destaque: true,
    arte: { forma: 'blister', rotulo: '500 MG' }, descricao: 'Analgésico e antitérmico. Genérico.' },
  { id: 'paracetamol-750', nome: 'Paracetamol 750 mg', sub: '20 comprimidos', categoria: 'medicamentos', preco: 12.9, receita: 'livre',
    arte: { forma: 'blister', rotulo: '750 MG' }, descricao: 'Analgésico e antitérmico. Genérico.' },
  { id: 'loratadina-10', nome: 'Loratadina 10 mg', sub: '12 comprimidos', categoria: 'medicamentos', preco: 16.9, receita: 'livre',
    arte: { forma: 'caixa', rotulo: '10 MG' }, descricao: 'Antialérgico. Genérico.' },
  { id: 'amoxicilina-500', nome: 'Amoxicilina 500 mg', sub: '21 cápsulas', categoria: 'medicamentos', preco: 32.9, receita: 'retencao', destaque: true,
    arte: { forma: 'capsula', rotulo: '' }, descricao: 'Antibiótico. Venda somente com receita médica, que fica retida na entrega.' },

  // vitaminas
  { id: 'vitamina-c', nome: 'Vitamina C 1 g', sub: 'efervescente · 10 comprimidos', categoria: 'vitaminas', preco: 24.9, receita: 'livre', destaque: true, selo: 'novo',
    arte: { forma: 'bisnaga', rotulo: 'C' }, descricao: 'Suplemento de vitamina C em comprimidos efervescentes.' },
  { id: 'omega-3', nome: 'Ômega 3 1000 mg', sub: '60 cápsulas', categoria: 'vitaminas', preco: 49.9, precoAntigo: 59.9, receita: 'livre',
    arte: { forma: 'frasco', rotulo: 'Ω3' }, descricao: 'Suplemento de óleo de peixe em cápsulas.' },
  { id: 'vitamina-d3', nome: 'Vitamina D3 2000 UI', sub: '30 cápsulas', categoria: 'vitaminas', preco: 32.9, receita: 'livre', destaque: true,
    arte: { forma: 'frasco', rotulo: 'D3' }, descricao: 'Suplemento de vitamina D em cápsulas.' },
  { id: 'multivitaminico', nome: 'Multivitamínico A–Z', sub: '60 comprimidos', categoria: 'vitaminas', preco: 44.9, receita: 'livre',
    arte: { forma: 'frasco', rotulo: 'A-Z' }, descricao: 'Suplemento com vitaminas e minerais.' },

  // dermo
  { id: 'protetor-fps50', nome: 'Protetor solar FPS 50', sub: 'toque seco · 200 ml', categoria: 'dermo', preco: 59.9, precoAntigo: 69.9, receita: 'livre', destaque: true, selo: '-15%',
    arte: { forma: 'frasco', rotulo: 'FPS50' }, descricao: 'Proteção UVA/UVB com acabamento seco.' },
  { id: 'hidratante-corporal', nome: 'Hidratante corporal', sub: 'pele seca · 400 ml', categoria: 'dermo', preco: 34.9, receita: 'livre',
    arte: { forma: 'pump', rotulo: 'H2O' }, descricao: 'Loção hidratante para o corpo.' },
  { id: 'protetor-labial', nome: 'Protetor labial FPS 15', sub: 'manteiga de karité · 4 g', categoria: 'dermo', preco: 12.9, receita: 'livre',
    arte: { forma: 'bastao', rotulo: 'FPS' }, descricao: 'Hidrata e protege os lábios.' },
  { id: 'sabonete-facial', nome: 'Sabonete facial', sub: 'pele oleosa · 150 ml', categoria: 'dermo', preco: 29.9, receita: 'livre',
    arte: { forma: 'bisnaga', rotulo: 'GEL' }, descricao: 'Gel de limpeza facial.' },

  // higiene
  { id: 'escova-macia', nome: 'Escova dental macia', sub: 'cerdas extra macias', categoria: 'higiene', preco: 9.9, receita: 'livre', destaque: true,
    arte: { forma: 'escova', rotulo: '' }, descricao: 'Escova com cerdas extra macias.' },
  { id: 'creme-dental', nome: 'Creme dental', sub: 'flúor · 90 g', categoria: 'higiene', preco: 7.9, receita: 'livre',
    arte: { forma: 'bisnaga', rotulo: 'F' }, descricao: 'Creme dental com flúor.' },
  { id: 'fio-dental', nome: 'Fio dental', sub: '50 m', categoria: 'higiene', preco: 11.9, receita: 'livre',
    arte: { forma: 'caixa', rotulo: '50 M' }, descricao: 'Fio dental encerado.' },
  { id: 'enxaguante', nome: 'Enxaguante bucal', sub: 'sem álcool · 500 ml', categoria: 'higiene', preco: 19.9, receita: 'livre',
    arte: { forma: 'frasco', rotulo: 'MINT' }, descricao: 'Enxaguante bucal sem álcool.' },

  // primeiros socorros
  { id: 'kit-socorros', nome: 'Kit primeiros socorros', sub: '12 itens essenciais', categoria: 'socorros', preco: 39.9, receita: 'livre', destaque: true, selo: 'essencial',
    arte: { forma: 'kit', rotulo: '' }, descricao: 'Curativos, gaze, esparadrapo, tesoura e mais.' },
  { id: 'termometro', nome: 'Termômetro digital', sub: 'leitura em 10 s', categoria: 'socorros', preco: 29.9, receita: 'livre',
    arte: { forma: 'termometro', rotulo: '' }, descricao: 'Termômetro clínico digital.' },
  { id: 'curativos', nome: 'Curativos', sub: '40 unidades', categoria: 'socorros', preco: 14.9, receita: 'livre',
    arte: { forma: 'caixa', rotulo: '40 UN' }, descricao: 'Curativos adesivos em tamanhos variados.' },
  { id: 'alcool-gel', nome: 'Álcool em gel 70%', sub: '500 ml', categoria: 'socorros', preco: 12.9, receita: 'livre',
    arte: { forma: 'pump', rotulo: '70%' }, descricao: 'Antisséptico para as mãos.' },

  // bebê
  { id: 'pomada-assaduras', nome: 'Pomada para assaduras', sub: '45 g', categoria: 'bebe', preco: 22.9, receita: 'livre',
    arte: { forma: 'bisnaga', rotulo: 'BB' }, descricao: 'Pomada protetora para a pele do bebê.' },
  { id: 'lenco-umedecido', nome: 'Lenço umedecido', sub: '50 unidades', categoria: 'bebe', preco: 9.9, receita: 'livre', destaque: true,
    arte: { forma: 'pacote', rotulo: '50 UN' }, descricao: 'Lenços umedecidos sem perfume.' },
  { id: 'shampoo-infantil', nome: 'Shampoo infantil', sub: '200 ml', categoria: 'bebe', preco: 18.9, receita: 'livre',
    arte: { forma: 'frasco', rotulo: 'BABY' }, descricao: 'Shampoo suave para bebês.' },
];

export const RECEITA = {
  livre: { rotulo: 'Sem receita', aviso: 'Se persistirem os sintomas, o médico deverá ser consultado.' },
  retencao: { rotulo: 'Tarja vermelha · receita retida', aviso: 'Venda sob prescrição médica. A receita original é retida na entrega.' },
};

const porId = new Map(PRODUTOS.map((p) => [p.id, p]));

export const getProduto = (id) => porId.get(id) || null;
export const getCategoria = (id) => CATEGORIAS.find((c) => c.id === id) || null;
export const contarPorCategoria = (id) => PRODUTOS.filter((p) => p.categoria === id).length;

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (n) => brl.format(n);
