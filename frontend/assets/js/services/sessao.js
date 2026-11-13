import { gravarStorage, lerStorage } from '../utils/texto.js';

/*
 * Sessão do usuário, ligada na API do back-end (Spring Boot + tabela `usuario` no Supabase).
 *
 *   cadastrar → POST /api/auth/cadastrar   entrar → POST /api/auth/entrar
 *
 * As duas devolvem o usuário + um token JWT. O token fica guardado no navegador e vai no
 * cabeçalho "Authorization: Bearer ..." das rotas que exigem login (ver `comToken`).
 * A senha nunca fica no navegador: quem guarda (como hash BCrypt) é o back-end.
 *
 * A URL da API é lida de window.APP_CONFIG.apiUrl, definida em assets/js/config.js.
 * Isso evita ter a URL hardcoded aqui e facilita a troca entre ambiente local e produção.
 */

/** Lê a URL base da API de config.js; se não existir, cai no localhost para dev local. */
const BASE_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');

export const URL_AUTH = `${BASE_URL}/api/auth`;
const CHAVE_SESSAO = 'pilula:sessao:v2';
const eventos = new EventTarget();

// a versão antiga (v1) guardava contas falsas no navegador; não servem mais
try {
  localStorage.removeItem('pilula:usuarios:v1');
  localStorage.removeItem('pilula:sessao:v1');
} catch {
  /* navegador sem localStorage: nada a limpar */
}

let sessao = lerStorage(CHAVE_SESSAO, null);

window.addEventListener('storage', (e) => {
  if (e.key === CHAVE_SESSAO) {
    sessao = lerStorage(CHAVE_SESSAO, null);
    eventos.dispatchEvent(new Event('mudou'));
  }
});

function abrirSessao(u) {
  sessao = {
    id: u.id,
    nome: u.nome,
    email: u.email,
    cpf: u.cpf ?? '',
    celular: u.celular ?? '',
    perfil: u.perfil ?? 'COMPRADOR',
    token: u.token,
  };
  gravarStorage(CHAVE_SESSAO, sessao);
  eventos.dispatchEvent(new Event('mudou'));
}

export const aoMudar = (fn) => eventos.addEventListener('mudou', fn);
export const usuario = () => sessao;
export const logado = () => !!sessao;
export const primeiroNome = () => sessao?.nome.split(' ')[0] ?? '';
export const token = () => sessao?.token ?? null;

/** Cabeçalhos para chamar uma rota protegida da API. */
export const comToken = (extra = {}) =>
  sessao?.token ? { ...extra, Authorization: `Bearer ${sessao.token}` } : extra;

/** Dados completos do usuário logado (para pré-preencher o checkout). */
export function dados() {
  if (!sessao) return null;
  const { nome, email, cpf, celular } = sessao;
  return { nome, email, cpf, celular };
}

/** POST com JSON. Devolve { ok, status, corpo } ou { ok:false, status:0 } se a API não respondeu. */
async function postar(rota, corpo) {
  try {
    const r = await fetch(`${URL_AUTH}/${rota}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    });
    return { ok: r.ok, status: r.status, corpo: await r.json().catch(() => null) };
  } catch (e) {
    console.warn('[sessao] API fora do ar:', e.message);
    return { ok: false, status: 0, corpo: null };
  }
}

const FORA_DO_AR =
  'não consegui falar com o servidor. a API está rodando? (mvnw spring-boot:run na pasta backend)';

/** Junta as mensagens de validação do back-end (400) numa frase só. */
function mensagemDeErro(r, padrao) {
  if (r.status === 0) return FORA_DO_AR;
  const erros = r.corpo?.erros;
  if (erros && Object.keys(erros).length)
    return Object.entries(erros)
      .map(([campo, msg]) => `${campo}: ${msg}`)
      .join(' · ');
  return r.corpo?.detail || r.corpo?.message || r.corpo?.mensagem || padrao;
}

export async function cadastrar({ nome, email, cpf, celular, senha }) {
  const r = await postar('cadastrar', { nome, email, cpf, celular, senha });
  if (r.ok) {
    abrirSessao(r.corpo);
    return { ok: true };
  }
  if (r.status === 409) return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
  return { ok: false, erro: mensagemDeErro(r, 'não deu pra criar a conta agora.') };
}

export async function entrar(email, senha) {
  const r = await postar('entrar', { email, senha });
  if (r.ok) {
    abrirSessao(r.corpo);
    return { ok: true };
  }
  if (r.status === 401)
    return {
      ok: false,
      erro: 'E-mail ou senha incorretos. ainda não tem conta? clica em "Criar conta".',
    };
  return { ok: false, erro: mensagemDeErro(r, 'não deu pra entrar agora.') };
}

export function sair() {
  sessao = null;
  gravarStorage(CHAVE_SESSAO, null);
  eventos.dispatchEvent(new Event('mudou'));
}

/*
 * Ao abrir o site, confere se o token guardado ainda vale (expira em 24h).
 * Se a API disser 401, encerra a sessão. Se a API estiver fora do ar, mantém como está.
 */
if (sessao?.token) {
  fetch(`${URL_AUTH}/eu`, { headers: comToken() })
    .then(async (r) => {
      if (r.status === 401) {
        sair();
        return;
      }
      if (!r.ok) return;
      const atual = await r.json();
      if (atual.perfil && atual.perfil !== sessao?.perfil) {
        sessao = { ...sessao, perfil: atual.perfil };
        gravarStorage(CHAVE_SESSAO, sessao);
        eventos.dispatchEvent(new Event('mudou'));
      }
    })
    .catch(() => {});
}
