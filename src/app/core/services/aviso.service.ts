import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  mensagem: string;
  link?: { rota: string; rotulo: string };
  saindo?: boolean;
}

/** Avisos estilo janela do Windows no canto da tela (toasts). */
@Injectable({ providedIn: 'root' })
export class AvisoService {
  private seq = 0;
  readonly avisos = signal<Aviso[]>([]);

  mostrar(mensagem: string, link?: Aviso['link']): void {
    const id = ++this.seq;
    this.avisos.update((lista) => [...lista, { id, mensagem, link }].slice(-3));
    setTimeout(
      () => this.avisos.update((l) => l.map((a) => (a.id === id ? { ...a, saindo: true } : a))),
      2600,
    );
    setTimeout(() => this.avisos.update((l) => l.filter((a) => a.id !== id)), 2850);
  }
}
