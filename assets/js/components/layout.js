/* ==========================================================================
   Layout compartilhado: letreiro, cabeçalho + navbar ("barra de tarefas"),
   menu Iniciar, busca com sugestões, rodapé e avisos (toast).
   Cada página tem <div id="site-header"> e <div id="site-footer">.
   ========================================================================== */

import { carrinho } from '../lib/carrinho.js';
import { sessao } from '../lib/sessao.js';
import { CATEGORIAS, buscarProdutos, formatBRL } from '../data/produtos.js';
import { arte } from '../lib/arte.js';
import { esc, icones } from '../lib/util.js';

const AVISOS = [
  'Frete grátis acima de R$ 99',
  'Entrega em até 2h na Grande SP',
  'Farmacêutico online 24h',
  'Cupom PILULA10 na primeira compra',
  'Até 3x sem juros no cartão',
  'Manda a foto da receita',
];

const ICONE_CRUZ = '<span class="cross-ico" aria-hidden="true"></span>';
const SETA_DIR = '<svg class="caret" width="8" height="10" viewBox="0 0 8 10" aria-hidden="true"><path d="M1 1l5 4-5 4z" fill="currentColor"/></svg>';
const SETA_BAIXO = '<svg class="caret" width="10" height="8" viewBox="0 0 10 8" aria-hidden="true"><path d="M1 1l4 5 4-5z" fill="currentColor"/></svg>';
const ICONE_USUARIO = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" stroke-linecap="round"/></svg>';

/* ---------------------------------------------------------------- HTML */

function htmlConta() {
  const u = sessao.atual();
  if (!u) return `<a class="hdr-btn" href="entrar.html">${ICONE_USUARIO}<span>Entrar</span></a>`;
  const primeiro = esc(u.nome.split(' ')[0]);
  return `<div class="account">
    <button type="button" class="hdr-btn" aria-expanded="false" aria-controls="menu-conta" data-conta-btn>${ICONE_USUARIO}<span>Olá, ${primeiro}</span>${SETA_BAIXO}</button>
    <div class="win dropdown" id="menu-conta" hidden>
      <p class="dropdown__who">${esc(u.email)}</p>
      <a href="carrinho.html">Meu carrinho</a>
      <a href="index.html#receita">Enviar receita</a>
      <button type="button" data-sair>Sair</button>
    </div>
  </div>`;
}

function htmlTaskbar(catAtual) {
  const itens = CATEGORIAS.map((c) => `
    <li class="tb-item">
      <a class="tb-link" href="loja.html?cat=${c.id}"${c.id === catAtual ? ' aria-current="true"' : ''}>${c.nome}</a>
      <div class="win flyout" role="group" aria-label="${c.nome}">
        <ul>
          ${c.subs.map((s) => `<li><a href="loja.html?cat=${c.id}&amp;sub=${s.id}">${s.nome}</a></li>`).join('')}
          <li class="flyout__all"><a href="loja.html?cat=${c.id}">Ver tudo em ${c.nome} →</a></li>
        </ul>
      </div>
    </li>`).join('');

  return `
  <nav class="taskbar" aria-label="Categorias">
    <div class="container taskbar__inner">
      <button type="button" class="start-btn" aria-expanded="false" aria-controls="menu-iniciar" data-start>
        ${ICONE_CRUZ}<span>Iniciar</span>
      </button>
      <ul class="tb-links">
        ${itens}
        <li class="tb-item"><a class="tb-link tb-link--hot" href="loja.html?oferta=1">Ofertas</a></li>
      </ul>
      <div class="tray">
        <a class="tray__pharm" href="index.html#chat"><span class="tray__dot" aria-hidden="true"></span><span class="tray__label">farmacêutico online</span></a>
        <time class="tray__clock" data-relogio aria-label="Hora atual"></time>
      </div>
    </div>
  </nav>`;
}

