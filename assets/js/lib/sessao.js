/* ==========================================================================
   Sessão MOCK (só para o protótipo).
   Usuários ficam no localStorage com a senha guardada como hash SHA-256.
   ⚠ Isso NÃO é segurança de verdade: num sistema real a autenticação
     acontece no back-end (senha com bcrypt/argon2, sessão via cookie HttpOnly).
   ========================================================================== */

const CHAVE_USUARIOS = 'pilula:usuarios:v1';
const CHAVE_SESSAO = 'pilula:sessao:v1';

function ler(chave, padrao) {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? JSON.parse(bruto) : padrao;
  } catch {
    return padrao;
  }
}
function gravar(chave, valor) {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem storage: a sessão dura só esta página */
  }
  window.dispatchEvent(new CustomEvent('sessao:mudou'));
}

async function hash(texto) {
  if (window.crypto?.subtle) {
    const dados = new TextEncoder().encode(texto);
    const buf = await crypto.subtle.digest('SHA-256', dados);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return `plain:${texto.length}`; // fallback para contexto sem HTTPS (só protótipo)
}

const normalizarEmail = (e) => String(e || '').trim().toLowerCase();

export const sessao = {
  atual() {
    return ler(CHAVE_SESSAO, null);
  },

  async cadastrar({ nome, email, cpf, celular, senha }) {
    const usuarios = ler(CHAVE_USUARIOS, {});
    const chave = normalizarEmail(email);
    if (usuarios[chave]) return { ok: false, erro: 'Já existe uma conta com esse e-mail.' };
    usuarios[chave] = { nome: nome.trim(), email: chave, cpf, celular, senha: await hash(senha) };
    gravar(CHAVE_USUARIOS, usuarios);
    gravar(CHAVE_SESSAO, { nome: nome.trim(), email: chave });
    return { ok: true };
  },

  async entrar(email, senha) {
    const usuarios = ler(CHAVE_USUARIOS, {});
    const u = usuarios[normalizarEmail(email)];
    if (!u || u.senha !== (await hash(senha))) return { ok: false, erro: 'E-mail ou senha incorretos.' };
    gravar(CHAVE_SESSAO, { nome: u.nome, email: u.email });
    return { ok: true };
  },

  sair() {
    gravar(CHAVE_SESSAO, null);
  },

  dados() {
    const s = this.atual();
    if (!s) return null;
    const u = ler(CHAVE_USUARIOS, {})[s.email];
    return u ? { nome: u.nome, email: u.email, cpf: u.cpf, celular: u.celular } : s;
  },
};

window.addEventListener('storage', (e) => {
  if (e.key === CHAVE_SESSAO) window.dispatchEvent(new CustomEvent('sessao:mudou'));
});
