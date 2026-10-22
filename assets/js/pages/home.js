import { $, esc, formatBRL } from '../core/texto.js';
import { arteHtml } from '../core/arte.js';
import { icone } from '../core/icones.js';
import * as catalogo from '../core/catalogo.js';
import { mostrarAviso } from '../core/avisos.js';
import { emailValido } from '../core/validacao.js';
import { iniciarLayout } from '../components/layout.js';
import { cardHtml, ligarCards } from '../components/card.js';
import { iniciarCarrossel } from './carrossel.js';

await iniciarLayout();

iniciarCarrossel($('.carrossel'));
desenharPrecoDestaque();
desenharCategorias();
desenharDestaques();
ligarPopupBula();
ligarReceita();
ligarChat();
ligarNewsletter();

/* ---------- preço do remédio do carrossel (vem do catálogo) ---------- */
function desenharPrecoDestaque() {
  const p = catalogo.produto('dipirona-gotas-medley');
  const el = $('#preco-destaque');
  if (!p) return el.remove();
  el.innerHTML = `
    ${p.precoAntigo ? `<s><span class="sr-only">de </span>${formatBRL(p.precoAntigo)}</s>` : ''}
    <b><span class="sr-only">por </span>${formatBRL(p.preco)}</b>
    <span class="slide__preco-nome">${esc(p.marca)} · ${esc(p.sub)}</span>`;
}

/* ---------- categorias: um produto de cada (prefere os que têm foto) ---------- */
function desenharCategorias() {
  const amostras = {};
  for (const p of catalogo.todosProdutos()) {
    const atual = amostras[p.categoria];
    if (!atual || (!atual.foto && p.foto)) amostras[p.categoria] = p;
  }
  $('#lista-categorias').innerHTML = catalogo
    .todasCategorias()
    .map(
      (c) => `
      <li>
        <a class="cat" href="loja.html?cat=${encodeURIComponent(c.id)}">
          <span class="cat__txt">
            <span class="cat__nome">${esc(c.nome)}</span>
            <span class="cat__count">${catalogo.contar(c.id)} produtos</span>
          </span>
          ${amostras[c.id] ? arteHtml(amostras[c.id], 'cat__arte') : ''}
          <span class="cat__seta">${icone('seta')}</span>
        </a>
      </li>`,
    )
    .join('');
}

function desenharDestaques() {
  $('#lista-destaques').innerHTML = catalogo.destaques().map(cardHtml).join('');
  ligarCards();
}

/* ---------- pop-up "leu a bula?" ---------- */
function ligarPopupBula() {
  const respostas = {
    sim: 'orgulho. ✱ dúvida? chama no chat.',
    nao: 'a gente lê junto → <a href="#chat">abrir chat</a>',
  };
  document.querySelectorAll('[data-bula]').forEach((b) =>
    b.addEventListener('click', () => {
      document
        .querySelectorAll('[data-bula]')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      $('#bula-resposta').innerHTML = respostas[b.dataset.bula];
    }),
  );
}

/* ---------- envio de receita (simulado) ---------- */
function ligarReceita() {
  $('#receita-arquivo').addEventListener('change', (e) => {
    const arquivo = e.target.files?.[0];
    const status = $('#receita-status');
    if (!arquivo) {
      status.textContent = 'nenhum arquivo selecionado_';
      return;
    }
    const kb = Math.max(1, Math.round(arquivo.size / 1024));
    status.textContent = `${arquivo.name} (${kb} KB) ✓ recebido! a gente te chama no chat.`;
    mostrarAviso('Receita recebida. Um farmacêutico vai conferir.');
  });
}

/* ---------- chat (simulado) ---------- */
function ligarChat() {
  const log = $('#chat-log');
  const campo = $('#chat-msg');
  const linha = (quem, texto) => {
    const p = document.createElement('p');
    p.innerHTML = `<b class="chat__who${quem === 'farma' ? ' chat__who--farma' : ''}">${quem === 'farma' ? 'farma_pilula diz:' : 'você diz:'}</b> ${esc(texto)}`;
    log.append(p);
    log.scrollTop = log.scrollHeight;
    return p;
  };
  $('#chat-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = campo.value.trim();
    if (!texto) return;
    linha('voce', texto);
    campo.value = '';
    const digitando = document.createElement('p');
    digitando.className = 'chat__typing';
    digitando.textContent = 'farma_pilula está digitando...';
    log.append(digitando);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      digitando.remove();
      linha(
        'farma',
        'anotado! já já um farmacêutico te responde por aqui. (isto é um protótipo :)',
      );
    }, 1400);
  });
}

/* ---------- newsletter ---------- */
function ligarNewsletter() {
  const form = $('#news-form');
  const campo = $('#news-email');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!emailValido(campo.value)) {
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }
    form.hidden = true;
    $('#news-ok').hidden = false;
  });
  campo.addEventListener('input', () => campo.removeAttribute('aria-invalid'));
}
