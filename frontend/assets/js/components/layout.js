import { $, esc, formatBRL, param } from '../utils/texto.js';
import { icone } from '../utils/icones.js';
import { arteHtml, arteSvg } from '../utils/arte.js';
import * as catalogo from '../services/catalogo.js';
import * as carrinho from '../services/carrinho.js';
import * as sessao from '../services/sessao.js';
import { mostrarAviso, mostrarAvisoPendente } from './avisos.js';

/* ==========================================================================
   Layout comum a todas as páginas: faixa de benefícios, cabeçalho
   (logo, busca com sugestões, conta, carrinho), navbar com categorias,
   menu "Categorias" e rodapé.

   Cada página HTML tem dois marcadores:
     <div id="topo"></div>    → vira o cabeçalho
     <div id="rodape"></div>  → vira o rodapé
   e chama `await iniciarLayout()` no seu script.
   ========================================================================== */

const BENEFICIOS = [
  'Frete grátis acima de R$ 99',
  'Entrega em até 2h na Grande SP',
  'Farmacêutico online 24h',
  'Até 3x sem juros no cartão',
  'Cupom PILULA10 na 1ª compra',
];

const naLoja = () => document.body.dataset.pagina === 'loja';
const urlLoja = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return `loja.html${q ? `?${q}` : ''}`;
};

/**
 * Monta o layout e carrega o catálogo. Toda página chama isso primeiro.
 * Se o catálogo não carregar (ex.: arquivo aberto direto, sem servidor), mostra um aviso e para.
 */
export async function iniciarLayout() {
  try {
    await catalogo.carregarCatalogo();
  } catch (erro) {
    console.error(erro);
    mostrarErroDeCarga();
    throw erro;
  }
  montarCabecalho();
  montarRodape();
  preencherIcones();
  trocarFotoQuebradaPorIlustracao();
  mostrarAvisoPendente();
}

/** <span data-icone="seta"></span> recebe o SVG do ícone. */
export function preencherIcones(raiz = document) {
  raiz.querySelectorAll('[data-icone]:empty').forEach((el) => {
    el.innerHTML = icone(el.dataset.icone);
    el.setAttribute('aria-hidden', 'true');
  });
}

/* ---------------------------------------------------------------- cabeçalho */

let menuAberto = false;
let contaAberta = false;
let catExpandida = null;
let indice = -1;

