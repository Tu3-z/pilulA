import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Produto } from '../../../core/models/catalogo';
import { arteSvg } from '../../../core/utils/arte';

/**
 * Imagem de um produto.
 * - Se o produto tem `foto` (ex.: "img/produtos/codein-30.webp"), mostra a foto real.
 * - Se não tem, ou se a foto não carregar, mostra a ilustração SVG gerada em arte.ts.
 *   O SVG é montado pelo próprio app, com os textos escapados, por isso é seguro marcar como confiável.
 */
@Component({
  selector: 'pl-arte',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'art' },
  template: `
    @if (produto().foto && !falhou()) {
      <img
        class="art__foto"
        [src]="produto().foto"
        alt=""
        loading="lazy"
        decoding="async"
        (error)="falhou.set(true)"
      />
    } @else {
      <span class="art__svg" [innerHTML]="svg()"></span>
    }
  `,
})
export class Arte {
  private readonly sanitizer = inject(DomSanitizer);
  readonly produto = input.required<Pick<Produto, 'arte' | 'foto'>>();
  protected readonly falhou = signal(false);
  protected readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(arteSvg(this.produto())),
  );
}
