/* ==========================================================================
   Carrinho: estado em memória + localStorage.
   Emite 'carrinho:mudou' no window sempre que algo muda.
   ========================================================================== */

import { getProduto } from '../data/produtos.js';

const CHAVE = 'pilula:carrinho:v1';
export const FRETE_GRATIS_A_PARTIR = 99;
export const VALOR_FRETE = 9.9;
export const PARCELA_MINIMA = 30;
export const MAX_PARCELAS = 3;

/** Quantas parcelas sem juros cabem num valor (parcela mínima de R$ 30, até 3x). */
export const maxParcelas = (valor) => Math.max(1, Math.min(MAX_PARCELAS, Math.floor(valor / PARCELA_MINIMA)));
const CUPONS = {
  PILULA10: { percentual: 0.1, descricao: '10% na primeira compra' },
};

let estado = { itens: {}, cupom: null };

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return;
    const dados = JSON.parse(bruto);
    if (dados && typeof dados.itens === 'object') {
      const itens = {};
      for (const [id, qtd] of Object.entries(dados.itens)) {
        if (getProduto(id) && Number.isInteger(qtd) && qtd > 0) itens[id] = Math.min(qtd, 99);
      }
      estado = { itens, cupom: CUPONS[dados.cupom] ? dados.cupom : null };
    }
  } catch {
    /* storage indisponível: segue só em memória */
  }
}

function avisar() {
  window.dispatchEvent(new CustomEvent('carrinho:mudou'));
}

function salvar() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* ignora */
  }
  avisar();
}

carregar();

// mantém abas diferentes sincronizadas
window.addEventListener('storage', (e) => {
  if (e.key === CHAVE) {
    carregar();
    avisar();
  }
});

export const carrinho = {
  itens() {
    return Object.entries(estado.itens)
      .map(([id, qtd]) => ({ produto: getProduto(id), qtd }))
      .filter((i) => i.produto);
  },

  quantidade() {
    return Object.values(estado.itens).reduce((soma, q) => soma + q, 0);
  },

  adicionar(id, qtd = 1) {
    if (!getProduto(id)) return;
    estado.itens[id] = Math.min(99, (estado.itens[id] || 0) + qtd);
    salvar();
  },

  definir(id, qtd) {
    const n = Math.floor(Number(qtd));
    if (!Number.isFinite(n) || n <= 0) delete estado.itens[id];
    else estado.itens[id] = Math.min(99, n);
    salvar();
  },

  remover(id) {
    delete estado.itens[id];
    salvar();
  },

  limpar() {
    estado = { itens: {}, cupom: null };
    salvar();
  },

  cupom() {
    return estado.cupom ? { codigo: estado.cupom, ...CUPONS[estado.cupom] } : null;
  },

  aplicarCupom(codigo) {
    const c = String(codigo || '').trim().toUpperCase();
    if (!CUPONS[c]) return false;
    estado.cupom = c;
    salvar();
    return true;
  },

  removerCupom() {
    estado.cupom = null;
    salvar();
  },

  /** @param {{retirada?: boolean}} opcoes  retirada na loja zera o frete */
  resumo({ retirada = false } = {}) {
    const itens = this.itens();
    const subtotal = itens.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
    const cupom = this.cupom();
    const desconto = cupom ? Math.round(subtotal * cupom.percentual * 100) / 100 : 0;
    const base = subtotal - desconto;
    const freteGratis = base >= FRETE_GRATIS_A_PARTIR;
    const frete = itens.length === 0 || freteGratis || retirada ? 0 : VALOR_FRETE;
    return {
      itens,
      subtotal,
      desconto,
      frete,
      freteGratis,
      retirada,
      faltaParaFrete: Math.max(0, FRETE_GRATIS_A_PARTIR - base),
      progressoFrete: Math.min(1, base / FRETE_GRATIS_A_PARTIR),
      total: base + frete,
      exigeReceita: itens.some((i) => i.produto.receita !== 'livre'),
    };
  },
};
