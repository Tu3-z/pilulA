/** Tipos do catálogo. Os dados vêm de public/dados/catalogo.json (no futuro, de uma API). */

export type TipoReceita = 'livre' | 'prescricao' | 'retencao';

export type FormaArte =
  | 'frasco'
  | 'pump'
  | 'bisnaga'
  | 'capsula'
  | 'blister'
  | 'caixa'
  | 'kit'
  | 'escova'
  | 'termometro'
  | 'bastao'
  | 'pacote'
  | 'gotas'
  | 'spray'
  | 'pote'
  | 'aparelho'
  | 'fralda';

export interface Subcategoria {
  id: string;
  nome: string;
}

export interface Categoria {
  id: string;
  nome: string;
  /** nome com hífen opcional (&shy;) para quebrar bonito nos disquetes */
  rotulo?: string;
  /** "arquivo" do disquete, ex.: vitamina.flp */
  arquivo: string;
  tom: 'blue' | 'ink' | 'plastic';
  subs: Subcategoria[];
}

export interface Produto {
  id: string;
  categoria: string;
  subcategoria: string;
  nome: string;
  marca: string;
  /** apresentação: "36 comprimidos", "200 ml"… */
  sub: string;
  preco: number;
  precoAntigo?: number;
  receita: TipoReceita;
  destaque?: boolean;
  selo?: string;
  descricao: string;
  /** ilustração usada quando não há foto */
  arte: { forma: FormaArte; rotulo: string };
  /** foto real, relativa a public/ (ex.: "img/produtos/codein-30.webp"). Opcional. */
  foto?: string;
}

export interface Catalogo {
  categorias: Categoria[];
  produtos: Produto[];
}

export const RECEITA: Record<TipoReceita, { rotulo: string; aviso: string }> = {
  livre: {
    rotulo: 'Sem receita',
    aviso: 'Se persistirem os sintomas, o médico deverá ser consultado.',
  },
  prescricao: {
    rotulo: 'Tarja vermelha · exige receita',
    aviso: 'Venda sob prescrição médica. Apresente a receita na compra.',
  },
  retencao: {
    rotulo: 'Tarja vermelha · receita retida',
    aviso: 'Venda sob prescrição médica. A receita original é retida na entrega.',
  },
};
