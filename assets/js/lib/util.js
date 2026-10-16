/* utilitários pequenos */

const MAPA = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escapa texto antes de colocar em HTML. Use sempre que o valor vier do usuário ou da URL. */
export const esc = (valor) => String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA[c]);

export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

/** Normaliza para busca: minúsculas e sem acentos. */
export const normalizar = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const icones = {
  seta: '<svg width="30" height="12" viewBox="0 0 34 12" aria-hidden="true"><path d="M0 6h31M26 1l6 5-6 5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  busca: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>',
  sacola: '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M5 8h14l-1.2 12H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  pasta: '<svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true" shape-rendering="crispEdges"><path d="M1 3h6l2 2h10v10H1z" fill="#E9E0C6" stroke="#121216" stroke-width="1.5"/><path d="M1 6h18" stroke="#121216" stroke-width="1"/></svg>',
  info: '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true" shape-rendering="crispEdges"><circle cx="16" cy="16" r="14" fill="#2340B8" stroke="#121216" stroke-width="2"/><rect x="14" y="8" width="4" height="4" fill="#FBFAF5"/><rect x="14" y="14" width="4" height="10" fill="#FBFAF5"/></svg>',
  ok: '<svg width="36" height="36" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="#1E7F47" stroke="#121216" stroke-width="2"/><path d="M9 16.5l5 5 9-10" fill="none" stroke="#FBFAF5" stroke-width="3" stroke-linecap="square"/></svg>',
  boneco: '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" shape-rendering="crispEdges"><circle cx="11" cy="5" r="3.5" fill="#2340B8" stroke="#121216" stroke-width="1.2"/><path d="M5 20l4-8 2 3 2-3 4 8" fill="none" stroke="#2340B8" stroke-width="3" stroke-linejoin="round"/></svg>',
};
