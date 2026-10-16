import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { filter } from 'rxjs';
import { Header } from './shared/components/header/header';
import { Footer } from './shared/components/footer/footer';
import { Avisos } from './shared/components/avisos/avisos';

@Component({
  selector: 'pl-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, Avisos],
  host: { style: 'display: contents' },
  template: `
    <a class="skip" href="#conteudo">Pular para o conteúdo</a>
    <pl-header />
    <main id="conteudo" tabindex="-1"><router-outlet /></main>
    <pl-footer />
    <pl-avisos />
  `,
})
export class App {
  constructor() {
    // volta ao topo quando muda de página (mas não quando só mudam os filtros da loja)
    const router = inject(Router);
    const scroller = inject(ViewportScroller);
    scroller.setOffset([0, 150]); // links com #âncora não ficam escondidos atrás do cabeçalho fixo
    let caminhoAnterior = '';
    router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const arvore = router.parseUrl(e.urlAfterRedirects);
        const caminho =
          arvore.root.children['primary']?.segments.map((s) => s.path).join('/') ?? '';
        if (caminho !== caminhoAnterior && !arvore.fragment) scroller.scrollToPosition([0, 0]);
        caminhoAnterior = caminho;
      });
  }
}
