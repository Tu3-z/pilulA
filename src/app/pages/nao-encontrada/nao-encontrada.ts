import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** "Tela azul" do Windows 98 para rotas que não existem. Qualquer tecla volta pro início. */
@Component({
  selector: 'pl-nao-encontrada',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { '(document:keydown)': 'tecla($event)' },
  template: `
    <section class="bsod" aria-labelledby="bsod-titulo">
      <div class="bsod__box">
        <h1 id="bsod-titulo" class="bsod__title">pílula*</h1>
        <p>
          Ocorreu um erro 404 em <b>PÁGINA.EXE</b>. A página que você procurou não existe, mudou de
          lugar ou foi tomar um remédio.
        </p>
        <p>
          * Pressione qualquer tecla para voltar à página inicial.<br />* Ou
          <a routerLink="/loja">abra a loja</a> e procure de novo.
        </p>
        <p class="bsod__center">
          Pressione qualquer tecla para continuar <span class="bsod__blink">_</span>
        </p>
      </div>
    </section>
  `,
  styles: `
    .bsod {
      display: grid;
      place-items: center;
      min-height: 70vh;
      padding: 48px 16px;
      background: var(--blue-ink);
      color: #e8ecfa;
      font-family: var(--f-term);
      font-size: clamp(1.3rem, 2.4vw, 1.7rem);
      line-height: 1.25;
      border-bottom: var(--line);
    }
    .bsod__box {
      width: min(720px, 100%);
    }
    .bsod__title {
      display: table;
      margin: 0 auto 1.5em;
      padding: 0 0.4em;
      background: #e8ecfa;
      color: var(--blue-ink);
      font-weight: 400;
      font-size: 1em;
      font-family: inherit;
    }
    p {
      margin: 0 0 1em;
    }
    a {
      color: #fff;
    }
    .bsod__center {
      text-align: center;
    }
    .bsod__blink {
      animation: piscar 1s steps(2) infinite;
    }
    @keyframes piscar {
      50% {
        opacity: 0;
      }
    }
  `,
})
export class NaoEncontradaPage {
  private readonly router = inject(Router);

  protected tecla(e: KeyboardEvent): void {
    // deixa navegar pelo teclado e usar atalhos
    if (
      ['Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey ||
      e.altKey
    )
      return;
    if (e.key === 'Enter' && (document.activeElement as HTMLElement)?.tagName === 'A') return;
    if ((e.target as HTMLElement)?.closest('input, textarea, select')) return;
    this.router.navigateByUrl('/');
  }
}
