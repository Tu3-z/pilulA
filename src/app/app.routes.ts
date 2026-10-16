import { Routes } from '@angular/router';

/** Cada página é carregada sob demanda (lazy loading). */
export const routes: Routes = [
  {
    path: '',
    title: 'pílula* — farmácia online',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'loja',
    title: 'Loja — pílula*',
    loadComponent: () => import('./pages/loja/loja').then((m) => m.LojaPage),
  },
  {
    path: 'produto/:id',
    title: 'Produto — pílula*',
    loadComponent: () => import('./pages/produto/produto').then((m) => m.ProdutoPage),
  },
  {
    path: 'carrinho',
    title: 'Carrinho — pílula*',
    loadComponent: () => import('./pages/carrinho/carrinho').then((m) => m.CarrinhoPage),
  },
  {
    path: 'entrar',
    title: 'Entrar — pílula*',
    loadComponent: () => import('./pages/entrar/entrar').then((m) => m.EntrarPage),
  },
  {
    path: '**',
    title: 'Página não encontrada — pílula*',
    loadComponent: () =>
      import('./pages/nao-encontrada/nao-encontrada').then((m) => m.NaoEncontradaPage),
  },
];
