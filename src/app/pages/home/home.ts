import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CatalogoService } from '../../core/services/catalogo.service';
import { AvisoService } from '../../core/services/aviso.service';
import { ProdutoCard } from '../../shared/components/produto-card/produto-card';
import { Janela } from '../../shared/components/janela/janela';
import { Icone } from '../../shared/components/icone/icone';
import { Arte } from '../../shared/components/arte/arte';
import { Produto } from '../../core/models/catalogo';
import { Carrossel } from './carrossel/carrossel';

interface Mensagem {
  quem: 'farma' | 'voce';
  texto: string;
}

@Component({
  selector: 'pl-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, ProdutoCard, Janela, Icone, Arte, Carrossel],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomePage {
  protected readonly catalogo = inject(CatalogoService);
  private readonly avisos = inject(AvisoService);

  /** um produto de cada categoria, para ilustrar os cartões (prefere os que têm foto) */
  protected readonly amostras = computed(() => {
    const mapa: Record<string, Produto> = {};
    for (const p of this.catalogo.produtos()) {
      const atual = mapa[p.categoria];
      if (!atual || (!atual.foto && p.foto)) mapa[p.categoria] = p;
    }
    return mapa;
  });

  // ---------- pop-up ----------
  protected readonly bula = signal<'sim' | 'nao' | null>(null);

  // ---------- receita ----------
  protected readonly receita = signal('nenhum arquivo selecionado_');

  protected enviarReceita(evento: Event): void {
    const arquivo = (evento.target as HTMLInputElement).files?.[0];
    if (!arquivo) {
      this.receita.set('nenhum arquivo selecionado_');
      return;
    }
    const kb = Math.max(1, Math.round(arquivo.size / 1024));
    this.receita.set(`${arquivo.name} (${kb} KB) ✓ recebido! a gente te chama no chat.`);
    this.avisos.mostrar('Receita recebida. Um farmacêutico vai conferir.');
  }

  // ---------- chat (simulado) ----------
  protected readonly mensagens = signal<Mensagem[]>([
    { quem: 'farma', texto: 'oiii! sou a Bia, farmacêutica de plantão. como posso ajudar? :)' },
    { quem: 'voce', texto: 'esse protetor serve pra pele oleosa??' },
    { quem: 'farma', texto: 'serve sim! o toque seco é ótimo pra oleosa. quer que eu separe um?' },
  ]);
  protected readonly digitando = signal(false);
  protected readonly campoChat = new FormControl('', { nonNullable: true });

  protected enviarChat(log: HTMLElement): void {
    const texto = this.campoChat.value.trim();
    if (!texto) return;
    this.mensagens.update((m) => [...m, { quem: 'voce', texto }]);
    this.campoChat.reset();
    this.digitando.set(true);
    const rolar = () => requestAnimationFrame(() => (log.scrollTop = log.scrollHeight));
    rolar();
    setTimeout(() => {
      this.digitando.set(false);
      this.mensagens.update((m) => [
        ...m,
        {
          quem: 'farma',
          texto: 'anotado! já já um farmacêutico te responde por aqui. (isto é um protótipo :)',
        },
      ]);
      rolar();
    }, 1400);
  }

  // ---------- newsletter ----------
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly inscrito = signal(false);

  protected assinar(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    this.inscrito.set(true);
  }
}
