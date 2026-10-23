import { semAcento } from '../utils/texto.js';

/**
 * Catálogo de produtos. De onde vem:
 *  1. da API do back-end (Spring Boot + banco no Supabase), se ela estiver no ar;
 *  2. senão, do JSON estático (assets/data/catalogo.json), para o site nunca ficar vazio.
 * O console do navegador mostra qual das duas fontes foi usada.
 */
export const URL_API = 'http://localhost:8080/api/catalogo';
export const URL_JSON = 'assets/data/catalogo.json';
/** quanto tempo esperar a API antes de desistir e usar o JSON */
const ESPERA_API_MS = 2500;

/** 'api' ou 'json': de onde o catálogo foi carregado */
export let fonteCatalogo = null;

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

async function buscarJson(url, ms) {
  const controle = new AbortController();
  const tempo = ms ? setTimeout(() => controle.abort(), ms) : null;
  try {
    const r = await fetch(url, { signal: controle.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status} em ${url}`);
    return await r.json();
  } finally {
    clearTimeout(tempo);
  }
}

/**
 * A API manda dois identificadores: "id" (número do banco) e "slug" (código em texto).
 * No site, o "id" de tudo é o código em texto, porque ele vai nos links
 * (produto.html?id=dorflex-36), no carrinho e nos filtros. O número fica em idBanco.
 * O JSON local já vem só com o código, então passa direto.
 */
const comSlug = (x) => (x.slug ? { ...x, id: x.slug, idBanco: x.id } : x);

/** Carrega o catálogo uma vez só (as outras chamadas reaproveitam a mesma promessa). */
export function carregarCatalogo() {
  carregando ??= (async () => {
    let dados;
    try {
      dados = await buscarJson(URL_API, ESPERA_API_MS);
      fonteCatalogo = 'api';
      console.info(`[pílula*] catálogo carregado da API (${URL_API})`);
    } catch {
      dados = await buscarJson(URL_JSON);
      fonteCatalogo = 'json';
      console.info('[pílula*] API fora do ar: catálogo carregado do JSON local');
    }
    categorias = dados.categorias.map((c) => ({ ...comSlug(c), subs: c.subs.map(comSlug) }));
    produtos = dados.produtos.map(comSlug);
    porId = new Map(produtos.map((p) => [p.id, p]));
  })();
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
