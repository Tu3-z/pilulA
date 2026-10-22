import { gravarStorage, lerStorage } from './texto.js';

/*
 * Sessão MOCK (só para o protótipo).
 * Usuários ficam no localStorage com a senha guardada como hash SHA-256.
 * ⚠ Isso NÃO é segurança de verdade: num sistema real a autenticação acontece
 *   no back-end (senha com bcrypt/argon2, sessão via cookie HttpOnly).
 */

const CHAVE_USUARIOS = 'pilula:usuarios:v1';
const CHAVE_SESSAO = 'pilula:sessao:v1';
const eventos = new EventTarget();

async function hash(texto) {
  if (globalThis.crypto?.subtle) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${texto.length}`; // contexto sem HTTPS (só protótipo)
}

const normalizarEmail = (e) =>
  String(e || '')
    .trim()
    .toLowerCase();

let sessao = lerStorage(CHAVE_SESSAO, null);

window.addEventListener('storage', (e) => {
  if (e.key === CHAVE_SESSAO) {
    sessao = lerStorage(CHAVE_SESSAO, null);
    eventos.dispatchEvent(new Event('mudou'));
  }
});

function abrirSessao(dados) {
  sessao = dados;
  gravarStorage(CHAVE_SESSAO, dados);
  eventos.dispatchEvent(new Event('mudou'));
}

export const aoMudar = (fn) => eventos.addEventListener('mudou', fn);
export const usuario = () => sessao;
export const logado = () => !!sessao;
export const primeiroNome = () => sessao?.nome.split(' ')[0] ?? '';

/** Dados completos do usuário logado (para pré-preencher o checkout). */
export function dados() {
  if (!sessao) return null;
  const u = lerStorage(CHAVE_USUARIOS, {})[sessao.email];
  return u
    ? { nome: u.nome, email: u.email, cpf: u.cpf, celular: u.celular }
    : { ...sessao, cpf: '', celular: '' };
}

export async function cadastrar({ nome, email, cpf, celular, senha }) {
  const usuarios = lerStorage(CHAVE_USUARIOS, {});
  const chave = normalizarEmail(email);
  if (usuarios[chave]) return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
  usuarios[chave] = { nome: nome.trim(), email: chave, cpf, celular, senha: await hash(senha) };
  gravarStorage(CHAVE_USUARIOS, usuarios);
  abrirSessao({ nome: nome.trim(), email: chave });
  return { ok: true };
}

export async function entrar(email, senha) {
  const u = lerStorage(CHAVE_USUARIOS, {})[normalizarEmail(email)];
  if (!u || u.senha !== (await hash(senha)))
    return { ok: false, erro: 'E-mail ou senha incorretos.' };
  abrirSessao({ nome: u.nome, email: u.email });
  return { ok: true };
}

export function sair() {
  sessao = null;
  gravarStorage(CHAVE_SESSAO, null);
  eventos.dispatchEvent(new Event('mudou'));
}
