/* ==========================================================================
   Layout compartilhado: letreiro, cabeçalho, rodapé, avisos (toast).
   Cada página tem <div id="site-header"> e <div id="site-footer">.
   ========================================================================== */

import { carrinho } from '../lib/carrinho.js';
import { esc, icones } from '../lib/util.js';

const AVISOS = [
  'Frete grátis acima de R$ 99',
  'Entrega em até 2h na Grande SP',
  'Farmacêutico online 24h',
  'Cupom PILULA10 na primeira compra',
  'Manda a foto da receita',
];

const LINKS = [
  { href: 'index.html', rotulo: 'Início', pagina: 'home' },
  { href: 'loja.html', rotulo: 'Loja', pagina: 'loja' },
  { href: 'index.html#categorias', rotulo: 'Categorias', pagina: '' },
  { href: 'index.html#receita', rotulo: 'Receita', pagina: '' },
  { href: 'index.html#chat', rotulo: 'Farmacêutico 24h', pagina: '' },
];

function cabecalho(paginaAtual, busca) {
  const avisos = AVISOS.map((a) => `<span>${a}</span>`).join('');
  const nav = LINKS.map(
    (l) => `<a href="${l.href}"${l.pagina && l.pagina === paginaAtual ? ' aria-current="page"' : ''}>${l.rotulo}</a>`
  ).join('');

  return `
  <div class="topbar" role="region" aria-label="Avisos da loja">
    <div class="topbar__track">${avisos}${AVISOS.map((a) => `<span aria-hidden="true">${a}</span>`).join('')}</div>
  </div>
  <header class="header container">
    <a class="logo" href="index.html" aria-label="pílula*, página inicial">
      <span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span><span class="logo__star" aria-hidden="true">*</span>
    </a>
    <nav class="nav" aria-label="Principal">${nav}</nav>
    <form class="search" action="loja.html" role="search">
      <label class="sr-only" for="busca-topo">Buscar na farmácia</label>
      <input id="busca-topo" name="q" type="search" placeholder="buscar remédio, vitamina, protetor…" value="${esc(busca)}" autocomplete="off">
      <button type="submit" aria-label="Buscar">${icones.busca}</button>
    </form>
    <a class="cart-link" href="carrinho.html" data-cart-link>
      ${icones.sacola}<span>Carrinho</span>
      <span class="cart-link__count" data-cart-count>0</span>
      <span class="sr-only" data-cart-sr></span>
    </a>
  </header>`;
}

function rodape() {
  return `
  <footer class="footer">
    <div class="container footer__grid">
      <div>
        <a class="logo" href="index.html" aria-label="pílula*, página inicial"><span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span><span class="logo__star" aria-hidden="true">*</span></a>
        <p class="footer__tag">cuide de você primeiro.</p>
      </div>
      <nav aria-labelledby="f-loja"><h2 id="f-loja">Loja</h2><ul>
        <li><a href="loja.html?cat=medicamentos">Medicamentos</a></li>
        <li><a href="loja.html?cat=vitaminas">Vitaminas</a></li>
        <li><a href="loja.html?cat=dermo">Dermocosméticos</a></li>
        <li><a href="loja.html?cat=higiene">Higiene</a></li>
      </ul></nav>
      <nav aria-labelledby="f-ajuda"><h2 id="f-ajuda">Ajuda</h2><ul>
        <li><a href="index.html#chat">Fale com o farmacêutico</a></li>
        <li><a href="index.html#receita">Como enviar a receita</a></li>
        <li><a href="#">Trocas e devoluções</a></li>
        <li><a href="#">Política de privacidade</a></li>
      </ul></nav>
      <div><h2>Redes</h2><ul class="term" style="font-size:1.25rem">
        <li><a href="#">@pilula.farma</a></li>
        <li><a href="#">/pilula no tiktok</a></li>
        <li><a href="#">playlist da sala de espera</a></li>
      </ul></div>
    </div>
    <div class="container footer__legal">
      <p>Farmacêutico responsável: [NOME] — CRF-SP [Nº]<br>AFE/ANVISA [Nº] · CNPJ [00.000.000/0001-00]</p>
      <p class="footer__warning">Se persistirem os sintomas, o médico deverá ser consultado.</p>
      <p class="footer__note">Projeto Integrador — protótipo acadêmico. Produtos e preços ilustrativos.</p>
    </div>
  </footer>
  <div class="toast-area" aria-live="polite" aria-atomic="false" data-toasts></div>`;
}

function atualizarContador(animar = false) {
  const n = carrinho.quantidade();
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = n));
  document.querySelectorAll('[data-cart-sr]').forEach((el) => (el.textContent = `, ${n} ${n === 1 ? 'item' : 'itens'}`));
  if (animar) {
    const link = document.querySelector('[data-cart-link]');
    if (link) {
      link.classList.remove('is-bumped');
      void link.offsetWidth; // reinicia a animação
      link.classList.add('is-bumped');
    }
  }
}

export function montarLayout() {
  const pagina = document.body.dataset.page || '';
  const busca = new URLSearchParams(location.search).get('q') || '';
  const topo = document.getElementById('site-header');
  const base = document.getElementById('site-footer');
  if (topo) topo.innerHTML = cabecalho(pagina, pagina === 'loja' ? busca : '');
  if (base) base.innerHTML = rodape();
  atualizarContador();
  window.addEventListener('carrinho:mudou', () => atualizarContador(true));
}

/** Aviso estilo janela do Windows no canto da tela. */
export function avisar(mensagem, { link } = {}) {
  const area = document.querySelector('[data-toasts]');
  if (!area) return;
  const el = document.createElement('div');
  el.className = 'win toast';
  el.innerHTML = `
    <div class="win__bar"><span class="win__title">pílula.exe</span><span class="win__ctls" aria-hidden="true"><span class="win__ctl">×</span></span></div>
    <div class="win__body">${icones.info}<span>${esc(mensagem)}</span>${link ? `<a href="${link.href}">${esc(link.rotulo)}</a>` : ''}</div>`;
  area.appendChild(el);
  while (area.children.length > 3) area.firstElementChild.remove();
  setTimeout(() => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }, 2600);
}
