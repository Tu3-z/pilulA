import { $, esc, formatBRL, param } from '../core/texto.js';
import { icone } from '../core/icones.js';
import { arteHtml } from '../core/arte.js';
import * as catalogo from '../core/catalogo.js';
import * as carrinho from '../core/carrinho.js';
import { mostrarAviso } from '../core/avisos.js';
import { iniciarLayout } from '../components/layout.js';
import { cardHtml, ligarCards, precoHtml } from '../components/card.js';

/* Página de produto: produto.html?id=dorflex-36 */

await iniciarLayout();
ligarCards();

const ABAS = [
  { id: 'desc', rotulo: 'Descrição' },
  { id: 'uso', rotulo: 'Como usar' },
  { id: 'aviso', rotulo: 'Avisos' },
];

const p = catalogo.produto(param('id'));
const raiz = $('#produto');

if (!p) naoEncontrado();
else montar(p);

function naoEncontrado() {
  document.title = 'Produto não encontrado — pílula*';
  raiz.innerHTML = `
    <div class="container not-found">
      <div class="win">
        <div class="win__bar"><span class="win__title">Erro</span></div>
        <div class="win__body not-found__body">
          ${icone('info')}
          <div>
            <h1 class="not-found__title">Arquivo não encontrado.</h1>
            <p>Esse produto não existe ou saiu do catálogo.</p>
          </div>
        </div>
        <div class="dialog__actions"><a class="win__btn win__btn--link" href="loja.html">Voltar pra loja</a></div>
      </div>
    </div>`;
}