function htmlMenuIniciar() {
  const u = sessao.atual();
  return `
  <div class="start-menu win" id="menu-iniciar" hidden>
    <div class="start-menu__band" aria-hidden="true"><span>pílula<b>98</b></span></div>
    <nav class="start-menu__body" aria-label="Menu Iniciar">
      <ul>
        ${CATEGORIAS.map((c) => `
          <li class="sm-item">
            <details>
              <summary>${icones.pasta}<span>${c.nome}</span>${SETA_DIR}</summary>
              <ul class="sm-sub">
                ${c.subs.map((s) => `<li><a href="loja.html?cat=${c.id}&amp;sub=${s.id}">${s.nome}</a></li>`).join('')}
                <li><a href="loja.html?cat=${c.id}"><b>Ver tudo</b></a></li>
              </ul>
            </details>
          </li>`).join('')}
        <li class="sm-sep" role="separator"></li>
        <li><a class="sm-link" href="loja.html?oferta=1">${icones.estrela}<span>Ofertas</span></a></li>
        <li><a class="sm-link" href="index.html#receita">${icones.receita}<span>Enviar receita</span></a></li>
        <li><a class="sm-link" href="index.html#chat">${icones.chat}<span>Farmacêutico 24h</span></a></li>
        <li class="sm-sep" role="separator"></li>
        <li><a class="sm-link" href="carrinho.html">${icones.sacola}<span>Carrinho (<span data-cart-count>0</span>)</span></a></li>
        <li>${u
          ? `<button type="button" class="sm-link" data-sair>${icones.desligar}<span>Sair (${esc(u.nome.split(' ')[0])})…</span></button>`
          : `<a class="sm-link" href="entrar.html">${icones.desligar}<span>Entrar / criar conta…</span></a>`}</li>
      </ul>
    </nav>
  </div>`;
}

