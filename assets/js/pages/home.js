import { montarLayout, avisar } from '../components/layout.js';
import { cardProduto, ligarBotoesAdicionar } from '../components/card-produto.js';
import { CATEGORIAS, PRODUTOS, contarPorCategoria } from '../data/produtos.js';
import { $, $$, esc, icones } from '../lib/util.js';

montarLayout();

// ícones pixelados dos pop-ups
$$('[data-icone]').forEach((el) => (el.innerHTML = icones[el.dataset.icone] || ''));

// ---------- teclado do computador ----------
const teclas = $('[data-teclas]');
if (teclas) {
  let html = '';
  for (let i = 0; i < 45; i++) html += `<i${i % 15 === 0 || i % 15 === 14 ? ' class="k--dark"' : ''}></i>`;
  html += '<i class="k--dark"></i><i></i><i></i><i></i><i class="k--space"></i><i></i><i></i><i></i><i class="k--dark"></i>';
  teclas.innerHTML = html;
}

// ---------- disquetes de categoria ----------
const listaCat = $('[data-categorias]');
if (listaCat) {
  listaCat.innerHTML = CATEGORIAS.map((c) => {
    const n = contarPorCategoria(c.id);
    return `<li>
      <a class="floppy floppy--${c.tom}" href="loja.html?cat=${c.id}">
        <span class="floppy__shutter" aria-hidden="true"></span>
        <span class="floppy__label">
          <span class="floppy__file" aria-hidden="true">${c.arquivo}</span>
          <span class="floppy__name">${c.rotulo || c.nome}</span>
          <span class="floppy__count">${n} ${n === 1 ? 'item' : 'itens'}</span>
        </span>
        <span class="floppy__notch" aria-hidden="true"></span>
      </a>
    </li>`;
  }).join('');
}

// ---------- destaques ----------
const destaques = $('[data-destaques]');
if (destaques) {
  destaques.innerHTML = PRODUTOS.filter((p) => p.destaque).slice(0, 8).map(cardProduto).join('');
  ligarBotoesAdicionar(destaques);
}

// ---------- texto em onda ("faz sentido?") ----------
$$('[data-onda]').forEach((el) => {
  const texto = el.textContent;
  el.setAttribute('aria-label', texto);
  el.innerHTML = [...texto]
    .map((ch, i) => `<span aria-hidden="true" style="--y:${(-Math.sin(i / 2.2) * 12).toFixed(1)}px">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`)
    .join('');
});

// ---------- pop-ups interativos ----------
function popup(seletorBotao, seletorResposta, respostas) {
  const saida = $(seletorResposta);
  $$(seletorBotao).forEach((b) =>
    b.addEventListener('click', () => {
      const chave = b.dataset[Object.keys(b.dataset)[0]];
      $$(seletorBotao).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      if (saida) saida.innerHTML = respostas[chave];
    })
  );
}
popup('[data-agua]', '[data-agua-resposta]', {
  sim: 'boa! ✱ continua assim.',
  nao: 'vai lá, a gente espera :)',
});
popup('[data-bula]', '[data-bula-resposta]', {
  sim: 'orgulho. ✱ dúvida? chama no chat.',
  nao: 'a gente lê junto → <a href="#chat">abrir chat</a>',
});

// ---------- upload de receita ----------
const arquivo = $('#receita-arquivo');
const status = $('[data-receita-status]');
if (arquivo && status) {
  arquivo.addEventListener('change', () => {
    const f = arquivo.files && arquivo.files[0];
    if (!f) {
      status.textContent = 'nenhum arquivo selecionado_';
      return;
    }
    const kb = Math.max(1, Math.round(f.size / 1024));
    status.textContent = `${f.name} (${kb} KB) ✓ recebido! a gente te chama no chat.`;
    avisar('Receita recebida. Um farmacêutico vai conferir.');
  });
}

// ---------- chat (simulado) ----------
const log = $('[data-chat-log]');
const formChat = $('[data-chat-form]');
if (log && formChat) {
  formChat.addEventListener('submit', (e) => {
    e.preventDefault();
    const campo = formChat.elements.msg;
    const msg = campo.value.trim();
    if (!msg) return;
    log.insertAdjacentHTML('beforeend', `<p><b class="chat__who chat__who--voce">você diz:</b> ${esc(msg)}</p>`);
    campo.value = '';
    const digitando = document.createElement('p');
    digitando.className = 'chat__typing';
    digitando.textContent = 'farma_pilula está digitando...';
    log.appendChild(digitando);
    log.scrollTop = log.scrollHeight;
    setTimeout(() => {
      digitando.remove();
      log.insertAdjacentHTML(
        'beforeend',
        '<p><b class="chat__who chat__who--farma">farma_pilula diz:</b> anotado! já já um farmacêutico te responde por aqui. (isto é um protótipo :)</p>'
      );
      log.scrollTop = log.scrollHeight;
    }, 1400);
  });
}

// ---------- newsletter ----------
const news = $('[data-news]');
const ok = $('[data-news-ok]');
if (news && ok) {
  news.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!news.reportValidity()) return;
    news.hidden = true;
    ok.hidden = false;
  });
}
