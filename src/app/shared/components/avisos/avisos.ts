import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../../../core/services/aviso.service';
import { Icone } from '../icone/icone';
import { Janela } from '../janela/janela';

@Component({
  selector: 'pl-avisos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Janela, Icone, RouterLink],
  host: { class: 'toast-area', 'aria-live': 'polite' },
  template: `
    @for (a of servico.avisos(); track a.id) {
      <pl-janela titulo="pílula.exe" class="toast" [class.is-leaving]="a.saindo">
        <div class="win__body">
          <pl-icone nome="info" />
          <span>{{ a.mensagem }}</span>
          @if (a.link; as link) {
            <a [routerLink]="link.rota">{{ link.rotulo }}</a>
          }
        </div>
      </pl-janela>
    }
  `,
})
export class Avisos {
  protected readonly servico = inject(AvisoService);
}