function cabecalho(paginaAtual, busca, catAtual) {
  const avisos = AVISOS.map((a) => `<span>${a}</span>`).join('');
  return `
  <div class="topbar" role="region" aria-label="Avisos da loja">
    <div class="topbar__track">${avisos}${AVISOS.map((a) => `<span aria-hidden="true">${a}</span>`).join('')}</div>
  </div>
  <div class="site-header" data-header>
    <header class="header container">
      <button type="button" class="hdr-menu" aria-expanded="false" aria-controls="menu-iniciar" aria-label="Abrir menu" data-start>
        <span></span><span></span><span></span>
      </button>
      <a class="logo" href="index.html" aria-label="pílula*, página inicial">
        <span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span><span class="logo__star" aria-hidden="true">*</span>
      </a>
      <form class="search" action="loja.html" role="search" data-busca>
        <label class="sr-only" for="busca-topo">Buscar na farmácia</label>
        <input id="busca-topo" name="q" type="search" placeholder="buscar remédio, marca, sintoma…" value="${esc(busca)}"
          autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="busca-sugestoes">
        <button type="submit" aria-label="Buscar">${icones.busca}</button>
        <ul class="win suggest" id="busca-sugestoes" role="listbox" aria-label="Sugestões" hidden></ul>
      </form>
      <div class="header__actions">
        <div data-conta>${htmlConta()}</div>
        <a class="cart-link" href="carrinho.html" data-cart-link>
          ${icones.sacola}<span class="cart-link__txt">Carrinho</span>
          <span class="cart-link__count" data-cart-count>0</span>
          <span class="sr-only" data-cart-sr></span>
        </a>
      </div>
    </header>
    ${htmlTaskbar(catAtual)}
    ${htmlMenuIniciar()}
  </div>`;
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
        ${CATEGORIAS.map((c) => `<li><a href="loja.html?cat=${c.id}">${c.nome}</a></li>`).join('')}
      </ul></nav>
      <nav aria-labelledby="f-ajuda"><h2 id="f-ajuda">Ajuda</h2><ul>
        <li><a href="index.html#chat">Fale com o farmacêutico</a></li>
        <li><a href="index.html#receita">Como enviar a receita</a></li>
        <li><a href="entrar.html">Minha conta</a></li>
        <li><a href="#">Trocas e devoluções</a></li>
        <li><a href="#">Política de privacidade</a></li>
      </ul></nav>
      <div>
        <h2>Pagamento</h2>
        <ul class="footer__pay">
          <li class="badge">Pix</li><li class="badge">Visa</li><li class="badge">Mastercard</li><li class="badge">Elo</li><li class="badge">Na entrega</li>
        </ul>
        <h2 class="footer__h2-gap">Redes</h2>
        <ul class="footer__social term">
          <li><a href="#">@pilula.farma</a></li>
          <li><a href="#">/pilula no tiktok</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer__legal">
      <p>Farmacêutico responsável: [NOME] — CRF-SP [Nº]<br>AFE/ANVISA [Nº] · CNPJ [00.000.000/0001-00]</p>
      <p class="footer__warning">Se persistirem os sintomas, o médico deverá ser consultado.</p>
      <p class="footer__note">Projeto Integrador — protótipo acadêmico. Produtos reais usados como dados de teste; preços ilustrativos. Marcas pertencem aos seus donos.</p>
    </div>
  </footer>
  <div class="toast-area" aria-live="polite" aria-atomic="false" data-toasts></div>`;
}

/* ---------------------------------------------------------------- comportamento */

function atualizarContador(animar = false) {
  const n = carrinho.quantidade();
  document.querySelectorAll('[data-cart-count]').forEach((el) => (el.textContent = n));
  document.querySelectorAll('[data-cart-sr]').forEach((el) => (el.textContent = `, ${n} ${n === 1 ? 'item' : 'itens'}`));
  if (animar) {
    const link = document.querySelector('[data-cart-link]');
    if (link) {
      link.classList.remove('is-bumped');
      void link.offsetWidth;
      link.classList.add('is-bumped');
    }
  }
}

function relogio() {
  const el = document.querySelector('[data-relogio]');
  if (!el) return;
  const tick = () => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    el.textContent = `${hh}:${mm}`;
    el.setAttribute('datetime', d.toISOString());
  };
  tick();
  setInterval(tick, 20000);
}

function ligarMenuIniciar() {
  const menu = document.getElementById('menu-iniciar');
  const botoes = [...document.querySelectorAll('[data-start]')];
  if (!menu) return;

  const abrir = (botao) => {
    menu.hidden = false;
    botoes.forEach((b) => b.setAttribute('aria-expanded', 'true'));
    document.body.classList.add('start-open');
    menu.dataset.origem = botao === botoes[0] ? 'mobile' : 'taskbar';
    menu.querySelector('summary, a, button')?.focus();
  };
  const fechar = (devolverFoco = true) => {
    if (menu.hidden) return;
    menu.hidden = true;
    botoes.forEach((b) => b.setAttribute('aria-expanded', 'false'));
    document.body.classList.remove('start-open');
    if (devolverFoco) {
      const visivel = botoes.find((b) => b.offsetParent !== null);
      visivel?.focus();
    }
  };

  botoes.forEach((b) => b.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.hidden ? abrir(b) : fechar();
  }));
  document.addEventListener('click', (e) => {
    if (!menu.hidden && !menu.contains(e.target)) fechar(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fechar();
  });
  // só um submenu aberto por vez
  menu.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) menu.querySelectorAll('details').forEach((o) => o !== d && (o.open = false));
  }));
}

function ligarConta() {
  const raiz = document.querySelector('[data-conta]');
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-sair]')) {
      sessao.sair();
      avisar('Você saiu da sua conta.');
      return;
    }
    const btn = e.target.closest('[data-conta-btn]');
    const menu = document.getElementById('menu-conta');
    if (!menu) return;
    if (btn) {
      const abrir = menu.hidden;
      menu.hidden = !abrir;
      btn.setAttribute('aria-expanded', String(abrir));
    } else if (!menu.contains(e.target)) {
      menu.hidden = true;
      raiz.querySelector('[data-conta-btn]')?.setAttribute('aria-expanded', 'false');
    }
  });
  window.addEventListener('sessao:mudou', () => {
    raiz.innerHTML = htmlConta();
    const menu = document.getElementById('menu-iniciar');
    if (menu) {
      const novo = document.createElement('div');
      novo.innerHTML = htmlMenuIniciar();
      menu.querySelector('.start-menu__body').replaceWith(novo.querySelector('.start-menu__body'));
      atualizarContador();
    }
  });
}

/** Busca com sugestões (padrão combobox da WAI-ARIA). */
function ligarBusca() {
  const form = document.querySelector('[data-busca]');
  if (!form) return;
  const input = form.querySelector('input');
  const lista = form.querySelector('#busca-sugestoes');
  let ativos = [];
  let indice = -1;

  const fechar = () => {
    lista.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    indice = -1;
  };

  const marcar = (i) => {
    indice = i;
    [...lista.children].forEach((li, j) => li.setAttribute('aria-selected', String(j === i)));
    if (i >= 0 && lista.children[i]) input.setAttribute('aria-activedescendant', lista.children[i].id);
    else input.removeAttribute('aria-activedescendant');
  };

  const procurar = () => {
    const termo = input.value.trim();
    if (termo.length < 2) return fechar();
    ativos = buscarProdutos(termo).slice(0, 6);

    if (!ativos.length) {
      lista.innerHTML = `<li class="suggest__empty" role="option" aria-disabled="true" id="sug-vazio">nada encontrado para “${esc(input.value.trim())}”</li>`;
    } else {
      lista.innerHTML = ativos.map((p, i) => `
        <li role="option" id="sug-${i}" aria-selected="false" data-id="${p.id}">
          <span class="suggest__art">${arte(p)}</span>
          <span class="suggest__txt"><b>${esc(p.nome)}</b><small>${esc(p.marca)} · ${esc(p.sub)}</small></span>
          <span class="suggest__price">${formatBRL(p.preco)}</span>
        </li>`).join('') +
        `<li class="suggest__all" role="option" id="sug-todos" aria-selected="false" data-todos>ver todos os resultados →</li>`;
    }
    lista.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    indice = -1;
  };

  const escolher = (li) => {
    if (!li || li.getAttribute('aria-disabled')) return;
    if (li.dataset.id) location.href = `produto.html?id=${encodeURIComponent(li.dataset.id)}`;
    else form.submit();
  };

  let atraso;
  input.addEventListener('input', () => {
    clearTimeout(atraso);
    atraso = setTimeout(procurar, 120);
  });
  input.addEventListener('focus', () => input.value.trim().length >= 2 && procurar());
  input.addEventListener('keydown', (e) => {
    const n = lista.children.length;
    if (lista.hidden || !n) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); marcar((indice + 1) % n); }
    if (e.key === 'ArrowUp') { e.preventDefault(); marcar((indice - 1 + n) % n); }
    if (e.key === 'Enter' && indice >= 0) { e.preventDefault(); escolher(lista.children[indice]); }
    if (e.key === 'Escape') fechar();
  });
  lista.addEventListener('mousedown', (e) => {
    e.preventDefault(); // não tira o foco do campo antes do clique
    escolher(e.target.closest('li'));
  });
  document.addEventListener('click', (e) => !form.contains(e.target) && fechar());
}

/* ---------------------------------------------------------------- API */

export function montarLayout() {
  const pagina = document.body.dataset.page || '';
  const params = new URLSearchParams(location.search);
  const topo = document.getElementById('site-header');
  const base = document.getElementById('site-footer');
  if (topo) topo.innerHTML = cabecalho(pagina, pagina === 'loja' ? params.get('q') || '' : '', pagina === 'loja' ? params.get('cat') : '');
  if (base) base.innerHTML = rodape();
  atualizarContador();
  relogio();
  ligarMenuIniciar();
  ligarConta();
  ligarBusca();
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
