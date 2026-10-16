/* Cartão de produto + delegação do botão "adicionar" */

import { getCategoria, formatBRL } from '../data/produtos.js';
import { carrinho } from '../lib/carrinho.js';
import { getProduto } from '../data/produtos.js';
import { arte } from '../lib/arte.js';
import { avisar } from './layout.js';

export function precoHTML(p) {
  return `<span class="price">
    ${p.precoAntigo ? `<span class="price__old"><span class="sr-only">de </span>${formatBRL(p.precoAntigo)}</span>` : ''}
    <span class="price__now">${p.precoAntigo ? '<span class="sr-only">por </span>' : ''}${formatBRL(p.preco)}</span>
  </span>`;
}

export function cardProduto(p) {
  const cat = getCategoria(p.categoria);
  return `
  <article class="card">
    <div class="card__media">
      <div class="art">${arte(p)}</div>
      ${p.selo ? `<span class="card__selo badge badge--dark">${p.selo}</span>` : ''}
    </div>
    <div class="card__body">
      <p class="card__cat">${p.marca}<span aria-hidden="true"> · </span><span class="sr-only">, </span>${cat ? cat.nome : ''}</p>
      <h3 class="card__title"><a href="produto.html?id=${p.id}">${p.nome}</a></h3>
      <p class="card__sub">${p.sub}</p>
      ${p.receita !== 'livre' ? `<span class="tarja">tarja vermelha · ${p.receita === 'retencao' ? 'retém receita' : 'exige receita'}</span>` : ''}
    </div>
    <div class="card__foot">
      ${precoHTML(p)}
      <button type="button" class="btn btn--primary btn--sm" data-add="${p.id}" aria-label="Adicionar ${p.nome} ao carrinho">+ add</button>
    </div>
  </article>`;
}

/** Liga os botões [data-add] dentro de `raiz` (uma vez só, por delegação). */
export function ligarBotoesAdicionar(raiz) {
  raiz.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-add]');
    if (!botao || !raiz.contains(botao)) return;
    const p = getProduto(botao.dataset.add);
    if (!p) return;
    carrinho.adicionar(p.id, 1);
    avisar(`${p.nome} foi pro carrinho.`, { link: { href: 'carrinho.html', rotulo: 'ver →' } });
  });
}
