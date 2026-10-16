import { montarLayout, avisar } from '../components/layout.js';
import { sessao } from '../lib/sessao.js';
import { $, $$ } from '../lib/util.js';
import { aplicarMascara, cpfValido, emailValido, celularValido, forcaSenha, marcarErro } from '../lib/validacao.js';

montarLayout();

// para onde voltar depois de entrar (ex.: entrar.html?voltar=carrinho.html)
const voltar = (() => {
  const v = new URLSearchParams(location.search).get('voltar') || '';
  return /^[a-z-]+\.html(#[a-z-]+)?$/i.test(v) ? v : 'index.html';
})();

// ---------- abas ----------
const abas = $$('[role="tab"]');
function ativar(aba, focar = true) {
  abas.forEach((a) => {
    const ativa = a === aba;
    a.setAttribute('aria-selected', String(ativa));
    a.tabIndex = ativa ? 0 : -1;
    $('#' + a.getAttribute('aria-controls')).hidden = !ativa;
  });
  if (focar) aba.focus();
}
abas.forEach((a, i) => {
  a.addEventListener('click', () => ativar(a));
  a.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') ativar(abas[(i + 1) % abas.length]);
    if (e.key === 'ArrowLeft') ativar(abas[(i - 1 + abas.length) % abas.length]);
  });
});
if (location.hash === '#criar') ativar($('#tab-criar'), false);

// ---------- mostrar/ocultar senha ----------
$$('[data-mostrar]').forEach((b) =>
  b.addEventListener('click', () => {
    const campo = $('#' + b.dataset.mostrar);
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    b.textContent = mostrar ? 'ocultar' : 'mostrar';
    b.setAttribute('aria-pressed', String(mostrar));
  })
);

// ---------- já logado? ----------
const jaLogado = sessao.atual();
if (jaLogado) {
  const alerta = $('[data-erro-entrar]');
  alerta.hidden = false;
  alerta.classList.add('form-alert--info');
  alerta.textContent = `você já está conectado como ${jaLogado.nome}.`;
}

// ---------- ENTRAR ----------
const formEntrar = $('[data-form-entrar]');
formEntrar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = formEntrar.elements.email;
  const senha = formEntrar.elements.senha;
  const erro = $('[data-erro-entrar]');
  const ok = [
    marcarErro(email, emailValido(email.value) ? '' : 'digite um e-mail válido.'),
    marcarErro(senha, senha.value ? '' : 'digite sua senha.'),
  ].every(Boolean);
  if (!ok) return formEntrar.querySelector('[aria-invalid="true"]').focus();

  const r = await sessao.entrar(email.value, senha.value);
  if (!r.ok) {
    erro.classList.remove('form-alert--info');
    erro.hidden = false;
    erro.textContent = `${r.erro} ainda não tem conta? clica em "Criar conta".`;
    return senha.focus();
  }
  avisar('Conectado! Bem-vindo de volta.');
  setTimeout(() => (location.href = voltar), 700);
});

$('[data-esqueci]').addEventListener('click', () => {
  const email = formEntrar.elements.email.value.trim();
  $('[data-esqueci-msg]').textContent = emailValido(email)
    ? `se existir uma conta para ${email}, enviamos um link de recuperação. (simulado)`
    : 'preenche o e-mail ali em cima que a gente manda o link.';
});

// ---------- CRIAR CONTA ----------
const formCriar = $('[data-form-criar]');
const f = formCriar.elements;
aplicarMascara(f.cpf, 'cpf');
aplicarMascara(f.celular, 'celular');

const barra = $('.strength');
const textoForca = $('[data-forca]');
f.senha.addEventListener('input', () => {
  if (!f.senha.value) {
    barra.dataset.nivel = '0';
    textoForca.textContent = 'mín. 8 caracteres';
    return;
  }
  const { nivel, rotulo } = forcaSenha(f.senha.value);
  barra.dataset.nivel = String(Math.max(1, nivel));
  textoForca.textContent = `força: ${rotulo}${f.senha.value.length < 8 ? ' · mín. 8 caracteres' : ''}`;
});

const regras = {
  nome: (v) => (v.trim().split(/\s+/).length >= 2 ? '' : 'digite nome e sobrenome.'),
  cpf: (v) => (cpfValido(v) ? '' : 'CPF inválido. confere os números.'),
  celular: (v) => (celularValido(v) ? '' : 'celular com DDD, ex.: (11) 91234-5678.'),
  email: (v) => (emailValido(v) ? '' : 'digite um e-mail válido.'),
  senha: (v) => (v.length >= 8 ? '' : 'a senha precisa de pelo menos 8 caracteres.'),
  senha2: (v) => (v && v === f.senha.value ? '' : 'as senhas não batem.'),
};

// valida ao sair do campo (depois do primeiro erro, valida enquanto digita)
Object.keys(regras).forEach((nome) => {
  const campo = f[nome];
  campo.addEventListener('blur', () => campo.value && marcarErro(campo, regras[nome](campo.value)));
  campo.addEventListener('input', () => campo.getAttribute('aria-invalid') && marcarErro(campo, regras[nome](campo.value)));
});

formCriar.addEventListener('submit', async (e) => {
  e.preventDefault();
  const erro = $('[data-erro-criar]');
  const validos = Object.keys(regras).map((nome) => marcarErro(f[nome], regras[nome](f[nome].value)));
  validos.push(marcarErro(f.termos, f.termos.checked ? '' : 'é preciso aceitar os termos para continuar.'));
  if (!validos.every(Boolean)) {
    erro.hidden = false;
    erro.textContent = 'tem campo para corrigir aí em cima.';
    return formCriar.querySelector('[aria-invalid="true"]').focus();
  }
  const r = await sessao.cadastrar({
    nome: f.nome.value,
    email: f.email.value,
    cpf: f.cpf.value,
    celular: f.celular.value,
    senha: f.senha.value,
  });
  if (!r.ok) {
    erro.hidden = false;
    erro.textContent = r.erro;
    return f.email.focus();
  }
  erro.hidden = true;
  avisar(`Conta criada! Olá, ${f.nome.value.trim().split(' ')[0]}.`);
  setTimeout(() => (location.href = voltar), 800);
});
