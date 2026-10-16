import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { CatalogoService } from '../../core/services/catalogo.service';
import { CarrinhoService, maxParcelas } from '../../core/services/carrinho.service';
import { AvisoService } from '../../core/services/aviso.service';
import { RECEITA } from '../../core/models/catalogo';
import { Arte } from '../../shared/components/arte/arte';
import { Janela } from '../../shared/components/janela/janela';
import { Preco } from '../../shared/components/preco/preco';
import { ProdutoCard } from '../../shared/components/produto-card/produto-card';
import { Icone } from '../../shared/components/icone/icone';

type Aba = 'desc' | 'uso' | 'aviso';

@Component({
  selector: 'pl-produto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, Arte, Janela, Preco, ProdutoCard, Icone],
  templateUrl: './produto.html',
  styleUrl: './produto.css',
})
export class ProdutoPage {
  private readonly catalogo = inject(CatalogoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly avisos = inject(AvisoService);
  private readonly titulo = inject(Title);

  /** vem da rota /produto/:id (withComponentInputBinding) */
  readonly id = input<string>('');

  protected readonly p = computed(() => this.catalogo.produto(this.id()));
  protected readonly cat = computed(() => this.catalogo.categoria(this.p()?.categoria));
  protected readonly sub = computed(() =>
    this.catalogo.sub(this.p()?.categoria, this.p()?.subcategoria),
  );
  protected readonly receita = computed(() => RECEITA[this.p()?.receita ?? 'livre']);
  protected readonly parcelas = computed(() => maxParcelas(this.p()?.preco ?? 0));

  protected readonly relacionados = computed(() => {
    const p = this.p();
    if (!p) return [];
    const todos = this.catalogo.produtos();
    const mesmaSub = todos.filter(
      (x) => x.categoria === p.categoria && x.subcategoria === p.subcategoria && x.id !== p.id,
    );
    const mesmaCat = todos.filter(
      (x) => x.categoria === p.categoria && x.subcategoria !== p.subcategoria,
    );
    return [...mesmaSub, ...mesmaCat].slice(0, 4);
  });

  protected readonly qtd = signal(1);
  /** quantas unidades deste produto já estão no carrinho */
  protected readonly noCarrinho = computed(() => this.carrinho.qtdDe(this.id()));
  /** feedback rápido no botão depois de adicionar */
  protected readonly adicionado = signal(false);
  private timerAdicionado?: ReturnType<typeof setTimeout>;
  protected readonly aba = signal<Aba>('desc');
  protected readonly abas: { id: Aba; rotulo: string }[] = [
    { id: 'desc', rotulo: 'Descrição' },
    { id: 'uso', rotulo: 'Como usar' },
    { id: 'aviso', rotulo: 'Avisos' },
  ];

  constructor() {
    effect(() => {
      const p = this.p();
      this.titulo.setTitle(p ? `${p.nome} — pílula*` : 'Produto não encontrado — pílula*');
    });
    // trocou de produto (ex.: clicou num relacionado): volta a quantidade e a aba
    effect(() => {
      this.id();
      this.qtd.set(1);
      this.aba.set('desc');
    });
  }

  protected ajustar(delta: number, valor?: string): void {
    const base = valor !== undefined ? parseInt(valor, 10) || 1 : this.qtd() + delta;
    this.qtd.set(Math.min(99, Math.max(1, base)));
  }

  protected comprar(): void {
    const p = this.p();
    if (!p) return;
    this.carrinho.adicionar(p.id, this.qtd());
    this.adicionado.set(true);
    clearTimeout(this.timerAdicionado);
    this.timerAdicionado = setTimeout(() => this.adicionado.set(false), 1600);
    this.avisos.mostrar(`${this.qtd()}× ${p.nome} no carrinho.`, {
      rota: '/carrinho',
      rotulo: 'Ver carrinho',
    });
  }

  /** setas do teclado trocam de aba (padrão WAI-ARIA tabs) */
  protected teclaAba(e: KeyboardEvent, i: number, lista: HTMLElement): void {
    const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!d) return;
    const prox = this.abas[(i + d + this.abas.length) % this.abas.length];
    this.aba.set(prox.id);
    lista.querySelector<HTMLElement>(`#tab-${prox.id}`)?.focus();
  }
}
