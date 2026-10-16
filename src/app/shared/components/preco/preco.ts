import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Produto } from '../../../core/models/catalogo';

/** Preço atual + preço antigo riscado (quando em oferta). */
@Component({
  selector: 'pl-preco',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  host: { class: 'price' },
  template: `
    @if (produto().precoAntigo; as antigo) {
      <span class="price__old"><span class="sr-only">de </span>{{ antigo | currency: 'BRL' }}</span>
    }
    <span class="price__now">
      @if (produto().precoAntigo) {
        <span class="sr-only">por </span>
      }
      {{ produto().preco | currency: 'BRL' }}
    </span>
  `,
})
export class Preco {
  readonly produto = input.required<Pick<Produto, 'preco' | 'precoAntigo'>>();
}