function montarCabecalho() {
  const cats = catalogo.todasCategorias();
  const catAtual = naLoja() ? param('cat') : '';
  const html = `
    <div class="topbar" role="region" aria-label="Benefícios da loja">
      <ul class="topbar__list container">
        ${BENEFICIOS.map((b, i) => `<li${i >= 2 ? ' class="topbar__extra"' : ''}>${esc(b)}</li>`).join('')}
      </ul>
    </div>

    <div class="site-header">
      <header class="header container">
        <button type="button" class="hdr-menu" data-start aria-controls="menu-iniciar" aria-label="Abrir menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>

        <a class="logo" href="index.html" aria-label="pílula*, página inicial">
          <span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span><span class="logo__star" aria-hidden="true">*</span>
        </a>

        <form class="search" role="search" action="loja.html">
          <label class="sr-only" for="busca-topo">Buscar na farmácia</label>
          <input id="busca-topo" name="q" type="search" placeholder="buscar remédio, marca, sintoma…"
            autocomplete="off" role="combobox" aria-autocomplete="list"
            aria-controls="busca-sugestoes" aria-expanded="false" value="${esc(naLoja() ? param('q') : '')}">
          <button type="submit" aria-label="Buscar">${icone('busca')}</button>
          <ul class="win suggest" id="busca-sugestoes" role="listbox" aria-label="Sugestões" hidden></ul>
        </form>

        <div class="header__actions">
          <div class="account" id="conta"></div>
          <a class="cart-link" href="carrinho.html">
            ${icone('sacola')}<span class="cart-link__txt">Carrinho</span>
            <span class="cart-link__count" id="carrinho-qtd">0</span>
            <span class="sr-only" id="carrinho-qtd-sr"></span>
          </a>
        </div>
      </header>

      <nav class="taskbar" aria-label="Categorias">
        <div class="container taskbar__inner">
          <button type="button" class="start-btn" data-start aria-controls="menu-iniciar" aria-expanded="false">
            <span class="start-btn__icon" aria-hidden="true"><span></span><span></span><span></span></span><span>Categorias</span>
          </button>
          <ul class="tb-links">
            ${cats
              .map(
                (c) => `
              <li class="tb-item">
                <a class="tb-link" href="${urlLoja({ cat: c.id })}"${catAtual === c.id ? ' aria-current="true"' : ''}>${esc(c.nome)}</a>
                <div class="win flyout" role="group" aria-label="${esc(c.nome)}">
                  <ul>
                    ${c.subs.map((s) => `<li><a href="${urlLoja({ cat: c.id, sub: s.id })}">${esc(s.nome)}</a></li>`).join('')}
                    <li class="flyout__all"><a href="${urlLoja({ cat: c.id })}">Ver tudo em ${esc(c.nome)} →</a></li>
                  </ul>
                </div>
              </li>`,
              )
              .join('')}
            <li class="tb-item"><a class="tb-link tb-link--hot" href="${urlLoja({ oferta: 1 })}">Ofertas</a></li>
          </ul>
          <div class="tray">
            <a class="tray__pharm" href="index.html#chat"><span class="tray__dot" aria-hidden="true"></span><span class="tray__label">farmacêutico online</span></a>
            <span class="tray__clock" id="relogio" aria-label="Hora atual"></span>
          </div>
        </div>
      </nav>

      <div class="start-menu win" id="menu-iniciar" hidden></div>
    </div>`;

  // o .site-header precisa ser filho direto do <body> para o position: sticky funcionar
  const marcador = $('#topo');
  marcador.insertAdjacentHTML('beforebegin', html);
  marcador.remove();

  ligarMenu();
  ligarBusca();
  ligarRelogio();
  desenharConta();
  desenharContador(false);
  sessao.aoMudar(() => {
    desenharConta();
    if (menuAberto) desenharMenu();
  });
  carrinho.aoMudar(() => {
    desenharContador(true);
    if (menuAberto) desenharMenu();
  });

  document.addEventListener('click', (e) => {
    // (um elemento que acabou de ser redesenhado já saiu da página: ignora)
    if (!e.target.isConnected) return;
    if (!e.target.closest('#menu-iniciar, [data-start]')) fecharMenu(false);
    if (!e.target.closest('.account')) fecharConta();
    if (!e.target.closest('.search')) fecharSugestoes();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    fecharConta();
    fecharSugestoes();
    fecharMenu(true);
  });
}

/* ---------- relógio da bandeja ---------- */
function ligarRelogio() {
  const el = $('#relogio');
  const agora = () => {
    const d = new Date();
    el.textContent = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };
  agora();
  setInterval(agora, 20_000);
}

/* ---------- conta ---------- */
function desenharConta() {
  const el = $('#conta');
  const u = sessao.usuario();
  if (!u) {
    el.innerHTML = `<a class="hdr-btn" href="entrar.html">${icone('usuario')}<span>Entrar</span></a>`;
    return;
  }
  el.innerHTML = `
    <button type="button" class="hdr-btn" aria-controls="menu-conta" aria-expanded="false">
      ${icone('usuario')}<span>Olá, ${esc(sessao.primeiroNome())}</span>
      <svg class="caret" width="10" height="8" viewBox="0 0 10 8" aria-hidden="true"><path d="M1 1l4 5 4-5z" fill="currentColor"/></svg>
    </button>
    <div class="win dropdown" id="menu-conta" hidden>
      <p class="dropdown__who">${esc(u.email)}</p>
      <a href="carrinho.html">Meu carrinho</a>
      <a href="index.html#receita">Enviar receita</a>
      <button type="button" data-sair>Sair</button>
    </div>`;
  const botao = el.querySelector('.hdr-btn');
  botao.addEventListener('click', () => {
    contaAberta = !contaAberta;
    botao.setAttribute('aria-expanded', String(contaAberta));
    $('#menu-conta').hidden = !contaAberta;
    fecharMenu(false);
  });
  el.querySelector('[data-sair]').addEventListener('click', sair);
}

