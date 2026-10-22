import { esc } from '../utils/texto.js';
import { icone } from '../utils/icones.js';

/*
 * Avisos no canto da tela (toasts).
 *   mostrarAviso('Produto adicionado.', { link: { href: 'carrinho.html', rotulo: 'Ver carrinho' } })
 *   mostrarAviso('Item removido.', { acao: { rotulo: 'Desfazer', executar: () => … } })
 * Ficam mais tempo na tela quando têm link ou ação, pra dar tempo de clicar.
 */

let area = null;

function garantirArea() {
  if (!area) {
    area = document.createElement('div');
    area.className = 'toast-area';
    area.setAttribute('role', 'status');
    area.setAttribute('aria-live', 'polite');
    document.body.append(area);
  }
  return area;
}

export function mostrarAviso(mensagem, { link, acao } = {}) {
  const el = document.createElement('div');
  el.className = 'win toast';
  el.innerHTML = `
    <div class="win__bar">
      <span class="win__title">Aviso</span>
      <button type="button" class="win__ctl win__close" aria-label="Fechar aviso">×</button>
    </div>
    <div class="win__body">
      ${icone('info')}
      <span class="toast__msg">${esc(mensagem)}</span>
      ${
        acao
          ? `<button type="button" class="win__btn toast__acao">${esc(acao.rotulo)}</button>`
          : link
            ? `<a class="toast__link" href="${esc(link.href)}">${esc(link.rotulo)}</a>`
            : ''
      }
    </div>`;

  const lista = garantirArea();
  lista.append(el);
  // no máximo 3 avisos ao mesmo tempo
  while (lista.children.length > 3) lista.firstElementChild.remove();

  const fechar = () => {
    if (el.classList.contains('is-leaving')) return;
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 250);
  };
  el.querySelector('.win__close').addEventListener('click', fechar);
  el.querySelector('.toast__acao')?.addEventListener('click', () => {
    acao.executar();
    fechar();
  });
  setTimeout(fechar, acao ? 6000 : link ? 4000 : 2600);
}

/* ---------- aviso para a próxima página ----------
   Útil quando a ação termina numa navegação (ex.: "Conectado!" depois do login):
   o aviso fica guardado e aparece assim que a próxima página abrir. */

const CHAVE_PENDENTE = 'pilula:aviso-pendente';

export function avisarNaProximaPagina(mensagem) {
  try {
    sessionStorage.setItem(CHAVE_PENDENTE, mensagem);
  } catch {
    /* sem storage: o aviso se perde, sem problema */
  }
}

export function mostrarAvisoPendente() {
  try {
    const msg = sessionStorage.getItem(CHAVE_PENDENTE);
    if (msg) {
      sessionStorage.removeItem(CHAVE_PENDENTE);
      mostrarAviso(msg);
    }
  } catch {
    /* ignora */
  }
}
