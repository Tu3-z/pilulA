import { Injectable, computed, signal } from '@angular/core';
import { gravarStorage, lerStorage } from '../utils/texto';

/*
 * Sessão MOCK (só para o protótipo).
 * Usuários ficam no localStorage com a senha guardada como hash SHA-256.
 * ⚠ Isso NÃO é segurança de verdade: num sistema real a autenticação acontece
 *   no back-end (senha com bcrypt/argon2, sessão via cookie HttpOnly).
 */

const CHAVE_USUARIOS = 'pilula:usuarios:v1';
const CHAVE_SESSAO = 'pilula:sessao:v1';

export interface Usuario {
  nome: string;
  email: string;
  cpf: string;
  celular: string;
}
interface UsuarioSalvo extends Usuario {
  senha: string;
}
type Resultado = { ok: true } | { ok: false; erro: string };

async function hash(texto: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${texto.length}`; // contexto sem HTTPS (só protótipo)
}

const normalizarEmail = (e: string) =>
  String(e || '')
    .trim()
    .toLowerCase();

@Injectable({ providedIn: 'root' })
export class SessaoService {
  private readonly sessao = signal<{ nome: string; email: string } | null>(
    lerStorage(CHAVE_SESSAO, null),
  );

  readonly usuario = this.sessao.asReadonly();
  readonly logado = computed(() => !!this.sessao());
  readonly primeiroNome = computed(() => this.sessao()?.nome.split(' ')[0] ?? '');

  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === CHAVE_SESSAO) this.sessao.set(lerStorage(CHAVE_SESSAO, null));
    });
  }

  /** Dados completos do usuário logado (para pré-preencher o checkout). */
  dados(): Usuario | null {
    const s = this.sessao();
    if (!s) return null;
    const u = lerStorage<Record<string, UsuarioSalvo>>(CHAVE_USUARIOS, {})[s.email];
    return u
      ? { nome: u.nome, email: u.email, cpf: u.cpf, celular: u.celular }
      : { ...s, cpf: '', celular: '' };
  }

  async cadastrar(dados: Usuario & { senha: string }): Promise<Resultado> {
    const usuarios = lerStorage<Record<string, UsuarioSalvo>>(CHAVE_USUARIOS, {});
    const email = normalizarEmail(dados.email);
    if (usuarios[email]) return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
    usuarios[email] = {
      nome: dados.nome.trim(),
      email,
      cpf: dados.cpf,
      celular: dados.celular,
      senha: await hash(dados.senha),
    };
    gravarStorage(CHAVE_USUARIOS, usuarios);
    this.abrirSessao({ nome: dados.nome.trim(), email });
    return { ok: true };
  }

  async entrar(email: string, senha: string): Promise<Resultado> {
    const u = lerStorage<Record<string, UsuarioSalvo>>(CHAVE_USUARIOS, {})[normalizarEmail(email)];
    if (!u || u.senha !== (await hash(senha)))
      return { ok: false, erro: 'E-mail ou senha incorretos.' };
    this.abrirSessao({ nome: u.nome, email: u.email });
    return { ok: true };
  }

  sair(): void {
    this.sessao.set(null);
    gravarStorage(CHAVE_SESSAO, null);
  }

  private abrirSessao(s: { nome: string; email: string }): void {
    this.sessao.set(s);
    gravarStorage(CHAVE_SESSAO, s);
  }
}