function fecharConta() {
  contaAberta = false;
  const menu = $('#menu-conta');
  if (menu) {
    menu.hidden = true;
    $('#conta .hdr-btn').setAttribute('aria-expanded', 'false');
  }
}

function sair() {
  sessao.sair();
  fecharConta();
  fecharMenu(false);
  mostrarAviso('Você saiu da sua conta.');
}

/* ---------- contador do carrinho ---------- */
function desenharContador(animar) {
  const n = carrinho.quantidade();
  const el = $('#carrinho-qtd');
  const anterior = Number(el.textContent);
  el.textContent = n;
  $('#carrinho-qtd-sr').textContent = `, ${n} ${n === 1 ? 'item' : 'itens'}`;
  if (animar && n > anterior) {
    const link = el.closest('.cart-link');
    link.classList.remove('is-bumped');
    requestAnimationFrame(() => link.classList.add('is-bumped'));
  }
}

/* ---------- menu "Categorias" ---------- */
function ligarMenu() {
  document.querySelectorAll('[data-start]').forEach((b) =>
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      menuAberto ? fecharMenu(false) : abrirMenu();
    }),
  );
  $('#menu-iniciar').addEventListener('click', (e) => {
    const toggle = e.target.closest('.sm-toggle');
    if (toggle) {
      catExpandida = catExpandida === toggle.dataset.cat ? null : toggle.dataset.cat;
      desenharMenu();
      $(`#menu-iniciar .sm-toggle[data-cat="${toggle.dataset.cat}"]`)?.focus();
    }
    if (e.target.closest('[data-sair]')) sair();
  });
}

