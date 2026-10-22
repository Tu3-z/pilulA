import { $, param } from '../core/texto.js';
import { emailValido, forcaSenha, ligarMascaras, ligarValidacao } from '../core/validacao.js';
import * as sessao from '../core/sessao.js';
import { avisarNaProximaPagina } from '../core/avisos.js';
import { iniciarLayout } from '../components/layout.js';

/* Entrar / criar conta. entrar.html#criar abre direto na aba de cadastro.
   entrar.html?voltar=carrinho.html volta pra lá depois de entrar. */

await iniciarLayout();

/** Só aceita páginas internas (evita mandar a pessoa para outro site). */
const destino = () => (/^[a-z-]+\.html$/i.test(param('voltar')) ? param('voltar') : 'index.html');

const focarPrimeiroErro = (form) =>
  requestAnimationFrame(() => form.querySelector('[aria-invalid="true"]')?.focus());

/* ---------- abas ---------- */
const abas = [$('#tab-entrar'), $('#tab-criar')];
function selecionar(aba, focar = false) {
  abas.forEach((a) => {
    const ativa = a === aba;
    a.setAttribute('aria-selected', String(ativa));
    a.tabIndex = ativa ? 0 : -1;
    $(`#${a.getAttribute('aria-controls')}`).hidden = !ativa;
  });
  if (focar) aba.focus();
}
abas.forEach((aba) => {
  aba.addEventListener('click', () => selecionar(aba));
  aba.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft')
      selecionar(
        abas.find((a) => a !== aba),
        true,
      );
  });
});
if (location.hash === '#criar') selecionar($('#tab-criar'));

/* ---------- mostrar/ocultar senha ---------- */
document.querySelectorAll('[data-mostrar]').forEach((b) =>
  b.addEventListener('click', () => {
    const campo = $(`#${b.dataset.mostrar}`);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    b.textContent = mostrar ? 'ocultar' : 'mostrar';
    b.setAttribute('aria-pressed', String(mostrar));
  }),
);

/* ================================================================ entrar */
const formLogin = $('#form-login');
const validarLogin = ligarValidacao(formLogin);

const u = sessao.usuario();
if (u) {
  $('#ja-conectado').hidden = false;
  $('#ja-conectado').textContent = `você já está conectado como ${u.nome}.`;
}

formLogin.addEventListener('submit', async (e) => {
  e.preventDefault();
  const erroGeral = $('#erro-login');
  erroGeral.hidden = true;
  if (validarLogin().length) return focarPrimeiroErro(formLogin);
  const r = await sessao.entrar(formLogin.email.value, formLogin.senha.value);
  if (!r.ok) {
    erroGeral.hidden = false;
    erroGeral.textContent = `${r.erro} ainda não tem conta? clica em "Criar conta".`;
    return;
  }
  avisarNaProximaPagina('Conectado! Bem-vindo de volta.');
  location.href = destino();
});

$('#esqueci').addEventListener('click', () => {
  const email = formLogin.email.value.trim();
  $('#msg-esqueci').textContent = emailValido(email)
    ? `se existir uma conta para ${email}, enviamos um link de recuperação. (simulado)`
    : 'preenche o e-mail ali em cima que a gente manda o link.';
});

/* ================================================================ criar conta */
const formCadastro = $('#form-cadastro');
ligarMascaras(formCadastro);
const validarCadastro = ligarValidacao(formCadastro);

// barra de força da senha
formCadastro.senha.addEventListener('input', () => {
  const s = formCadastro.senha.value;
  const { nivel, rotulo } = forcaSenha(s);
  $('#forca').dataset.nivel = s ? Math.max(1, nivel) : 0;
  $('#forca-txt').textContent = s
    ? `força: ${rotulo}${s.length < 8 ? ' · mín. 8 caracteres' : ''}`
    : 'mín. 8 caracteres';
  // se a confirmação já foi digitada, confere de novo
  if (formCadastro.senha2.value)
    formCadastro.senha2.dispatchEvent(new Event('focusout', { bubbles: true }));
});

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();
  const erroGeral = $('#erro-cadastro');
  erroGeral.hidden = true;
  if (validarCadastro().length) {
    erroGeral.hidden = false;
    erroGeral.textContent = 'tem campo para corrigir aí em cima.';
    return focarPrimeiroErro(formCadastro);
  }
  const f = formCadastro.elements;
  const r = await sessao.cadastrar({
    nome: f.nome.value,
    email: f.email.value,
    cpf: f.cpf.value,
    celular: f.celular.value,
    senha: f.senha.value,
  });
  if (!r.ok) {
    erroGeral.hidden = false;
    erroGeral.textContent = r.erro;
    return;
  }
  avisarNaProximaPagina(`Conta criada! Olá, ${f.nome.value.trim().split(' ')[0]}.`);
  location.href = destino();
});
