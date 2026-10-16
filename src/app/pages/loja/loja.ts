import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { CatalogoService } from '../../core/services/catalogo.service';
import { Produto } from '../../core/models/catalogo';
import { ProdutoCard } from '../../shared/components/produto-card/produto-card';
import { Janela } from '../../shared/components/janela/janela';
import { Icone } from '../../shared/components/icone/icone';

type Ordem = 'relevancia' | 'menor' | 'maior' | 'az';

/**
 * Catálogo. Todo o estado dos filtros mora na URL (?cat=&sub=&marca=&q=&ordem=&livre=&oferta=),
 * então dá pra compartilhar o link de uma busca e o botão "voltar" funciona.
 */
@Component({
  selector: 'pl-loja',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProdutoCard, Janela, Icone],
  templateUrl: './loja.html',
  styleUrl: './loja.css',
})
export class LojaPage {
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);
  private readonly titulo = inject(Title);
  protected readonly catalogo = inject(CatalogoService);

  private readonly params = toSignal(this.rota.queryParams, { initialValue: {} as Params });

  // ---------- filtros lidos da URL ----------
  protected readonly cat = computed(() =>
    this.catalogo.categoria(this.params()['cat']) ? (this.params()['cat'] as string) : 'todos',
  );
  protected readonly sub = computed(() =>
    this.catalogo.sub(this.cat(), this.params()['sub']) ? (this.params()['sub'] as string) : '',
  );
  protected readonly marca = computed(() =>
    this.catalogo.marcas().includes(this.params()['marca'])
      ? (this.params()['marca'] as string)
      : '',
  );
  protected readonly q = computed(() => String(this.params()['q'] ?? ''));
  protected readonly ordem = computed<Ordem>(() =>
    ['menor', 'maior', 'az'].includes(this.params()['ordem'])
      ? this.params()['ordem']
      : 'relevancia',
  );
  protected readonly livre = computed(() => this.params()['livre'] === '1');
  protected readonly oferta = computed(() => this.params()['oferta'] === '1');

  protected readonly categoria = computed(() => this.catalogo.categoria(this.cat()));
  protected readonly subcategoria = computed(() => this.catalogo.sub(this.cat(), this.sub()));

  protected readonly resultado = computed<Produto[]>(() => {
    let lista = this.catalogo
      .produtos()
      .filter(
        (p) =>
          (this.cat() === 'todos' || p.categoria === this.cat()) &&
          (!this.sub() || p.subcategoria === this.sub()) &&
          (!this.marca() || p.marca === this.marca()) &&
          (!this.livre() || p.receita === 'livre') &&
          (!this.oferta() || !!p.precoAntigo),
      );
    if (this.q()) lista = this.catalogo.buscar(this.q(), lista);
    const ordenar: Record<Ordem, ((a: Produto, b: Produto) => number) | null> = {
      relevancia: null,
      menor: (a, b) => a.preco - b.preco,
      maior: (a, b) => b.preco - a.preco,
      az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
    };
    const fn = ordenar[this.ordem()];
    return fn ? [...lista].sort(fn) : lista;
  });

  protected readonly caminho = computed(() => {
    const c = this.categoria();
    const s = this.subcategoria();
    return `C:\\pilula\\loja${c ? '\\' + c.arquivo.replace('.flp', '') : ''}${s ? '\\' + s.id : ''}${this.q() ? '\\busca?' + this.q() : ''}`;
  });

  protected readonly cabecalho = computed(() => {
    if (this.q()) return `Resultados para “${this.q()}”`;
    const c = this.categoria();
    const s = this.subcategoria();
    let t = this.oferta() ? 'Ofertas' : 'Todos os produtos';
    if (c) t = s ? `${c.nome} › ${s.nome}` : c.nome;
    return this.marca() ? `${t} · ${this.marca()}` : t;
  });

  constructor() {
    // título da aba acompanha a pasta aberta
    effect(() =>
      this.titulo.setTitle(
        `${this.categoria()?.nome ?? (this.oferta() ? 'Ofertas' : 'Loja')} — pílula*`,
      ),
    );
  }

  protected contar(cat: string, sub?: string): number {
    return cat === 'todos' ? this.catalogo.produtos().length : this.catalogo.contar(cat, sub);
  }

  /** Atualiza um ou mais filtros na URL (sem empilhar no histórico). */
  protected filtrar(mudancas: Params): void {
    const atual = { ...this.rota.snapshot.queryParams, ...mudancas };
    const limpo = Object.fromEntries(
      Object.entries(atual).filter(
        ([, v]) => v !== '' && v !== null && v !== undefined && v !== 'todos' && v !== 'relevancia',
      ),
    );
    this.router.navigate([], { relativeTo: this.rota, queryParams: limpo, replaceUrl: true });
  }

  private buscaTimer?: ReturnType<typeof setTimeout>;
  protected digitarBusca(valor: string): void {
    clearTimeout(this.buscaTimer);
    this.buscaTimer = setTimeout(() => this.filtrar({ q: valor.trim() || null }), 180);
  }

  protected limpar(): void {
    this.router.navigate([], { relativeTo: this.rota, queryParams: {}, replaceUrl: true });
  }
}
