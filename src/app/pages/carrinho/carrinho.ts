import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  of,
  switchMap,
  timeout,
} from 'rxjs';
import {
  CarrinhoService,
  FRETE_GRATIS_A_PARTIR,
  maxParcelas,
} from '../../core/services/carrinho.service';
import { SessaoService } from '../../core/services/sessao.service';
import { AvisoService } from '../../core/services/aviso.service';
import { Validadores, bandeira, mensagemDeErro } from '../../core/utils/validacao';
import { Arte } from '../../shared/components/arte/arte';
import { Janela } from '../../shared/components/janela/janela';
import { Icone } from '../../shared/components/icone/icone';
import { ErroCampo } from '../../shared/components/erro-campo/erro-campo';
import { Mascara } from '../../shared/directives/mascara';

interface ViaCep {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
}

/** nomes legíveis para o resumo de erros */
const NOMES: Record<string, string> = {
  nome: 'nome',
  cpf: 'CPF',
  celular: 'celular',
  cep: 'CEP',
  numero: 'número',
  rua: 'rua',
  bairro: 'bairro',
  cidade: 'cidade',
  ccNumero: 'número do cartão',
  ccNome: 'nome no cartão',
  ccValidade: 'validade',
  ccCvv: 'CVV',
};

@Component({
  selector: 'pl-carrinho',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, CurrencyPipe, Arte, Janela, Icone, ErroCampo, Mascara],
  templateUrl: './carrinho.html',
  styleUrl: './carrinho.css',
})
export class CarrinhoPage {
  protected readonly carrinho = inject(CarrinhoService);
  protected readonly sessao = inject(SessaoService);
  private readonly avisos = inject(AvisoService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly FRETE_GRATIS = FRETE_GRATIS_A_PARTIR;
  protected readonly V = Validadores;

  // ================================================================ formulário
  protected readonly form = this.fb.group({
    dados: this.fb.group({
      nome: ['', [Validadores.obrigatorio('nome e sobrenome.'), Validadores.nomeCompleto]],
      cpf: ['', [Validadores.obrigatorio('CPF obrigatório.'), Validadores.cpf]],
      celular: ['', [Validadores.obrigatorio('celular com DDD.'), Validadores.celular]],
    }),
    entrega: this.fb.group({
      modo: ['entrega' as 'entrega' | 'retirada'],
      cep: ['', [Validadores.obrigatorio('CEP obrigatório.'), Validadores.cep]],
      numero: ['', Validadores.obrigatorio()],
      rua: ['', Validadores.obrigatorio()],
      complemento: [''],
      bairro: ['', Validadores.obrigatorio()],
      cidade: ['', Validadores.obrigatorio()],
    }),
    pagamento: this.fb.group({
      forma: ['pix' as 'pix' | 'cartao' | 'entrega'],
      ccNumero: [
        { value: '', disabled: true },
        [Validadores.obrigatorio('número do cartão.'), Validadores.cartao],
      ],
      ccNome: [{ value: '', disabled: true }, Validadores.obrigatorio('como está no cartão.')],
      ccValidade: [
        { value: '', disabled: true },
        [Validadores.obrigatorio('MM/AA.'), Validadores.validade],
      ],
      ccCvv: [
        { value: '', disabled: true },
        [Validadores.obrigatorio('3 ou 4 dígitos.'), Validadores.cvv],
      ],
      parcelas: [1],
      naEntrega: ['maquininha' as 'maquininha' | 'dinheiro'],
      troco: [''],
    }),
  });

  private readonly f = {
    ...this.form.controls.dados.controls,
    ...this.form.controls.entrega.controls,
    ...this.form.controls.pagamento.controls,
  };

  /** qualquer mudança no formulário (valor, status, touched) reavalia a tela */
  private readonly eventos = toSignal(this.form.events);
  protected readonly enviado = signal(false);

  protected readonly modo = toSignal(this.f.modo.valueChanges, { initialValue: this.f.modo.value });
  protected readonly forma = toSignal(this.f.forma.valueChanges, {
    initialValue: this.f.forma.value,
  });
  protected readonly naEntrega = toSignal(this.f.naEntrega.valueChanges, {
    initialValue: this.f.naEntrega.value,
  });

  // ================================================================ totais
  protected readonly r = computed(() => this.carrinho.resumo(this.modo() === 'retirada'));
  protected readonly opcoesParcela = computed(() => {
    const total = this.r().total;
    return Array.from({ length: maxParcelas(total) }, (_, i) => ({
      n: i + 1,
      valor: total / (i + 1),
    }));
  });
  protected readonly progresso = computed(() =>
    this.r().retirada ? 100 : Math.round(this.r().progressoFrete * 100),
  );

  // ================================================================ receita
  protected readonly receita = signal<string | null>(null);

  // ================================================================ CEP (ViaCEP)
  protected readonly statusCep = signal('digita o CEP que a gente completa o resto');

  // ================================================================ prévia do cartão
  private readonly ccNumero = toSignal(this.f.ccNumero.valueChanges, { initialValue: '' });
  protected readonly ccNome = toSignal(
    this.f.ccNome.valueChanges.pipe(map((v) => v.toUpperCase())),
    { initialValue: '' },
  );
  protected readonly ccValidade = toSignal(this.f.ccValidade.valueChanges, { initialValue: '' });
  protected readonly ccBandeira = computed(() => bandeira(this.ccNumero()));
  protected readonly ccMascarado = computed(() => {
    const d = this.ccNumero().replace(/\D/g, '');
    return (d + '•'.repeat(16 - d.length)).replace(/(.{4})(?=.)/g, '$1 ');
  });

  // ================================================================ etapas
  protected readonly etapa = signal(0);
  protected readonly etapas = [
    { id: 'etapa-itens', rotulo: 'Carrinho' },
    { id: 'etapa-dados', rotulo: 'Seus dados' },
    { id: 'etapa-entrega', rotulo: 'Entrega' },
    { id: 'etapa-pagamento', rotulo: 'Pagamento' },
  ];

  /** etapa completa = grupo do formulário válido (o carrinho conta se tiver itens) */
  protected etapaOk(i: number): boolean {
    this.eventos();
    if (i === 0) return this.r().itens.length > 0;
    // só marca ✓ depois que a pessoa passou pela etapa (senão "Pagamento" já nasce completo com Pix)
    if (!this.visitadas().has(i) && !this.enviado()) return false;
    const grupos = [
      this.form.controls.dados,
      this.form.controls.entrega,
      this.form.controls.pagamento,
    ];
    return grupos[i - 1].valid;
  }
  private readonly visitadas = signal(new Set<number>());

  // ================================================================ confirmação
  private readonly dialogo = viewChild<ElementRef<HTMLDialogElement>>('dialogo');
  protected readonly confirmacao = signal<{
    numero: number;
    texto: string;
    pix: boolean;
    total: number;
  } | null>(null);
  protected readonly qrPix = computed(() => {
    const c = this.confirmacao();
    return c?.pix ? this.sanitizer.bypassSecurityTrustHtml(qrFake(c.numero)) : null;
  });
  protected readonly pixTimer = signal('30:00');
  private timerPix?: ReturnType<typeof setInterval>;

  constructor() {
    // campos de endereço só valem para entrega em casa; os do cartão, só para cartão
    this.f.modo.valueChanges.pipe(takeUntilDestroyed()).subscribe((m) => {
      for (const c of [
        this.f.cep,
        this.f.numero,
        this.f.rua,
        this.f.complemento,
        this.f.bairro,
        this.f.cidade,
      ]) {
        m === 'retirada' ? c.disable({ emitEvent: false }) : c.enable({ emitEvent: false });
      }
    });
    this.f.forma.valueChanges.pipe(takeUntilDestroyed()).subscribe((fp) => {
      for (const c of [this.f.ccNumero, this.f.ccNome, this.f.ccValidade, this.f.ccCvv]) {
        fp === 'cartao' ? c.enable({ emitEvent: false }) : c.disable({ emitEvent: false });
      }
    });

    // parcelas nunca passam do máximo permitido pelo total
    effect(() => {
      const max = this.opcoesParcela().length;
      if (untracked(() => this.f.parcelas.value) > max) this.f.parcelas.setValue(max);
    });

    // logado? pré-preenche os dados
    effect(() => {
      this.sessao.usuario();
      const u = untracked(() => this.sessao.dados());
      if (!u) return;
      const d = this.form.controls.dados.controls;
      if (!d.nome.value) d.nome.setValue(u.nome);
      if (!d.cpf.value && u.cpf) d.cpf.setValue(u.cpf);
      if (!d.celular.value && u.celular) d.celular.setValue(u.celular);
    });

    // CEP com 8 dígitos → busca o endereço no ViaCEP (API pública)
    this.f.cep.valueChanges
      .pipe(
        map((v) => v.replace(/\D/g, '')),
        distinctUntilChanged(),
        filter((cep) => cep.length === 8),
        debounceTime(150),
        switchMap((cep) => {
          this.statusCep.set('buscando endereço…');
          return this.http.get<ViaCep>(`https://viacep.com.br/ws/${cep}/json/`).pipe(
            timeout(5000),
            catchError(() => of(null)), // sem internet / API fora do ar
          );
        }),
        takeUntilDestroyed(),
      )
      .subscribe((d) => {
        if (!d) {
          this.statusCep.set('sem conexão com o ViaCEP. preenche à mão.');
          return;
        }
        if (d.erro) {
          this.statusCep.set('CEP não encontrado. preenche à mão.');
          return;
        }
        this.form.controls.entrega.patchValue({
          rua: d.logradouro || this.f.rua.value,
          bairro: d.bairro || this.f.bairro.value,
          cidade: d.localidade ? `${d.localidade} / ${d.uf}` : this.f.cidade.value,
        });
        this.statusCep.set('✓ endereço encontrado');
        this.host.nativeElement.querySelector<HTMLInputElement>('#numero')?.focus();
      });
  }

  // ================================================================ helpers do template

  /** mensagem de erro de um campo, só depois de mexer nele ou tentar finalizar */
  protected erro(nome: keyof typeof this.f): string | null {
    this.eventos();
    const c: AbstractControl = this.f[nome];
    return c.invalid && (c.touched || this.enviado()) ? mensagemDeErro(c) : null;
  }

  protected mudarQtd(id: string, qtd: number): void {
    this.carrinho.definir(id, Math.max(1, qtd || 1));
  }

  protected remover(id: string, nome: string): void {
    const qtd = this.carrinho.qtdDe(id);
    this.carrinho.remover(id);
    // remoção sem confirmação, mas com "Desfazer" (mais rápido e evita erro de clique)
    this.avisos.mostrar(`${nome} removido do carrinho.`, undefined, {
      rotulo: 'Desfazer',
      executar: () => this.carrinho.adicionar(id, qtd),
    });
  }

  protected readonly msgCupom = signal<{ texto: string; ok: boolean } | null>(null);
  protected aplicarCupom(campo: HTMLInputElement): void {
    if (this.carrinho.aplicarCupom(campo.value)) {
      campo.value = '';
      this.msgCupom.set(null);
    } else {
      this.msgCupom.set({ texto: 'cupom inválido. tenta PILULA10 ;)', ok: false });
    }
  }
  protected tirarCupom(): void {
    this.carrinho.removerCupom();
    this.msgCupom.set({ texto: 'cupom removido.', ok: true });
  }

  protected anexarReceita(e: Event): void {
    const arq = (e.target as HTMLInputElement).files?.[0];
    this.receita.set(arq ? arq.name : null);
  }

  protected focarEtapa(e: FocusEvent): void {
    const bloco = (e.target as HTMLElement).closest<HTMLElement>('[data-etapa]');
    if (!bloco) return;
    const n = Number(bloco.dataset['etapa']);
    this.etapa.set(n);
    if (!this.visitadas().has(n)) this.visitadas.update((v) => new Set(v).add(n));
  }

  // ================================================================ finalizar

  protected readonly resumoErros = signal<string | null>(null);

  protected finalizar(): void {
    this.enviado.set(true);
    this.form.markAllAsTouched();

    const invalidos = Object.entries(this.f)
      .filter(([, c]) => c.enabled && c.invalid)
      .map(([n]) => NOMES[n] ?? n);
    const faltaReceita = this.r().exigeReceita && !this.receita();
    if (faltaReceita) invalidos.push('receita');

    if (invalidos.length) {
      this.resumoErros.set(`falta corrigir: ${invalidos.join(', ')}.`);
      requestAnimationFrame(() => {
        const alvo =
          faltaReceita && invalidos.length === 1 ? '#receita' : '[aria-invalid="true"], #receita';
        this.host.nativeElement.querySelector<HTMLElement>(alvo)?.focus();
      });
      return;
    }
    this.resumoErros.set(null);

    const r = this.r();
    const numero = Math.floor(Math.random() * 900000) + 100000;
    const quando = r.retirada
      ? 'Fica pronto pra retirada em até 30 min.'
      : 'Chega em até 2h no endereço informado.';
    const pg = this.form.controls.pagamento.getRawValue();
    let texto: string;
    if (pg.forma === 'pix') {
      texto = `Total ${fmt(r.total)}. Pague com o Pix abaixo para liberar a separação. ${quando}`;
    } else if (pg.forma === 'cartao') {
      const fim = pg.ccNumero.replace(/\D/g, '').slice(-4);
      texto = `Pagamento aprovado (simulado) no ${bandeira(pg.ccNumero) || 'cartão'} final ${fim}: ${pg.parcelas}x de ${fmt(r.total / pg.parcelas)} sem juros. ${quando}`;
    } else {
      const dinheiro = pg.naEntrega === 'dinheiro';
      texto = `Total ${fmt(r.total)}, pago na entrega ${dinheiro ? `em dinheiro${pg.troco ? ` (troco para ${pg.troco})` : ''}` : 'no cartão (maquininha)'}. ${quando}`;
    }

    this.confirmacao.set({ numero, texto, pix: pg.forma === 'pix', total: r.total });
    if (pg.forma === 'pix') this.iniciarTimer();
    this.carrinho.limpar();
    this.receita.set(null);
    this.dialogo()?.nativeElement.showModal();
  }

  protected codigoPix(): string {
    const c = this.confirmacao();
    return c ? `PILULA-PIX-SIMULADO-${c.numero}-${c.total.toFixed(2)}` : '';
  }

  protected async copiarPix(campo: HTMLInputElement): Promise<void> {
    try {
      await navigator.clipboard.writeText(campo.value);
      this.avisos.mostrar('Código Pix copiado.');
    } catch {
      campo.select();
    }
  }

  private iniciarTimer(): void {
    clearInterval(this.timerPix);
    let resta = 30 * 60;
    const tick = () => {
      this.pixTimer.set(
        `${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`,
      );
      if (resta-- <= 0) clearInterval(this.timerPix);
    };
    tick();
    this.timerPix = setInterval(tick, 1000);
  }

  protected fecharDialogo(): void {
    clearInterval(this.timerPix);
  }
}

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);

/** QR code DECORATIVO (padrão aleatório com os "olhos" de canto). Não é um Pix real. */
function qrFake(semente: number): string {
  const n = 25;
  let s = semente;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const olho = (x: number, y: number) =>
    `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FBFAF5"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const reservado = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let mods = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (!reservado(x, y) && rand() > 0.52)
        mods += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" role="img" aria-label="QR code ilustrativo"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#FBFAF5"/><g fill="#121216">${olho(0, 0)}${olho(n - 7, 0)}${olho(0, n - 7)}${mods}</g></svg>`;
}
