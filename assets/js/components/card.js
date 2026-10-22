import { esc, formatBRL } from '../core/texto.js';
import { icone } from '../core/icones.js';
import { arteHtml } from '../core/arte.js';
import * as catalogo from '../core/catalogo.js';
import * as carrinho from '../core/carrinho.js';
import { mostrarAviso } from '../core/avisos.js';

/** Preço com o "de/por" lido corretamente por leitores de tela. */
export function precoHtml(p, classeExtra = '') {
  return `
    <span class="price ${classeExtra}">
      ${p.precoAntigo ? `<span class="price__old"><span class="sr-only">de </span>${formatBRL(p.precoAntigo)}</span>` : ''}
      <span class="price__now">${p.precoAntigo ? '<span class="sr-only">por </span>' : ''}${formatBRL(p.preco)}</span>
    </span>`;
}

const noCarrinhoHtml = (id) => {
  const n = carrinho.qtdDe(id);
  return n ? `${icone('check')} ${n} no carrinho` : '';
};

/** Cartão de produto (o cartão inteiro é clicável; o botão adiciona ao carrinho). */
export function cardHtml(p) {
  const cat = catalogo.categoria(p.categoria)?.nome ?? '';
  return `
    <article class="card" data-id="${esc(p.id)}">
      <div class="card__media">
        ${arteHtml(p)}
        ${p.selo ? `<span class="card__selo badge badge--dark">${esc(p.selo)}</span>` : ''}
      </div>
      <div class="card__body">
        <p class="card__cat">${esc(p.marca)}<span aria-hidden="true"> · </span><span class="sr-only">, </span>${esc(cat)}</p>
        <h3 class="card__title"><a href="produto.html?id=${encodeURIComponent(p.id)}">${esc(p.nome)}</a></h3>
        <p class="card__sub">${esc(p.sub)}</p>
        <p class="card__incart" ${carrinho.qtdDe(p.id) ? '' : 'hidden'}>${noCarrinhoHtml(p.id)}</p>
        ${
          p.receita !== 'livre'
            ? `<span class="tarja">tarja vermelha · ${p.receita === 'retencao' ? 'retém receita' : 'exige receita'}</span>`
            : ''
        }
      </div>
      <div class="card__foot">
        ${precoHtml(p)}
        <button type="button" class="btn btn--primary btn--sm card__add" aria-label="Adicionar ${esc(p.nome)} ao carrinho">
          ${icone('sacola')} Adicionar
        </button>
      </div>
    </article>`;
}

let ligado = false;

/**
 * Liga os botões "Adicionar" de todos os cartões da página (delegação de eventos:
 * funciona também para cartões desenhados depois, como na loja ao filtrar).
 */
export function ligarCards() {
  if (ligado) return;
  ligado = true;

  document.addEventListener('click', (e) => {
    const botao = e.target.closest('.card__add');
    if (!botao) return;
    const id = botao.closest('.card').dataset.id;
    const p = catalogo.produto(id);
    carrinho.adicionar(id);

    // "Adicionado ✓" por um instante
    botao.classList.add('is-done');
    botao.innerHTML = `${icone('check')} Adicionado`;
    clearTimeout(botao._timer);
    botao._timer = setTimeout(() => {
      botao.classList.remove('is-done');
      botao.innerHTML = `${icone('sacola')} Adicionar`;
    }, 1500);

    mostrarAviso(`${p.nome} foi pro carrinho.`, {
      link: { href: 'carrinho.html', rotulo: 'Ver carrinho' },
    });
  });

  // mantém o "N no carrinho" de cada cartão em dia
  carrinho.aoMudar(() => {
    document.querySelectorAll('.card[data-id]').forEach((card) => {
      const linha = card.querySelector('.card__incart');
      const n = carrinho.qtdDe(card.dataset.id);
      linha.hidden = !n;
      linha.innerHTML = noCarrinhoHtml(card.dataset.id);
    });
  });
}