function abrirMenu() {
  menuAberto = true;
  fecharConta();
  desenharMenu();
  $('#menu-iniciar').hidden = false;
  document.querySelectorAll('[data-start]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  document.body.classList.add('start-open'); // escurece a página no celular
  requestAnimationFrame(() => $('#menu-iniciar .sm-link, #menu-iniciar .sm-toggle')?.focus());
}

function fecharMenu(devolverFoco) {
  if (!menuAberto) return;
  menuAberto = false;
  $('#menu-iniciar').hidden = true;
  document
    .querySelectorAll('[data-start]')
    .forEach((b) => b.setAttribute('aria-expanded', 'false'));
  document.body.classList.remove('start-open');
  if (devolverFoco)
    [...document.querySelectorAll('[data-start]')].find((b) => b.offsetParent !== null)?.focus();
}

function desenharMenu() {
  const qtd = carrinho.quantidade();
  $('#menu-iniciar').innerHTML = `
    <nav class="start-menu__body" aria-label="Menu principal">
      <ul>
        <li class="sm-only-mobile"><a class="sm-link" href="index.html">${icone('casa')}<span>Início</span></a></li>
        <li><a class="sm-link" href="loja.html">${icone('pasta')}<span>Toda a loja</span></a></li>
        <li class="sm-sep" role="separator"></li>
        ${catalogo
          .todasCategorias()
          .map(
            (c) => `
          <li class="sm-item">
            <button type="button" class="sm-toggle" data-cat="${esc(c.id)}" aria-expanded="${catExpandida === c.id}">
              ${icone('pasta')}<span>${esc(c.nome)}</span>
              <svg class="caret" width="8" height="10" viewBox="0 0 8 10" aria-hidden="true"><path d="M1 1l5 4-5 4z" fill="currentColor"/></svg>
            </button>
            ${
              catExpandida === c.id
                ? `<ul class="sm-sub">
                    ${c.subs.map((s) => `<li><a href="${urlLoja({ cat: c.id, sub: s.id })}">${esc(s.nome)}</a></li>`).join('')}
                    <li><a href="${urlLoja({ cat: c.id })}"><b>Ver tudo</b></a></li>
                  </ul>`
                : ''
            }
          </li>`,
          )
          .join('')}
        <li class="sm-sep" role="separator"></li>
        <li><a class="sm-link" href="${urlLoja({ oferta: 1 })}">${icone('estrela')}<span>Ofertas</span></a></li>
        <li><a class="sm-link" href="index.html#receita">${icone('receita')}<span>Enviar receita</span></a></li>
        <li><a class="sm-link" href="index.html#chat">${icone('chat')}<span>Farmacêutico 24h</span></a></li>
        <li class="sm-sep" role="separator"></li>
        <li><a class="sm-link" href="carrinho.html">${icone('sacola')}<span>Carrinho (${qtd})</span></a></li>
        <li>
          ${
            sessao.logado()
              ? `<button type="button" class="sm-link" data-sair>${icone('desligar')}<span>Sair (${esc(sessao.primeiroNome())})…</span></button>`
              : `<a class="sm-link" href="entrar.html">${icone('desligar')}<span>Entrar / criar conta…</span></a>`
          }
        </li>
      </ul>
    </nav>`;
}

/* ---------- busca com sugestões (padrão combobox da WAI-ARIA) ---------- */
function ligarBusca() {
  const form = $('.search');
  const input = $('#busca-topo');
  const lista = $('#busca-sugestoes');

  const sugestoes = () =>
    input.value.trim().length >= 2 ? catalogo.buscar(input.value).slice(0, 6) : [];

  const desenhar = () => {
    const termo = input.value.trim();
    if (termo.length < 2) return fecharSugestoes();
    const itens = sugestoes();
    lista.innerHTML = itens.length
      ? itens
          .map(
            (p, i) => `
          <li role="option" id="sug-${i}" data-id="${esc(p.id)}" aria-selected="${indice === i}">
            ${arteHtml(p, 'suggest__art')}
            <span class="suggest__txt"><b>${esc(p.nome)}</b><small>${esc(p.marca)} · ${esc(p.sub)}</small></span>
            <span class="suggest__price">${formatBRL(p.preco)}</span>
          </li>`,
          )
          .join('') +
        `<li class="suggest__all" role="option" id="sug-${itens.length}" data-todos aria-selected="${indice === itens.length}">ver todos os resultados →</li>`
      : `<li class="suggest__empty" role="option" aria-disabled="true">nada encontrado para “${esc(termo)}”</li>`;
    lista.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    if (indice >= 0) input.setAttribute('aria-activedescendant', `sug-${indice}`);
    else input.removeAttribute('aria-activedescendant');
  };

  const buscar = () => {
    const q = input.value.trim();
    fecharSugestoes();
    if (naLoja()) window.dispatchEvent(new CustomEvent('pl:buscar', { detail: q }));
    else location.href = urlLoja(q ? { q } : {});
  };

  input.addEventListener('input', () => {
    indice = -1;
    desenhar();
  });
  input.addEventListener('focus', desenhar);
  input.addEventListener('keydown', (e) => {
    const n = sugestoes().length ? sugestoes().length + 1 : 0;
    if (lista.hidden || !n) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      indice = e.key === 'ArrowDown' ? (indice + 1) % n : (indice - 1 + n) % n;
      desenhar();
    } else if (e.key === 'Enter' && indice >= 0) {
      e.preventDefault();
      const p = sugestoes()[indice];
      p ? (location.href = `produto.html?id=${encodeURIComponent(p.id)}`) : buscar();
    }
  });
  // mousedown (e não click) para não perder o foco do campo antes de abrir
  lista.addEventListener('mousedown', (e) => {
    const li = e.target.closest('li[data-id], li[data-todos]');
    if (!li) return;
    e.preventDefault();
    if (li.dataset.id) location.href = `produto.html?id=${encodeURIComponent(li.dataset.id)}`;
    else buscar();
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    buscar();
  });
}

