import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { Caixa3d } from '../../../shared/components/caixa-3d/caixa-3d';

/**
 * Vídeo opcional do remédio girando (ex.: gerado no Higgsfield a partir da foto).
 * Coloque o arquivo em public/video/ e troque null pelo caminho, ex.: 'video/dipirona-3d.mp4'.
 * Sem vídeo, o slide usa a caixa 3D feita em CSS.
 */
const VIDEO_DOR: string | null = null;

const INTERVALO_MS = 7000;

interface Slide {
  id: 'dor' | 'cupom' | 'chat';
  rotulo: string;
}

/**
 * Carrossel da home (padrão de carrossel da WAI-ARIA):
 * - troca sozinho a cada 7 s, mas pausa com o mouse em cima, com o foco dentro
 *   e quando a pessoa aperta o botão de pausa (e nem começa se ela pediu "reduzir movimento");
 * - setas, bolinhas, ← → do teclado e arrastar no celular;
 * - os slides escondidos ficam `inert`, então o Tab não cai em links invisíveis;
 * - no slide do remédio, a caixa 3D e os enfeites se mexem com o mouse (parallax).
 */
@Component({
  selector: 'pl-carrossel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, Caixa3d],
  templateUrl: './carrossel.html',
  styleUrl: './carrossel.css',
  host: {
    '(mouseenter)': 'mouseDentro.set(true)',
    '(mouseleave)': 'mouseDentro.set(false)',
    '(focusin)': 'focoDentro.set(true)',
    '(focusout)': 'saiuFoco($event)',
    '(keydown)': 'tecla($event)',
  },
})
export class Carrossel {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly catalogo = inject(CatalogoService);
  private readonly avisos = inject(AvisoService);

  protected readonly video = VIDEO_DOR;
  protected readonly dipirona = computed(() => this.catalogo.produto('dipirona-gotas-medley'));

  protected readonly slides: Slide[] = [
    { id: 'dor', rotulo: 'Matadores de dores' },
    { id: 'cupom', rotulo: 'Cupom de 10% na primeira compra' },
    { id: 'chat', rotulo: 'Farmacêutico online 24h' },
  ];

  protected readonly atual = signal(0);
  /** pausa escolhida pela pessoa (botão) */
  protected readonly pausadoManual = signal(
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  protected readonly mouseDentro = signal(false);
  protected readonly focoDentro = signal(false);
  protected readonly rodando = computed(
    () => !this.pausadoManual() && !this.mouseDentro() && !this.focoDentro(),
  );

  protected readonly intervalo = INTERVALO_MS;
  /** tempo que o slide atual já ficou na tela (só conta enquanto está rodando) */
  private decorrido = 0;
  private toqueX: number | null = null;

  constructor() {
    const passo = 100;
    const timer = setInterval(() => {
      if (!this.rodando() || document.hidden) return;
      this.decorrido += passo;
      if (this.decorrido >= INTERVALO_MS) this.ir(this.atual() + 1, false);
    }, passo);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected ir(i: number, daPessoa = true): void {
    const n = this.slides.length;
    this.atual.set((i + n) % n);
    this.decorrido = 0;
    if (daPessoa) this.resetarParallax();
  }

  protected alternarPausa(): void {
    this.pausadoManual.update((v) => !v);
  }

  protected saiuFoco(e: FocusEvent): void {
    if (!this.host.nativeElement.contains(e.relatedTarget as Node)) this.focoDentro.set(false);
  }

  protected tecla(e: KeyboardEvent): void {
    if ((e.target as HTMLElement).closest('input, textarea, select')) return;
    if (e.key === 'ArrowRight') this.ir(this.atual() + 1);
    else if (e.key === 'ArrowLeft') this.ir(this.atual() - 1);
  }

  // ---------- arrastar no celular ----------
  protected toqueInicio(e: PointerEvent): void {
    if (e.pointerType !== 'mouse') this.toqueX = e.clientX;
  }
  protected toqueFim(e: PointerEvent): void {
    if (this.toqueX === null) return;
    const dx = e.clientX - this.toqueX;
    this.toqueX = null;
    if (Math.abs(dx) > 50) this.ir(this.atual() + (dx < 0 ? 1 : -1));
  }

  // ---------- parallax (mouse) ----------
  /** -1…1 na horizontal e na vertical, a partir do centro do palco */
  protected mover(e: PointerEvent, palco: HTMLElement): void {
    if (e.pointerType !== 'mouse') return;
    const r = palco.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const my = ((e.clientY - r.top) / r.height) * 2 - 1;
    palco.style.setProperty('--mx', clamp(mx).toFixed(3));
    palco.style.setProperty('--my', clamp(my).toFixed(3));
    palco.classList.add('is-mouse');
  }

  protected resetarParallax(palco?: HTMLElement): void {
    const alvos = palco ? [palco] : this.host.nativeElement.querySelectorAll<HTMLElement>('.palco');
    alvos.forEach((p) => {
      p.style.setProperty('--mx', '0');
      p.style.setProperty('--my', '0');
      p.classList.remove('is-mouse');
    });
  }

  // ---------- cupom ----------
  protected async copiarCupom(): Promise<void> {
    try {
      await navigator.clipboard.writeText('PILULA10');
      this.avisos.mostrar('Cupom PILULA10 copiado. É só colar no carrinho.');
    } catch {
      this.avisos.mostrar('Use o cupom PILULA10 no carrinho.');
    }
  }
}

const clamp = (v: number) => Math.max(-1, Math.min(1, v));
