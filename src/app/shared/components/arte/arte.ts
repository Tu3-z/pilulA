import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Produto } from '../../../core/models/catalogo';
import { arteSvg } from '../../../core/utils/arte';

/**
 * Ilustração SVG de um produto. O SVG é montado pelo próprio app (arte.ts),
 * com os textos escapados, por isso é seguro marcar como confiável.
 */
@Component({
  selector: 'pl-arte',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'art', '[innerHTML]': 'svg()' },
  template: '',
})
export class Arte {
  private readonly sanitizer = inject(DomSanitizer);
  readonly produto = input.required<Pick<Produto, 'arte'>>();
  protected readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(arteSvg(this.produto())),
  );
}