function montar(p) {
  const cat = catalogo.categoria(p.categoria);
  const sub = catalogo.sub(p.categoria, p.subcategoria);
  const receita = catalogo.RECEITA[p.receita] ?? catalogo.RECEITA.livre;
  const parcelas = carrinho.maxParcelas(p.preco);
  document.title = `${p.nome} — pílula*`;

  // relacionados: primeiro da mesma subcategoria, depois da mesma categoria
  const todos = catalogo.todosProdutos();
  const relacionados = [
    ...todos.filter(
      (x) => x.categoria === p.categoria && x.subcategoria === p.subcategoria && x.id !== p.id,
    ),
    ...todos.filter((x) => x.categoria === p.categoria && x.subcategoria !== p.subcategoria),
  ].slice(0, 4);

  const loja = (params) => `loja.html?${new URLSearchParams(params)}`;

  raiz.innerHTML = `
    <div class="container">
      <nav class="crumbs" aria-label="Você está em">
        <ol>
          <li><a href="index.html">Início</a></li>
          <li><a href="loja.html">Loja</a></li>
          ${cat ? `<li><a href="${loja({ cat: cat.id })}">${esc(cat.nome)}</a></li>` : ''}
          ${sub ? `<li><a href="${loja({ cat: p.categoria, sub: sub.id })}">${esc(sub.nome)}</a></li>` : ''}
          <li><span aria-current="page">${esc(p.nome)}</span></li>
        </ol>
      </nav>

      <article class="pdp">
        <div class="pdp__media">
          <div class="win pdp__frame">
            <div class="win__body pdp__media-inner">
              ${p.selo ? `<span class="pdp__selo badge badge--dark">${esc(p.selo)}</span>` : ''}
              ${arteHtml(p)}
            </div>
          </div>
        </div>

        <div class="pdp__info">
          <div>
            <p class="pdp__brand"><a href="${loja({ marca: p.marca })}">${esc(p.marca)}</a></p>
            <h1 class="pdp__title">${esc(p.nome)}</h1>
            <p class="pdp__sub">${esc(p.sub)}</p>
          </div>
          <div class="pdp__tags">
            ${p.receita !== 'livre' ? `<span class="tarja">${esc(receita.rotulo)}</span>` : `<span class="badge">${esc(receita.rotulo)}</span>`}
            <span class="badge badge--blue">entrega em 2h</span>
          </div>

          ${
            p.receita !== 'livre'
              ? `<div class="pdp__alert" role="note"><div><b>Precisa de receita.</b>${esc(receita.aviso)} Você pode enviar a foto no carrinho.</div></div>`
              : ''
          }

          <div class="pdp__buy">
            ${precoHtml(p, 'price--lg')}
            <p class="pdp__pix">
              ${parcelas > 1 ? `ou ${parcelas}x de ${formatBRL(p.preco / parcelas)} sem juros no cartão` : 'no Pix, cartão ou na entrega'}
            </p>
            <div class="pdp__row">
              <div class="stepper">
                <button type="button" data-qtd="-1" aria-label="Diminuir quantidade">–</button>
                <label class="sr-only" for="qtd">Quantidade</label>
                <input id="qtd" type="number" inputmode="numeric" min="1" max="99" value="1">
                <button type="button" data-qtd="1" aria-label="Aumentar quantidade">+</button>
              </div>
              <button type="button" class="btn btn--primary" id="comprar">Adicionar ao carrinho</button>
            </div>
            <p class="pdp__incart" id="no-carrinho" role="status" hidden></p>
            <ul class="pdp__ship">
              <li>chega em até 2h na Grande SP</li>
              <li>frete grátis acima de R$ 99</li>
              <li>dúvida? o farmacêutico responde no chat</li>
            </ul>
          </div>

          <div class="tabs">
            <div class="tabs__list" role="tablist" aria-label="Informações do produto">
              ${ABAS.map(
                (a, i) =>
                  `<button class="tabs__tab" role="tab" id="tab-${a.id}" aria-controls="painel-${a.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${a.rotulo}</button>`,
              ).join('')}
            </div>
            <div class="tabs__panel" role="tabpanel" id="painel-desc" aria-labelledby="tab-desc">
              <p>${esc(p.descricao)}</p>
              <p>Apresentação: ${esc(p.sub)}. Marca: ${esc(p.marca)}.</p>
            </div>
            <div class="tabs__panel" role="tabpanel" id="painel-uso" aria-labelledby="tab-uso" hidden>
              <p>Siga a orientação do seu médico ou farmacêutico e leia as instruções da embalagem${p.categoria === 'medicamentos' ? ' e a bula' : ''} antes de usar.</p>
            </div>
            <div class="tabs__panel" role="tabpanel" id="painel-aviso" aria-labelledby="tab-aviso" hidden>
              <p>${esc(receita.aviso)}</p>
              <p>Mantenha fora do alcance de crianças.</p>
            </div>
          </div>
        </div>
      </article>
    </div>

    ${
      relacionados.length
        ? `<section class="container section related" aria-labelledby="rel-titulo">
            <header class="related__head">
              <p class="eyebrow">Da mesma categoria</p>
              <h2 id="rel-titulo" class="h2">Você também <span class="px">pode</span> gostar</h2>
            </header>
            <div class="grid">${relacionados.map(cardHtml).join('')}</div>
          </section>`
        : ''
    }`;

  ligarCompra(p);
  ligarAbas();
}

/* ---------- quantidade + adicionar ---------- */
function ligarCompra(p) {
  const campo = $('#qtd');
  const ajustar = (valor) => (campo.value = Math.min(99, Math.max(1, parseInt(valor, 10) || 1)));
  document
    .querySelectorAll('[data-qtd]')
    .forEach((b) =>
      b.addEventListener('click', () => ajustar(Number(campo.value) + Number(b.dataset.qtd))),
    );
  campo.addEventListener('change', () => ajustar(campo.value));

  const botao = $('#comprar');
  let timer;
  botao.addEventListener('click', () => {
    const qtd = Number(campo.value);
    carrinho.adicionar(p.id, qtd);
    botao.classList.add('is-done');
    botao.innerHTML = `${icone('check')} Adicionado!`;
    clearTimeout(timer);
    timer = setTimeout(() => {
      botao.classList.remove('is-done');
      botao.textContent = 'Adicionar ao carrinho';
    }, 1600);
    mostrarAviso(`${qtd}× ${p.nome} no carrinho.`, {
      link: { href: 'carrinho.html', rotulo: 'Ver carrinho' },
    });
  });

  // "Você tem N no carrinho"
  const desenharNoCarrinho = () => {
    const n = carrinho.qtdDe(p.id);
    const el = $('#no-carrinho');
    el.hidden = !n;
    el.innerHTML = n
      ? `${icone('check')} Você tem ${n} no carrinho · <a href="carrinho.html">ver carrinho e finalizar →</a>`
      : '';
  };
  desenharNoCarrinho();
  carrinho.aoMudar(desenharNoCarrinho);
}

/* ---------- abas (padrão WAI-ARIA: setas trocam de aba) ---------- */
function ligarAbas() {
  const abas = [...document.querySelectorAll('.tabs__tab')];
  const selecionar = (aba, focar = false) => {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute('aria-selected', String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      $(`#${a.getAttribute('aria-controls')}`).hidden = !ativa;
    });
    if (focar) aba.focus();
  };
  abas.forEach((aba, i) => {
    aba.addEventListener('click', () => selecionar(aba));
    aba.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) selecionar(abas[(i + d + abas.length) % abas.length], true);
    });
  });
}
