import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { CatalogoService } from './core/services/catalogo.service';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withComponentInputBinding(), // parâmetros de rota viram input() nos componentes
      withInMemoryScrolling({ anchorScrolling: 'enabled' }),
    ),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    // carrega o catálogo antes da primeira tela
    provideAppInitializer(() => inject(CatalogoService).carregar()),
  ],
};
