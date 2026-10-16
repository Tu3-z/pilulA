import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  mensagem: string;
  link?: { rota: string; rotulo: string };
  /** botão de ação, ex.: "Desfazer" */
  acao?: { rotulo: string; executar: () => void };
  saindo?: boolean;
}

/**
 * Avisos estilo janela do Windows no canto da tela (toasts).
 * Ficam mais tempo na tela quando têm link ou ação, pra dar tempo de clicar.
 */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  private seq = 0;
  readonly avisos = signal<Aviso[]>([]);

  mostrar(mensagem: string, link?: Aviso['link'], acao?: Aviso['acao']): void {
    const id = ++this.seq;
    this.avisos.update((lista) => [...lista, { id, mensagem, link, acao }].slice(-3));
    const duracao = acao ? 6000 : link ? 4000 : 2600;
    setTimeout(() => this.fechar(id), duracao);
  }

  fechar(id: number): void {
    this.avisos.update((l) => l.map((a) => (a.id === id ? { ...a, saindo: true } : a)));
    setTimeout(() => this.avisos.update((l) => l.filter((a) => a.id !== id)), 250);
  }

  executar(a: Aviso): void {
    a.acao?.executar();
    this.fechar(a.id);
  }
}
