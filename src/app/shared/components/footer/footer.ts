import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogoService } from '../../../core/services/catalogo.service';

@Component({
  selector: 'pl-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'footer', role: 'contentinfo' },
  template: `
    <div class="container footer__grid">
      <div>
        <a class="logo" routerLink="/" aria-label="pílula*, página inicial">
          <span class="logo__cross" aria-hidden="true"></span><span aria-hidden="true">pílula</span
          ><span class="logo__star" aria-hidden="true">*</span>
        </a>
        <p class="footer__tag">cuide de você primeiro.</p>
      </div>
      <nav aria-labelledby="f-loja">
        <h2 id="f-loja">Loja</h2>
        <ul>
          @for (c of catalogo.categorias(); track c.id) {
            <li>
              <a routerLink="/loja" [queryParams]="{ cat: c.id }">{{ c.nome }}</a>
            </li>
          }
        </ul>
      </nav>
      <nav aria-labelledby="f-ajuda">
        <h2 id="f-ajuda">Ajuda</h2>
        <ul>
          <li><a routerLink="/" fragment="chat">Fale com o farmacêutico</a></li>
          <li><a routerLink="/" fragment="receita">Como enviar a receita</a></li>
          <li><a routerLink="/entrar">Minha conta</a></li>
          <li><a href="#">Trocas e devoluções</a></li>
          <li><a href="#">Política de privacidade</a></li>
        </ul>
      </nav>
      <div>
        <h2>Pagamento</h2>
        <ul class="footer__pay">
          <li class="badge">Pix</li>
          <li class="badge">Visa</li>
          <li class="badge">Mastercard</li>
          <li class="badge">Elo</li>
          <li class="badge">Na entrega</li>
        </ul>
        <h2 class="footer__h2-gap">Redes</h2>
        <ul class="footer__social term">
          <li><a href="#">&#64;pilula.farma</a></li>
          <li><a href="#">/pilula no tiktok</a></li>
        </ul>
      </div>
    </div>
    <div class="container footer__legal">
      <p>
        Farmacêutico responsável: [NOME] — CRF-SP [Nº]<br />AFE/ANVISA [Nº] · CNPJ
        [00.000.000/0001-00]
      </p>
      <p class="footer__warning">Se persistirem os sintomas, o médico deverá ser consultado.</p>
      <p class="footer__note">
        Projeto Integrador — protótipo acadêmico. Produtos reais usados como dados de teste; preços
        ilustrativos. Marcas pertencem aos seus donos.
      </p>
    </div>
  `,
})
export class Footer {
  protected readonly catalogo = inject(CatalogoService);
}
