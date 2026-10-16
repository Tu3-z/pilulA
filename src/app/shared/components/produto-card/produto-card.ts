import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Produto } from '../../../core/models/catalogo';
import { AvisoService } from '../../../core/services/aviso.service';
import { CarrinhoService } from '../../../core/services/carrinho.service';
import { CatalogoService } from '../../../core/services/catalogo.service';
import { Arte } from '../arte/arte';
import { Preco } from '../preco/preco';

@Component({
  selector: 'pl-produto-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Arte, Preco],
  host: { class: 'card', role: 'article' },
  template: `
    <div class="card__media">
      <pl-arte [produto]="produto()" />
      @if (produto().selo) {
        <span class="card__selo badge badge--dark">{{ produto().selo }}</span>
      }
    </div>
    <div class="card__body">
      <p class="card__cat">
        {{ produto().marca }}<span aria-hidden="true"> · </span><span class="sr-only">, </span
        >{{ categoria() }}
      </p>
      <h3 class="card__title">
        <a [routerLink]="['/produto', produto().id]">{{ produto().nome }}</a>
      </h3>
      <p class="card__sub">{{ produto().sub }}</p>
      @if (produto().receita !== 'livre') {
        <span class="tarja"
          >tarja vermelha ·
          {{ produto().receita === 'retencao' ? 'retém receita' : 'exige receita' }}</span
        >
      }
    </div>
    <div class="card__foot">
      <pl-preco [produto]="produto()" />
      <button
        type="button"
        class="btn btn--primary btn--sm"
        (click)="adicionar()"
        [attr.aria-label]="'Adicionar ' + produto().nome + ' ao carrinho'"
      >
        + add
      </button>
    </div>
  `,
})
export class ProdutoCard {
  private readonly carrinho = inject(CarrinhoService);
  private readonly avisos = inject(AvisoService);
  private readonly catalogo = inject(CatalogoService);

  readonly produto = input.required<Produto>();
  protected readonly categoria = computed(
    () => this.catalogo.categoria(this.produto().categoria)?.nome ?? '',
  );

  protected adicionar(): void {
    this.carrinho.adicionar(this.produto().id);
    this.avisos.mostrar(`${this.produto().nome} foi pro carrinho.`, {
      rota: '/carrinho',
      rotulo: 'ver →',
    });
  }
}
