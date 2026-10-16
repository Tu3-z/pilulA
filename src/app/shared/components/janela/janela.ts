import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Janela estilo Windows 98: barra de título + conteúdo projetado.
 *
 *   <pl-janela titulo="carrinho.exe" [controles]="['_', '□', '×']">
 *     <div class="win__body">…</div>
 *   </pl-janela>
 */
@Component({
  selector: 'pl-janela',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'win' },
  template: `
    <div class="win__bar">
      <span class="win__title" [id]="tituloId()"
        ><ng-content select="[titulo]" />{{ titulo() }}</span
      >
      @if (controles().length) {
        <span class="win__ctls" aria-hidden="true">
          @for (c of controles(); track $index) {
            <span class="win__ctl">{{ c }}</span>
          }
        </span>
      }
    </div>
    <ng-content />
  `,
})
export class Janela {
  readonly titulo = input('');
  readonly tituloId = input<string | null>(null);
  readonly controles = input<string[]>(['×']);
}
