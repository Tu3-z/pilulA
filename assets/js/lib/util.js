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
  estrela: '<svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="#121216" d="M7 1h2v4h4v2h-2v2h1v4h-2v-1H6v1H4V9h1V7H3V5h4z"/><path fill="#2340B8" d="M7 2h2v4h3v1h-2v3h1v2h-1v-1H6v1H5v-2h1V7H4V6h3z"/></svg>',
  receita: '<svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="#121216" d="M3 1h8l3 3v11H3z"/><path fill="#FBFAF5" d="M4 2h6v3h3v9H4z"/><path fill="#2340B8" d="M5 7h6v1H5zM5 9h6v1H5zM5 11h4v1H5z"/></svg>',
  chat: '<svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="#121216" d="M1 2h14v10H7l-3 3v-3H1z"/><path fill="#FBFAF5" d="M2 3h12v8H6l-1 1v-1H2z"/><path fill="#2340B8" d="M4 5h8v1H4zM4 8h5v1H4z"/></svg>',
  desligar: '<svg width="20" height="20" viewBox="0 0 16 16" aria-hidden="true" shape-rendering="crispEdges"><path fill="#121216" d="M7 1h2v7H7zM4 3h2v2H5v1H4v4h1v1h1v1h4v-1h1v-1h1V6h-1V5h-1V3h2v1h1v1h1v6h-1v1h-1v1h-1v1H5v-1H4v-1H3v-1H2V5h1V4h1z"/></svg>',
  boneco:'<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true" shape-rendering="crispEdges"><circle cx="11" cy="5" r="3.5" fill="#2340B8" stroke="#121216" stroke-width="1.2"/><path d="M5 20l4-8 2 3 2-3 4 8" fill="none" stroke="#2340B8" stroke-width="3" stroke-linejoin="round"/></svg>',
};
