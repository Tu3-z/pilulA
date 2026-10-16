import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SessaoService } from '../../core/services/sessao.service';
import { AvisoService } from '../../core/services/aviso.service';
import { Validadores, emailValido, forcaSenha, mensagemDeErro } from '../../core/utils/validacao';
import { Janela } from '../../shared/components/janela/janela';
import { ErroCampo } from '../../shared/components/erro-campo/erro-campo';
import { Mascara } from '../../shared/directives/mascara';

type Aba = 'entrar' | 'criar';

@Component({
  selector: 'pl-entrar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Janela, ErroCampo, Mascara],
  templateUrl: './entrar.html',
  styleUrl: './entrar.css',
})
export class EntrarPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly sessao = inject(SessaoService);
  private readonly avisos = inject(AvisoService);

  /** ?voltar=/carrinho → volta pra lá depois de entrar (só caminhos internos) */
  readonly voltar = input<string>('');
  private destino(): string {
    const v = this.voltar();
    return /^\/[a-z-]*$/i.test(v) ? v : '/';
  }

  protected readonly aba = signal<Aba>(location.hash === '#criar' ? 'criar' : 'entrar');
  protected readonly abas: { id: Aba; rotulo: string }[] = [
    { id: 'entrar', rotulo: 'Entrar' },
    { id: 'criar', rotulo: 'Criar conta' },
  ];
  protected readonly mostrar = signal<Record<string, boolean>>({});

  // ================================================================ entrar
  protected readonly login = this.fb.group({
    email: ['', [Validadores.obrigatorio('digite seu e-mail.'), Validadores.email]],
    senha: ['', Validadores.obrigatorio('digite sua senha.')],
  });
  private readonly eventosLogin = toSignal(this.login.events);
  protected readonly erroLogin = signal<string | null>(null);
  protected readonly msgEsqueci = signal('');

  // ================================================================ criar conta
  protected readonly cadastro = this.fb.group(
    {
      nome: ['', [Validadores.obrigatorio('digite nome e sobrenome.'), Validadores.nomeCompleto]],
      cpf: ['', [Validadores.obrigatorio('CPF obrigatório.'), Validadores.cpf]],
      celular: ['', [Validadores.obrigatorio('celular com DDD.'), Validadores.celular]],
      email: ['', [Validadores.obrigatorio('digite seu e-mail.'), Validadores.email]],
      senha: ['', [Validadores.obrigatorio('crie uma senha.'), Validadores.senha]],
      senha2: ['', Validadores.obrigatorio('repita a senha.')],
      termos: [false, Validadores.obrigatorio('é preciso aceitar os termos para continuar.')],
      ofertas: [false],
    },
    { validators: Validadores.iguais('senha', 'senha2') },
  );
  private readonly eventosCadastro = toSignal(this.cadastro.events);
  protected readonly erroCadastro = signal<string | null>(null);

  private readonly senha = toSignal(this.cadastro.controls.senha.valueChanges, {
    initialValue: '',
  });
  protected readonly forca = computed(() => {
    const s = this.senha();
    if (!s) return { nivel: 0, texto: 'mín. 8 caracteres' };
    const { nivel, rotulo } = forcaSenha(s);
    return {
      nivel: Math.max(1, nivel),
      texto: `força: ${rotulo}${s.length < 8 ? ' · mín. 8 caracteres' : ''}`,
    };
  });

  // ================================================================ helpers

  protected erro(form: 'login' | 'cadastro', campo: string): string | null {
    (form === 'login' ? this.eventosLogin : this.eventosCadastro)();
    const grupo: AbstractControl = this[form];
    const c = grupo.get(campo);
    return c && c.invalid && c.touched ? mensagemDeErro(c) : null;
  }

  protected alternarSenha(id: string): void {
    this.mostrar.update((m) => ({ ...m, [id]: !m[id] }));
  }

  protected teclaAba(e: KeyboardEvent): void {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const prox: Aba = this.aba() === 'entrar' ? 'criar' : 'entrar';
    this.aba.set(prox);
    this.host.nativeElement.querySelector<HTMLElement>(`#tab-${prox}`)?.focus();
  }

  private focarPrimeiroErro(): void {
    requestAnimationFrame(() =>
      this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );
  }

  // ================================================================ ações

  protected async entrar(): Promise<void> {
    this.login.markAllAsTouched();
    if (this.login.invalid) return this.focarPrimeiroErro();
    const { email, senha } = this.login.getRawValue();
    const r = await this.sessao.entrar(email, senha);
    if (!r.ok) {
      this.erroLogin.set(`${r.erro} ainda não tem conta? clica em "Criar conta".`);
      return;
    }
    this.avisos.mostrar('Conectado! Bem-vindo de volta.');
    this.router.navigateByUrl(this.destino());
  }

  protected esqueci(): void {
    const email = this.login.controls.email.value.trim();
    this.msgEsqueci.set(
      emailValido(email)
        ? `se existir uma conta para ${email}, enviamos um link de recuperação. (simulado)`
        : 'preenche o e-mail ali em cima que a gente manda o link.',
    );
  }

  protected async criar(): Promise<void> {
    this.cadastro.markAllAsTouched();
    this.cadastro.updateValueAndValidity();
    if (this.cadastro.invalid) {
      this.erroCadastro.set('tem campo para corrigir aí em cima.');
      return this.focarPrimeiroErro();
    }
    const v = this.cadastro.getRawValue();
    const r = await this.sessao.cadastrar({
      nome: v.nome,
      email: v.email,
      cpf: v.cpf,
      celular: v.celular,
      senha: v.senha,
    });
    if (!r.ok) {
      this.erroCadastro.set(r.erro);
      return;
    }
    this.avisos.mostrar(`Conta criada! Olá, ${v.nome.trim().split(' ')[0]}.`);
    this.router.navigateByUrl(this.destino());
  }
}
