/* Utilitários de texto, formatação, DOM e localStorage. */

const MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto antes de montar HTML em string. Use sempre que o valor vier do usuário, da URL ou do catálogo. */
export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA[c]);

/** Minúsculas e sem acento, para comparar em buscas. */
export const semAcento = (s) =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
/** 12.5 → "R$ 12,50" */
export const formatBRL = (n) => brl.format(n);

/** Atalhos de seleção. */
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

/** Lê do localStorage sem quebrar em aba anônima / storage bloqueado. */
export function lerStorage(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}

export function gravarStorage(chave, valor) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem storage: o estado fica só em memória */
  }
}

/** Lê um parâmetro da URL atual (?cat=dermo → "dermo"). */
export const param = (nome) => new URLSearchParams(location.search).get(nome) ?? '';

/** true se a pessoa pediu "reduzir movimento" no sistema. */
export const menosMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
