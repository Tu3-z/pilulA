import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Caixa de remédio em 3D feita só com CSS (transform-style: preserve-3d).
 *
 *   <pl-caixa-3d frente="img/produtos/x.webp" lado="img/produtos/x-lado.webp"
 *                topo="#3cbfae" [proporcao]="0.545" [profundidade]="0.62" />
 *
 * - frente: foto da frente da caixa (recortada, sem fundo preto).
 * - lado: faixa vertical tirada da borda da foto; vira as laterais da caixa.
 * - topo / base: cor das tampas.
 * - proporcao: largura ÷ altura da frente. profundidade: profundidade ÷ largura.
 *
 * O giro vem de fora, pelas variáveis CSS --rx e --ry (números, em graus) do elemento pai,
 * e o brilho acompanha --ry. Assim quem usa decide se é mouse, rolagem ou animação.
 * O tamanho vem de --altura (ex.: 340px). Quem usa precisa dar `perspective` a um ancestral.
 */
@Component({
  selector: 'pl-caixa-3d',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'caixa3d',
    '[style.--proporcao]': 'proporcao()',
    '[style.--prof]': 'profundidade()',
    '[style.--topo]': 'topo()',
    '[style.--base]': 'base()',
  },
  template: `
    <div class="caixa3d__corpo">
      <div class="caixa3d__face caixa3d__face--frente">
        <img [src]="frente()" [alt]="alt()" decoding="async" />
      </div>
      <div class="caixa3d__face caixa3d__face--tras"></div>
      <div
        class="caixa3d__face caixa3d__face--dir"
        [style.background-image]="'url(' + lado() + ')'"
      ></div>
      <div
        class="caixa3d__face caixa3d__face--esq"
        [style.background-image]="'url(' + lado() + ')'"
      ></div>
      <div class="caixa3d__face caixa3d__face--topo"></div>
      <div class="caixa3d__face caixa3d__face--base"></div>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: block;
      height: var(--altura, 340px);
      aspect-ratio: var(--proporcao);
      transform-style: preserve-3d;
    }
    .caixa3d__corpo {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
      transform: rotateX(calc(var(--rx, 0) * 1deg)) rotateY(calc(var(--ry, 0) * 1deg));
      transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
    }
    .caixa3d__face {
      position: absolute;
      left: 50%;
      top: 50%;
      backface-visibility: hidden;
      background-size: 100% 100%;
    }
    /* frente e trás: largura × altura */
    .caixa3d__face--frente,
    .caixa3d__face--tras {
      width: 100%;
      height: 100%;
      border-radius: 3px;
    }
    .caixa3d__face--frente {
      overflow: hidden;
      transform: translate(-50%, -50%)
        translateZ(calc(var(--altura, 340px) * var(--proporcao) * var(--prof) / 2));
    }
    .caixa3d__face--frente img {
      width: 100%;
      height: 100%;
      object-fit: fill;
    }
    /* brilho que corre pela frente conforme a caixa gira */
    .caixa3d__face--frente::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(
        105deg,
        transparent 35%,
        rgba(255, 255, 255, 0.38) 48%,
        transparent 62%
      );
      background-size: 260% 100%;
      background-position: calc(50% - var(--ry, 0) * 2.4%) 0;
      transition: background-position 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
      mix-blend-mode: soft-light;
      pointer-events: none;
    }
    .caixa3d__face--tras {
      background: var(--base);
      transform: translate(-50%, -50%) rotateY(180deg)
        translateZ(calc(var(--altura, 340px) * var(--proporcao) * var(--prof) / 2));
    }
    /* laterais: profundidade × altura */
    .caixa3d__face--dir,
    .caixa3d__face--esq {
      width: calc(var(--altura, 340px) * var(--proporcao) * var(--prof));
      height: 100%;
    }
    .caixa3d__face--dir {
      transform: translate(-50%, -50%) rotateY(90deg)
        translateZ(calc(var(--altura, 340px) * var(--proporcao) / 2));
      filter: brightness(0.78);
    }
    .caixa3d__face--esq {
      transform: translate(-50%, -50%) rotateY(-90deg)
        translateZ(calc(var(--altura, 340px) * var(--proporcao) / 2));
      filter: brightness(0.9);
    }
    /* tampas: largura × profundidade */
    .caixa3d__face--topo,
    .caixa3d__face--base {
      width: 100%;
      height: calc(var(--altura, 340px) * var(--proporcao) * var(--prof));
    }
    .caixa3d__face--topo {
      background: var(--topo);
      filter: brightness(1.08);
      transform: translate(-50%, -50%) rotateX(90deg) translateZ(calc(var(--altura, 340px) / 2));
    }
    .caixa3d__face--base {
      background: var(--base);
      transform: translate(-50%, -50%) rotateX(-90deg) translateZ(calc(var(--altura, 340px) / 2));
    }
  `,
})
export class Caixa3d {
  readonly frente = input.required<string>();
  readonly lado = input.required<string>();
  readonly alt = input('');
  readonly topo = input('#ffffff');
  readonly base = input('#dddddd');
  readonly proporcao = input(0.55);
  readonly profundidade = input(0.6);
}
