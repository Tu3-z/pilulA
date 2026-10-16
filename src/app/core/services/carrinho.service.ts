import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Produto } from '../models/catalogo';
import { gravarStorage, lerStorage } from '../utils/texto';
import { CatalogoService } from './catalogo.service';

const CHAVE = 'pilula:carrinho:v1';

export const FRETE_GRATIS_A_PARTIR = 99;
export const VALOR_FRETE = 9.9;
export const PARCELA_MINIMA = 30;
export const MAX_PARCELAS = 3;

const CUPONS: Record<string, { percentual: number; descricao: string }> = {
  PILULA10: { percentual: 0.1, descricao: '10% na primeira compra' },
};

/** Quantas parcelas sem juros cabem num valor (parcela mínima de R$ 30, até 3x). */
export const maxParcelas = (valor: number): number =>
  Math.max(1, Math.min(MAX_PARCELAS, Math.floor(valor / PARCELA_MINIMA)));

export interface LinhaCarrinho {
  produto: Produto;
  qtd: number;
}

export interface Resumo {
  itens: LinhaCarrinho[];
  subtotal: number;
  desconto: number;
  frete: number;
  freteGratis: boolean;
  retirada: boolean;
  faltaParaFrete: number;
  progressoFrete: number;
  total: number;
  exigeReceita: boolean;
}

interface EstadoSalvo {
  itens: Record<string, number>;
  cupom: string | null;
}

/** Estado do carrinho com signals, salvo no localStorage e sincronizado entre abas. */
@Injectable({ providedIn: 'root' })
export class CarrinhoService {
  private readonly catalogo = inject(CatalogoService);

  private readonly itensMap = signal<Record<string, number>>({});
  private readonly cupomCodigo = signal<string | null>(null);

  /** linhas com o produto completo */
  readonly itens = computed<LinhaCarrinho[]>(() =>
    Object.entries(this.itensMap())
      .map(([id, qtd]) => ({ produto: this.catalogo.produto(id)!, qtd }))
      .filter((l) => !!l.produto),
  );
  readonly quantidade = computed(() => Object.values(this.itensMap()).reduce((s, q) => s + q, 0));
  readonly cupom = computed(() => {
    const c = this.cupomCodigo();
    return c ? { codigo: c, ...CUPONS[c] } : null;
  });

  constructor() {
    this.carregar();
    // salva sempre que algo muda
    effect(() =>
      gravarStorage(CHAVE, {
        itens: this.itensMap(),
        cupom: this.cupomCodigo(),
      } satisfies EstadoSalvo),
    );
    // outra aba mexeu no carrinho
    window.addEventListener('storage', (e) => e.key === CHAVE && this.carregar());
  }

  private carregar(): void {
    const dados = lerStorage<EstadoSalvo>(CHAVE, { itens: {}, cupom: null });
    const itens: Record<string, number> = {};
    for (const [id, qtd] of Object.entries(dados.itens ?? {})) {
      if (Number.isInteger(qtd) && qtd > 0) itens[id] = Math.min(99, qtd);
    }
    this.itensMap.set(itens);
    this.cupomCodigo.set(dados.cupom && CUPONS[dados.cupom] ? dados.cupom : null);
  }

  qtdDe(id: string): number {
    return this.itensMap()[id] ?? 0;
  }

  adicionar(id: string, qtd = 1): void {
    this.itensMap.update((m) => ({ ...m, [id]: Math.min(99, (m[id] ?? 0) + qtd) }));
  }

  definir(id: string, qtd: number): void {
    const n = Math.floor(Number(qtd));
    this.itensMap.update((m) => {
      const novo = { ...m };
      if (!Number.isFinite(n) || n <= 0) delete novo[id];
      else novo[id] = Math.min(99, n);
      return novo;
    });
  }

  remover(id: string): void {
    this.definir(id, 0);
  }

  limpar(): void {
    this.itensMap.set({});
    this.cupomCodigo.set(null);
  }

  aplicarCupom(codigo: string): boolean {
    const c = String(codigo || '')
      .trim()
      .toUpperCase();
    if (!CUPONS[c]) return false;
    this.cupomCodigo.set(c);
    return true;
  }

  removerCupom(): void {
    this.cupomCodigo.set(null);
  }

  /** Totais do pedido. Retirada na loja zera o frete. */
  resumo(retirada = false): Resumo {
    const itens = this.itens();
    const subtotal = itens.reduce((s, i) => s + i.produto.preco * i.qtd, 0);
    const cupom = this.cupom();
    const desconto = cupom ? Math.round(subtotal * cupom.percentual * 100) / 100 : 0;
    const base = subtotal - desconto;
    const freteGratis = base >= FRETE_GRATIS_A_PARTIR;
    const frete = itens.length === 0 || freteGratis || retirada ? 0 : VALOR_FRETE;
    return {
      itens,
      subtotal,
      desconto,
      frete,
      freteGratis,
      retirada,
      faltaParaFrete: Math.max(0, FRETE_GRATIS_A_PARTIR - base),
      progressoFrete: Math.min(1, base / FRETE_GRATIS_A_PARTIR),
      total: base + frete,
      exigeReceita: itens.some((i) => i.produto.receita !== 'livre'),
    };
  }
}
