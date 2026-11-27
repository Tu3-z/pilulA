/* ==============================================================================
 * SERVIÇO: catalogo.js (Fonte de Dados e Resiliência)
 * ==============================================================================
 * Centraliza o carregamento, indexação e busca de produtos e categorias.
 * 
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 1. Padrão de Resiliência com Fallback Gracioso (Graceful Degradation):
 *    - Fonte Primária: Requisição HTTP para a API REST do Backend (/api/catalogo).
 *    - Timeout com AbortController: Aguarda no máximo 2500ms para evitar travamento de UI.
 *    - Fonte Secundária (Fallback): Caso a API esteja temporariamente offline ou lenta,
 *      carrega automaticamente o catálogo estático ('assets/data/catalogo.json').
 *    - Efeito: A experiência do usuário (UX) nunca quebra e a loja continua navegável!
 * 
 * 2. Estrutura de Indexação em Memória (O(1)):
 *    - Utiliza 'Map()' para busca instantânea de produtos por ID/slug sem varredura linear.
 * 
 * 3. Classificação Regulatória de Receitas (Anvisa):
 *    - Mapeia rótulos e advertências legais para medicamentos:
 *      * 'livre': MIPs (Medicamentos Isentos de Prescrição).
 *      * 'prescricao': Tarja Vermelha sob prescrição.
 *      * 'retencao': Tarja Vermelha/Preta com retenção obrigatória de receita médica.
 * ============================================================================== */

import { semAcento } from '../utils/texto.js';

/** Lê a URL base da API de config.js; se não existir, cai no localhost para dev local. */
const BASE_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');

export const URL_API = `${BASE_URL}/api/catalogo`;
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
    const urlComBuster = url.includes('?') ? `${url}&_t=${Date.now()}` : `${url}?_t=${Date.now()}`;
    const r = await fetch(urlComBuster, { signal: controle.signal, cache: 'no-cache' });
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

const CHAVE_CACHE = 'pilula:catalogo:cache:v4';

function aplicarDados(dados) {
  categorias = dados.categorias.map((c) => ({ ...comSlug(c), subs: c.subs.map(comSlug) }));
  produtos = dados.produtos.map(comSlug);
  porId = new Map(produtos.map((p) => [p.id, p]));
}

// Carrega imediatamente do cache da sessão (evita FOUC / cold start em navegações)
try {
  const cacheStr = sessionStorage.getItem(CHAVE_CACHE);
  if (cacheStr) {
    aplicarDados(JSON.parse(cacheStr));
  }
} catch {
  /* sem sessionStorage */
}

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
    aplicarDados(dados);
    try {
      sessionStorage.setItem(CHAVE_CACHE, JSON.stringify(dados));
    } catch {}
  })();
  return carregando;
}

export const todasCategorias = () => categorias;
export const todosProdutos = () => produtos;
export const produto = (id) => {
  if (!id) return null;
  const encontrado = porId.get(id);
  if (encontrado) return encontrado;
  const idNum = Number(id);
  if (Number.isFinite(idNum) && idNum > 0) {
    return produtos.find((p) => p.idBanco === idNum) ?? null;
  }
  return null;
};
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
