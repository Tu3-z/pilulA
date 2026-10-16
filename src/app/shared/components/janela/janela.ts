import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Janela estilo Windows 98: barra de título + conteúdo projetado.
 *
 *   <pl-janela titulo="carrinho.exe">
 *     <div class="win__body">…</div>
 *   </pl-janela>
 *
 * Os botões _ □ × da barra são só decorativos (ficam apagados para não parecerem clicáveis).
 * Para um × de verdade, use [fechavel]="true" e escute (fechar).
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
      @if (fechavel()) {
        <button
          type="button"
          class="win__ctl win__close"
          [attr.aria-label]="'Fechar ' + (rotuloFechar() || titulo())"
          (click)="fechar.emit()"
        >
          ×
        </button>
      } @else if (controles().length) {
        <span class="win__ctls win__ctls--deco" aria-hidden="true">
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
  readonly fechavel = input(false);
  readonly rotuloFechar = input('');
  readonly fechar = output<void>();
}
