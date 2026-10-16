import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { CurrencyPipe, DOCUMENT } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { SessaoService } from '../../../core/services/sessao.service';
import { AvisoService } from '../../../core/services/aviso.service';
import { Produto } from '../../../core/models/catalogo';
import { Icone } from '../icone/icone';
import { Arte } from '../arte/arte';

/**
 * Cabeçalho fixo: letreiro, logo, busca com sugestões, conta, carrinho,
 * barra de tarefas (navbar) e menu Iniciar.
 */
@Component({
  selector: 'pl-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icone, Arte, CurrencyPipe],
  templateUrl: './header.html',
  host: {
    '(document:click)': 'cliqueFora($event)',
    '(document:keydown.escape)': 'fecharTudo()',
  },
})
export class Header {
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  protected readonly catalogo = inject(CatalogoService);
  protected readonly carrinho = inject(CarrinhoService);
  protected readonly sessao = inject(SessaoService);
  private readonly avisos = inject(AvisoService);

  protected readonly letreiro = [
    'Frete grátis acima de R$ 99',
    'Entrega em até 2h na Grande SP',
    'Farmacêutico online 24h',
    'Cupom PILULA10 na primeira compra',
    'Até 3x sem juros no cartão',
    'Manda a foto da receita',
  ];

  /** categoria aberta na loja (para marcar na barra) */
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly catAtual = computed(() => {
    const u = this.router.parseUrl(this.url());
    return u.root.children['primary']?.segments[0]?.path === 'loja' ? u.queryParams['cat'] : null;
  });

  // ---------- relógio da bandeja ----------
  protected readonly hora = signal(this.agora());
  private agora() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ---------- menus ----------
  protected readonly menuAberto = signal(false);
  protected readonly catExpandida = signal<string | null>(null);
  protected readonly contaAberta = signal(false);

  // ---------- busca ----------
  protected readonly termo = signal('');
  protected readonly buscaAberta = signal(false);
  protected readonly indice = signal(-1);
  protected readonly sugestoes = computed<Produto[]>(() =>
    this.termo().trim().length >= 2 ? this.catalogo.buscar(this.termo()).slice(0, 6) : [],
  );
  /** sugestões + a linha "ver todos" */
  private readonly totalOpcoes = computed(() =>
    this.sugestoes().length ? this.sugestoes().length + 1 : 0,
  );

  // ---------- animação do contador do carrinho ----------
  protected readonly pulando = signal(false);

  constructor() {
    const relogio = setInterval(() => this.hora.set(this.agora()), 20_000);
    inject(DestroyRef).onDestroy(() => clearInterval(relogio));

    // fecha menus ao trocar de página
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.fecharTudo(false));

    // escurece a página no celular quando o menu está aberto
    effect(() => this.document.body.classList.toggle('start-open', this.menuAberto()));

    let anterior = untracked(() => this.carrinho.quantidade());
    effect(() => {
      const q = this.carrinho.quantidade();
      if (q > anterior) {
        this.pulando.set(false);
        requestAnimationFrame(() => this.pulando.set(true));
      }
      anterior = q;
    });
  }

  protected alternarMenu(evento: Event): void {
    evento.stopPropagation();
    this.menuAberto.update((v) => !v);
    this.contaAberta.set(false);
    if (this.menuAberto()) {
      requestAnimationFrame(() =>
        this.host.nativeElement.querySelector<HTMLElement>('#menu-iniciar .sm-toggle')?.focus(),
      );
    }
  }

  protected alternarCat(id: string): void {
    this.catExpandida.update((atual) => (atual === id ? null : id));
  }

  protected alternarConta(evento: Event): void {
    evento.stopPropagation();
    this.contaAberta.update((v) => !v);
  }

  protected sair(): void {
    this.sessao.sair();
    this.fecharTudo(false);
    this.avisos.mostrar('Você saiu da sua conta.');
  }

  protected cliqueFora(e: MouseEvent): void {
    const alvo = e.target as Node;
    const dentro = (sel: string) => this.host.nativeElement.querySelector(sel)?.contains(alvo);
    if (!dentro('#menu-iniciar')) this.menuAberto.set(false);
    if (!dentro('.account')) this.contaAberta.set(false);
    if (!dentro('.search')) this.buscaAberta.set(false);
  }

  protected fecharTudo(devolverFoco = true): void {
    const estavaAberto = this.menuAberto();
    this.menuAberto.set(false);
    this.contaAberta.set(false);
    this.buscaAberta.set(false);
    if (devolverFoco && estavaAberto) {
      const botoes = this.host.nativeElement.querySelectorAll<HTMLElement>('[data-start]');
      [...botoes].find((b) => b.offsetParent !== null)?.focus();
    }
  }

  // ---------- busca (padrão combobox da WAI-ARIA) ----------
  protected digitar(valor: string): void {
    this.termo.set(valor);
    this.buscaAberta.set(true);
    this.indice.set(-1);
  }

  protected teclaBusca(e: KeyboardEvent): void {
    const n = this.totalOpcoes();
    if (!this.buscaAberta() || !n) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.indice.update((i) => (i + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.indice.update((i) => (i - 1 + n) % n);
    } else if (e.key === 'Enter' && this.indice() >= 0) {
      e.preventDefault();
      const p = this.sugestoes()[this.indice()];
      p ? this.abrirProduto(p) : this.buscar();
    }
  }

  protected abrirProduto(p: Produto): void {
    this.buscaAberta.set(false);
    this.termo.set('');
    this.router.navigate(['/produto', p.id]);
  }

  protected buscar(evento?: Event): void {
    evento?.preventDefault();
    const q = this.termo().trim();
    this.buscaAberta.set(false);
    this.router.navigate(['/loja'], { queryParams: q ? { q } : {} });
  }
}
