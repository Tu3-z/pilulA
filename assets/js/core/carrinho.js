import { gravarStorage, lerStorage } from './texto.js';
import { produto } from './catalogo.js';

/*
 * Carrinho salvo no localStorage e sincronizado entre abas.
 * Quem precisa reagir a mudanças usa aoMudar(fn).
 */

const CHAVE = 'pilula:carrinho:v1';

export const FRETE_GRATIS_A_PARTIR = 99;
export const VALOR_FRETE = 9.9;
export const PARCELA_MINIMA = 30;
export const MAX_PARCELAS = 3;

const CUPONS = {
  PILULA10: { percentual: 0.1, descricao: '10% na primeira compra' },
};

/** Quantas parcelas sem juros cabem num valor (parcela mínima de R$ 30, até 3x). */
export const maxParcelas = (valor) =>
  Math.max(1, Math.min(MAX_PARCELAS, Math.floor(valor / PARCELA_MINIMA)));

let itensMap = {};
let cupomCodigo = null;
const eventos = new EventTarget();

function carregar() {
  const dados = lerStorage(CHAVE, { itens: {}, cupom: null });
  itensMap = {};
  for (const [id, qtd] of Object.entries(dados.itens ?? {})) {
    if (Number.isInteger(qtd) && qtd > 0) itensMap[id] = Math.min(99, qtd);
  }
  cupomCodigo = dados.cupom && CUPONS[dados.cupom] ? dados.cupom : null;
}

function salvarEAvisar() {
  gravarStorage(CHAVE, { itens: itensMap, cupom: cupomCodigo });
  eventos.dispatchEvent(new Event('mudou'));
}

carregar();
// outra aba mexeu no carrinho
window.addEventListener('storage', (e) => {
  if (e.key === CHAVE) {
    carregar();
    eventos.dispatchEvent(new Event('mudou'));
  }
});

/** Chama `fn` sempre que o carrinho mudar (nesta aba ou em outra). */
export const aoMudar = (fn) => eventos.addEventListener('mudou', fn);

/** Linhas com o produto completo (precisa do catálogo carregado). */
export const itens = () =>
  Object.entries(itensMap)
    .map(([id, qtd]) => ({ produto: produto(id), qtd }))
    .filter((l) => !!l.produto);

export const quantidade = () => Object.values(itensMap).reduce((s, q) => s + q, 0);
export const qtdDe = (id) => itensMap[id] ?? 0;
export const cupom = () => (cupomCodigo ? { codigo: cupomCodigo, ...CUPONS[cupomCodigo] } : null);

export function adicionar(id, qtd = 1) {
  itensMap = { ...itensMap, [id]: Math.min(99, (itensMap[id] ?? 0) + qtd) };
  salvarEAvisar();
}

export function definir(id, qtd) {
  const n = Math.floor(Number(qtd));
  const novo = { ...itensMap };
  if (!Number.isFinite(n) || n <= 0) delete novo[id];
  else novo[id] = Math.min(99, n);
  itensMap = novo;
  salvarEAvisar();
}

export const remover = (id) => definir(id, 0);

export function limpar() {
  itensMap = {};
  cupomCodigo = null;
  salvarEAvisar();
}

export function aplicarCupom(codigo) {
  const c = String(codigo || '')
    .trim()
    .toUpperCase();
  if (!CUPONS[c]) return false;
  cupomCodigo = c;
  salvarEAvisar();
  return true;
}

export function removerCupom() {
  cupomCodigo = null;
  salvarEAvisar();
}

/** Totais do pedido. Retirada na loja zera o frete. */
export function resumo(retirada = false) {
  const linhas = itens();
  const subtotal = linhas.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
  const c = cupom();
  const desconto = c ? Math.round(subtotal * c.percentual * 100) / 100 : 0;
  const base = subtotal - desconto;
  const freteGratis = base >= FRETE_GRATIS_A_PARTIR;
  const frete = linhas.length === 0 || freteGratis || retirada ? 0 : VALOR_FRETE;
  return {
    itens: linhas,
    subtotal,
    desconto,
    frete,
    freteGratis,
    retirada,
    faltaParaFrete: Math.max(0, FRETE_GRATIS_A_PARTIR - base),
    progressoFrete: Math.min(1, base / FRETE_GRATIS_A_PARTIR),
    total: base + frete,
    exigeReceita: linhas.some((i) => i.produto.receita !== 'livre'),
  };
}
