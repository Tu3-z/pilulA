import { $, $$, menosMovimento } from '../core/texto.js';
import { caixa3dHtml } from '../components/caixa3d.js';
import { mostrarAviso } from '../core/avisos.js';

/**
 * Vídeo opcional do remédio girando (ex.: gerado no Higgsfield a partir da foto).
 * Coloque o arquivo em assets/video/ e troque null pelo caminho, ex.: 'assets/video/dipirona-3d.mp4'.
 * Sem vídeo, o slide usa a caixa 3D feita em CSS.
 */
const VIDEO_DOR = null;

const INTERVALO_MS = 7000;
const PASSO_MS = 100;

const ICONE_PAUSA =
  '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor"/></svg>';
const ICONE_PLAY =
  '<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z" fill="currentColor"/></svg>';

/**
 * Carrossel da home (padrão de carrossel da WAI-ARIA):
 * - troca sozinho a cada 7 s, mas pausa com o mouse em cima, com o foco dentro
 *   e quando a pessoa aperta o botão de pausa (e nem começa se ela pediu "reduzir movimento");
 * - setas, bolinhas, ← → do teclado e arrastar no celular;
 * - os slides escondidos ficam `inert`, então o Tab não cai em links invisíveis;
 * - nos "palcos", os enfeites se mexem com o mouse (parallax).
 */
export function iniciarCarrossel(raiz) {
  const slides = $$('.slide', raiz);
  const trilho = $('.carrossel__trilho', raiz);
  const dots = $('.carrossel__dots', raiz);
  const botaoPausa = $('[data-pausa]', raiz);

  let atual = 0;
  let decorrido = 0; // tempo que o slide atual já ficou na tela (só conta enquanto roda)
  let pausadoManual = menosMovimento();
  let mouseDentro = false;
  let focoDentro = false;
  const rodando = () => !pausadoManual && !mouseDentro && !focoDentro;

  // ---------- remédio: caixa 3D ou vídeo ----------
  const palcoRemedio = $('#palco-remedio', raiz);
  if (palcoRemedio) {
    palcoRemedio.innerHTML = VIDEO_DOR
      ? `<video class="palco__video" src="${VIDEO_DOR}" autoplay muted loop playsinline poster="assets/img/produtos/dipirona-gotas-medley.webp"></video>`
      : caixa3dHtml({
          frente: 'assets/img/produtos/dipirona-gotas-medley.webp',
          lado: 'assets/img/produtos/dipirona-gotas-medley-lado.webp',
          topo: '#3cbfae',
          base: '#e7e7ea',
          proporcao: 0.545,
          profundidade: 0.62,
        });
    if (VIDEO_DOR) palcoRemedio.nextElementSibling?.remove(); // sem sombra embaixo do vídeo
  }

  // ---------- bolinhas ----------
  dots.innerHTML = slides
    .map(
      (s, i) =>
        `<button type="button" class="carrossel__dot" data-ir="${i}" aria-label="Slide ${i + 1}: ${s.dataset.rotulo}"></button>`,
    )
    .join('');

  function desenhar() {
    slides.forEach((s, i) => {
      const ativo = i === atual;
      s.classList.toggle('is-ativo', ativo);
      s.toggleAttribute('inert', !ativo);
      s.setAttribute('aria-label', `${i + 1} de ${slides.length}: ${s.dataset.rotulo}`);
    });
    $$('.carrossel__dot', dots).forEach((d, i) => {
      if (i === atual) {
        d.setAttribute('aria-current', 'true');
        // a barrinha é recriada a cada troca para a animação começar do zero
        d.innerHTML = `<span class="carrossel__fill" style="animation-duration: ${INTERVALO_MS}ms"></span>`;
      } else {
        d.removeAttribute('aria-current');
        d.innerHTML = '';
      }
    });
    desenharPausa();
  }

  function desenharPausa() {
    botaoPausa.innerHTML = pausadoManual ? ICONE_PLAY : ICONE_PAUSA;
    botaoPausa.setAttribute(
      'aria-label',
      pausadoManual ? 'Retomar troca automática' : 'Pausar troca automática',
    );
    $('.carrossel__fill', dots)?.classList.toggle('is-pausado', !rodando());
    trilho.setAttribute('aria-live', rodando() ? 'off' : 'polite');
  }

  function ir(i, daPessoa = true) {
    atual = (i + slides.length) % slides.length;
    decorrido = 0;
    if (daPessoa) $$('.palco', raiz).forEach(resetarParallax);
    desenhar();
  }

  setInterval(() => {
    if (!rodando() || document.hidden) return;
    decorrido += PASSO_MS;
    if (decorrido >= INTERVALO_MS) ir(atual + 1, false);
  }, PASSO_MS);

  // ---------- controles ----------
  $('[data-anterior]', raiz).addEventListener('click', () => ir(atual - 1));
  $('[data-proximo]', raiz).addEventListener('click', () => ir(atual + 1));
  dots.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ir]');
    if (b) ir(Number(b.dataset.ir));
  });
  botaoPausa.addEventListener('click', () => {
    pausadoManual = !pausadoManual;
    desenharPausa();
  });

  raiz.addEventListener('mouseenter', () => {
    mouseDentro = true;
    desenharPausa();
  });
  raiz.addEventListener('mouseleave', () => {
    mouseDentro = false;
    desenharPausa();
  });
  raiz.addEventListener('focusin', () => {
    focoDentro = true;
    desenharPausa();
  });
  raiz.addEventListener('focusout', (e) => {
    if (!raiz.contains(e.relatedTarget)) {
      focoDentro = false;
      desenharPausa();
    }
  });
  raiz.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') ir(atual + 1);
    else if (e.key === 'ArrowLeft') ir(atual - 1);
  });

  // ---------- arrastar no celular ----------
  let toqueX = null;
  trilho.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse') toqueX = e.clientX;
  });
  trilho.addEventListener('pointerup', (e) => {
    if (toqueX === null) return;
    const dx = e.clientX - toqueX;
    toqueX = null;
    if (Math.abs(dx) > 50) ir(atual + (dx < 0 ? 1 : -1));
  });

  // ---------- parallax (mouse) ----------
  $$('.palco', raiz).forEach((palco) => {
    palco.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = palco.getBoundingClientRect();
      const limitar = (v) => Math.max(-1, Math.min(1, v));
      // -1…1 na horizontal e na vertical, a partir do centro do palco
      palco.style.setProperty('--mx', limitar(((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      palco.style.setProperty('--my', limitar(((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      palco.classList.add('is-mouse');
    });
    palco.addEventListener('pointerleave', () => resetarParallax(palco));
  });

  // ---------- cupom ----------
  $('#copiar-cupom', raiz)?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('PILULA10');
      mostrarAviso('Cupom PILULA10 copiado. É só colar no carrinho.');
    } catch {
      mostrarAviso('Use o cupom PILULA10 no carrinho.');
    }
  });

  desenhar();
}

function resetarParallax(palco) {
  palco.style.setProperty('--mx', '0');
  palco.style.setProperty('--my', '0');
  palco.classList.remove('is-mouse');
}