function fecharSugestoes() {
  const lista = $('#busca-sugestoes');
  if (!lista) return;
  lista.hidden = true;
  indice = -1;
  $('#busca-topo').setAttribute('aria-expanded', 'false');
  $('#busca-topo').removeAttribute('aria-activedescendant');
}

/** A loja chama isso para manter o campo de busca do topo igual ao filtro atual. */
export function definirTermoBusca(q) {
  const input = $('#busca-topo');
  if (input && document.activeElement !== input) input.value = q;
}

/* ---------------------------------------------------------------- rodapé */

function montarRodape() {
  const html = `
    <footer class="footer">
      <div class="container footer__grid">
        <div>
          <a class="logo" href="index.html" aria-label="pílula*, página inicial">
            <span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span><span class="logo__star" aria-hidden="true">*</span>
          </a>
          <p class="footer__tag">cuide de você primeiro.</p>
        </div>
        <nav aria-labelledby="f-loja">
          <h2 id="f-loja">Loja</h2>
          <ul>
            ${catalogo
              .todasCategorias()
              .map((c) => `<li><a href="${urlLoja({ cat: c.id })}">${esc(c.nome)}</a></li>`)
              .join('')}
          </ul>
        </nav>
        <nav aria-labelledby="f-ajuda">
          <h2 id="f-ajuda">Ajuda</h2>
          <ul>
            <li><a href="index.html#chat">Fale com o farmacêutico</a></li>
            <li><a href="index.html#receita">Como enviar a receita</a></li>
            <li><a href="entrar.html">Minha conta</a></li>
            <li><a href="#">Trocas e devoluções</a></li>
            <li><a href="#">Política de privacidade</a></li>
          </ul>
        </nav>
        <div>
          <h2>Pagamento</h2>
          <ul class="footer__pay">
            <li class="badge">Pix</li><li class="badge">Visa</li><li class="badge">Mastercard</li>
            <li class="badge">Elo</li><li class="badge">Na entrega</li>
          </ul>
          <h2 class="footer__h2-gap">Redes</h2>
          <ul class="footer__social">
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
    </footer>`;
  const marcador = $('#rodape');
  marcador.insertAdjacentHTML('beforebegin', html);
  marcador.remove();
}

/* ---------------------------------------------------------------- utilidades */

/** Se uma foto de produto não carregar, troca pela ilustração em SVG. */
function trocarFotoQuebradaPorIlustracao() {
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement) || !img.classList.contains('art__foto')) return;
      const p = catalogo.produto(img.dataset.produto);
      if (!p) return;
      const span = document.createElement('span');
      span.className = 'art__svg';
      span.innerHTML = arteSvg(p);
      img.replaceWith(span);
    },
    true, // o evento de erro de imagem não "borbulha": precisa da fase de captura
  );
}

/** Quando o catálogo não carrega (quase sempre: arquivo aberto sem servidor). */
function mostrarErroDeCarga() {
  const local = location.protocol === 'file:';
  const main = $('#conteudo') ?? document.body;
  main.innerHTML = `
    <div class="container" style="padding-block: 64px">
      <div class="win" style="max-width: 560px">
        <div class="win__bar"><span class="win__title">Não deu pra carregar a loja</span></div>
        <div class="win__body">
          ${
            local
              ? `<p>Você abriu o arquivo direto no navegador. O site precisa de um servidor local para carregar os produtos.</p>
                 <p style="margin-top: 12px">Dê dois cliques no <b>iniciar.bat</b> (ou use o <b>Live Server</b> do VS Code) e abra <b>http://localhost:5500</b>.</p>`
              : `<p>O catálogo de produtos não respondeu. Confira se o arquivo <code>${esc(catalogo.URL_CATALOGO)}</code> existe e recarregue a página.</p>`
          }
        </div>
      </div>
    </div>`;
}
