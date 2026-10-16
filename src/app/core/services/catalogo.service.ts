import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Catalogo, Categoria, Produto, Subcategoria } from '../models/catalogo';
import { semAcento } from '../utils/texto';

/**
 * Catálogo de produtos. Carregado uma vez na inicialização do app
 * (ver provideAppInitializer em app.config.ts). Para usar um back-end real,
 * basta trocar a URL abaixo pelo endpoint da API.
 */
@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  static readonly URL = 'dados/catalogo.json';

  readonly categorias = signal<Categoria[]>([]);
  readonly produtos = signal<Produto[]>([]);

  readonly marcas = computed(() =>
    [...new Set(this.produtos().map((p) => p.marca))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
  );
  readonly destaques = computed(() =>
    this.produtos()
      .filter((p) => p.destaque)
      .slice(0, 8),
  );

  private porId = computed(() => new Map(this.produtos().map((p) => [p.id, p])));

  async carregar(): Promise<void> {
    const dados = await firstValueFrom(this.http.get<Catalogo>(CatalogoService.URL));
    this.categorias.set(dados.categorias);
    this.produtos.set(dados.produtos);
  }

  produto(id: string | null | undefined): Produto | null {
    return (id && this.porId().get(id)) || null;
  }

  categoria(id: string | null | undefined): Categoria | null {
    return this.categorias().find((c) => c.id === id) ?? null;
  }

  sub(catId: string | null | undefined, subId: string | null | undefined): Subcategoria | null {
    return this.categoria(catId)?.subs.find((s) => s.id === subId) ?? null;
  }

  contar(catId: string, subId?: string): number {
    return this.produtos().filter(
      (p) => p.categoria === catId && (!subId || p.subcategoria === subId),
    ).length;
  }

  /**
   * Busca por início de palavra: "dor" acha Dorflex e "dor de cabeça",
   * mas não "desodorante". Todas as palavras digitadas precisam aparecer.
   */
  buscar(termo: string, lista: Produto[] = this.produtos()): Produto[] {
    const partes = semAcento(termo)
      .split(/[^a-z0-9%]+/)
      .filter(Boolean);
    if (!partes.length) return lista;
    return lista.filter((p) => {
      const texto = `${p.nome} ${p.marca} ${p.sub} ${p.descricao} ${this.categoria(p.categoria)?.nome} ${this.sub(p.categoria, p.subcategoria)?.nome}`;
      const palavras = semAcento(texto).split(/[^a-z0-9%]+/);
      return partes.every((t) => palavras.some((w) => w.startsWith(t)));
    });
  }
}
