import { Directive, ElementRef, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';
import { TipoMascara, mascaras } from '../../core/utils/validacao';

/**
 * Aplica máscara enquanto a pessoa digita.
 *   <input formControlName="cpf" plMascara="cpf">
 */
@Directive({
  selector: 'input[plMascara]',
  host: { '(input)': 'aoDigitar()' },
})
export class Mascara {
  readonly plMascara = input.required<TipoMascara>();
  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly controle = inject(NgControl, { optional: true, self: true });

  protected aoDigitar(): void {
    const formatado = mascaras[this.plMascara()](this.el.nativeElement.value);
    this.el.nativeElement.value = formatado;
    this.controle?.control?.setValue(formatado, { emitModelToViewChange: false });
  }
}
