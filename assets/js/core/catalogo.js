import { semAcento } from './texto.js';

/**
 * Catálogo de produtos.
 * Hoje vem de um JSON estático. Quando o back-end (Spring Boot) tiver o endpoint,
 * é só trocar a URL abaixo, ex.: 'http://localhost:8080/api/catalogo'
 * (o back-end precisa liberar CORS para http://localhost:5500).
 */
export const URL_CATALOGO = 'assets/dados/catalogo.json';

export const RECEITA = {
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

let categorias = [];
let produtos = [];
let porId = new Map();
let carregando = null;

/** Carrega o catálogo uma vez só (as outras chamadas reaproveitam a mesma promessa). */
export function carregarCatalogo() {
  carregando ??= fetch(URL_CATALOGO)
    .then((r) => {
      if (!r.ok) throw new Error(`Catálogo: HTTP ${r.status}`);
      return r.json();
    })
    .then((dados) => {
      categorias = dados.categorias;
      produtos = dados.produtos;
      porId = new Map(produtos.map((p) => [p.id, p]));
    });
  return carregando;
}

export const todasCategorias = () => categorias;
export const todosProdutos = () => produtos;
export const produto = (id) => (id && porId.get(id)) || null;
export const categoria = (id) => categorias.find((c) => c.id === id) ?? null;
export const sub = (catId, subId) => categoria(catId)?.subs.find((s) => s.id === subId) ?? null;
export const destaques = () => produtos.filter((p) => p.destaque).slice(0, 8);
export const marcas = () =>
  [...new Set(produtos.map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

export const contar = (catId, subId) =>
  produtos.filter((p) => p.categoria === catId && (!subId || p.subcategoria === subId)).length;

/**
 * Busca por início de palavra: "dor" acha Dorflex e "dor de cabeça",
 * mas não "desodorante". Todas as palavras digitadas precisam aparecer.
 */
export function buscar(termo, lista = produtos) {
  const partes = semAcento(termo)
    .split(/[^a-z0-9%]+/)
    .filter(Boolean);
  if (!partes.length) return lista;
  return lista.filter((p) => {
    const texto = `${p.nome} ${p.marca} ${p.sub} ${p.descricao} ${categoria(p.categoria)?.nome} ${sub(p.categoria, p.subcategoria)?.nome}`;
    const palavras = semAcento(texto).split(/[^a-z0-9%]+/);
    return partes.every((t) => palavras.some((w) => w.startsWith(t)));
  });
}
