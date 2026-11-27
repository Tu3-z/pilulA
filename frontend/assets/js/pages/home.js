import { $, esc, formatBRL } from '../utils/texto.js';
import { arteHtml } from '../utils/arte.js';
import { icone } from '../utils/icones.js';
import * as catalogo from '../services/catalogo.js';
import { mostrarAviso } from '../components/avisos.js';
import { emailValido } from '../utils/validacao.js';
import { iniciarLayout } from '../components/layout.js';
import { cardHtml, ligarCards } from '../components/card.js';
import { iniciarCarrossel } from '../components/carrossel.js';

await iniciarLayout();

iniciarCarrossel($('.carrossel'));
desenharPrecoDestaque();
desenharCategorias();
desenharDestaques();
ligarBannerApp();
ligarPopupBula();
ligarReceita();
ligarChat();
ligarNewsletter();

/* ---------- banner do app mobile / QR code ---------- */
function ligarBannerApp() {
  const urlAtual = location.href.replace(/index\.html.*/, '');
  const urlCurta = location.host || 'pilula.app';
  
  const elUrl = $('#phone-mockup-url');
  if (elUrl) elUrl.textContent = urlCurta;

  // Botão Copiar Link
  $('#btn-copiar-link-app')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(urlAtual);
      mostrarAviso('Link copiado! Abra no celular ou envie no WhatsApp dos alunos.', 'ok');
    } catch {
      mostrarAviso(`Acesse no celular: ${urlAtual}`);
    }
  });

  // Botão Instruções PWA
  $('#btn-instrucoes-pwa')?.addEventListener('click', () => {
    const dialog = $('#modal-info');
    const titulo = $('#modal-info-titulo');
    const corpo = $('#modal-info-corpo');
    if (!dialog || !titulo || !corpo) return;

    titulo.textContent = 'Como instalar a pílula* no seu celular';
    corpo.innerHTML = `
      <div style="display:grid;gap:16px;text-align:left">
        <p>A pílula* é um <b>PWA (Progressive Web App)</b>: você pode usá-la no navegador ou colocá-la na tela inicial do celular como um aplicativo comum, sem precisar de loja.</p>
        <div style="background:var(--blue-tint);padding:14px;border-radius:var(--radius);border:var(--line)">
          <h4 style="margin:0 0 6px;color:var(--blue)">🍏 No iPhone (Safari)</h4>
          <ol style="margin:0;padding-left:20px;font-size:0.9rem;line-height:1.5">
            <li>Abra o site no navegador <b>Safari</b>.</li>
            <li>Toque no botão <b>Compartilhar</b> (ícone de quadrado com seta para cima).</li>
            <li>Role as opções e toque em <b>"Adicionar à Tela de Início"</b>.</li>
          </ol>
        </div>
        <div style="background:var(--blue-tint);padding:14px;border-radius:var(--radius);border:var(--line)">
          <h4 style="margin:0 0 6px;color:var(--blue)">🤖 No Android (Chrome)</h4>
          <ol style="margin:0;padding-left:20px;font-size:0.9rem;line-height:1.5">
            <li>Abra o site no navegador <b>Google Chrome</b>.</li>
            <li>Toque nos <b>três pontinhos</b> no canto superior direito.</li>
            <li>Toque em <b>"Instalar aplicativo"</b> ou <b>"Adicionar à tela inicial"</b>.</li>
          </ol>
        </div>
      </div>
    `;
    dialog.showModal();
  });
}

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

/* ---------- envio de receita médica ---------- */
function ligarReceita() {
  $('#receita-arquivo').addEventListener('change', (e) => {
    const arquivo = e.target.files?.[0];
    const status = $('#receita-status');
    if (!arquivo) {
      status.textContent = 'nenhum arquivo selecionado_';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      sessionStorage.setItem('receita_foto_temp', reader.result);
      const kb = Math.max(1, Math.round(arquivo.size / 1024));
      status.innerHTML = `${esc(arquivo.name)} (${kb} KB) ✓ salva! <a href="loja.html" style="color:var(--blue-glow);text-decoration:underline">Escolha seus medicamentos na loja →</a>`;
      mostrarAviso('Receita recebida e anexada para sua compra.');
    };
    reader.readAsDataURL(arquivo);
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
