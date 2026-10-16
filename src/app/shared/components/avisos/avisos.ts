import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AvisoService } from '../../../core/services/aviso.service';
import { Icone } from '../icone/icone';
import { Janela } from '../janela/janela';

@Component({
  selector: 'pl-avisos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Janela, Icone, RouterLink],
  host: { class: 'toast-area', role: 'status', 'aria-live': 'polite' },
  template: `
    @for (a of servico.avisos(); track a.id) {
      <pl-janela
        titulo="pílula.exe"
        class="toast"
        [class.is-leaving]="a.saindo"
        [fechavel]="true"
        rotuloFechar="aviso"
        (fechar)="servico.fechar(a.id)"
      >
        <div class="win__body">
          <pl-icone nome="info" />
          <span class="toast__msg">{{ a.mensagem }}</span>
          @if (a.acao; as acao) {
            <button type="button" class="win__btn toast__acao" (click)="servico.executar(a)">
              {{ acao.rotulo }}
            </button>
          } @else if (a.link; as link) {
            <a class="toast__link" [routerLink]="link.rota" (click)="servico.fechar(a.id)">{{
              link.rotulo
            }}</a>
          }
        </div>
      </pl-janela>
    }
  `,
})
export class Avisos {
  protected readonly servico = inject(AvisoService);
}
