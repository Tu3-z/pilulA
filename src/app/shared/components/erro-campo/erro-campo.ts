import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Mensagem de erro de um campo. O id precisa bater com o aria-describedby do input.
 *   <pl-erro-campo id="cpf-erro" [mensagem]="erro('cpf')" />
 */
@Component({
  selector: 'pl-erro-campo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'field-error', '[hidden]': '!mensagem()' },
  template: `{{ mensagem() }}`,
})
export class ErroCampo {
  readonly mensagem = input<string | null>(null);
}
