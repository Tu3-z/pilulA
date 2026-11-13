import { $, esc } from '../utils/texto.js';
import * as sessao from '../services/sessao.js';
import { iniciarLayout } from '../components/layout.js';

await iniciarLayout();

const API_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');
const status = $('#status');
const tabela = $('#usuarios');

async function carregarUsuarios() {
  if (!sessao.logado()) {
    status.textContent = 'Entre com uma conta administradora para continuar.';
    status.insertAdjacentHTML('beforeend', ' <a href="entrar.html?voltar=admin.html">Entrar</a>');
    return;
  }
  if (sessao.usuario()?.perfil !== 'ADMIN') {
    status.textContent = 'Acesso restrito a administradores.';
    return;
  }

  try {
    const resposta = await fetch(`${API_URL}/api/admin/usuarios`, { headers: sessao.comToken() });
    const usuarios = await resposta.json();
    if (!resposta.ok) throw new Error(usuarios?.detail || 'Não foi possível carregar as contas.');
    tabela.innerHTML = usuarios.map((usuario) => `
      <tr data-id="${usuario.id}">
        <td>${esc(usuario.nome)}</td>
        <td>${esc(usuario.email)}</td>
        <td>
          <label class="sr-only" for="perfil-${usuario.id}">Perfil de ${esc(usuario.nome)}</label>
          <select class="field panel__role" id="perfil-${usuario.id}" name="perfil">
            ${['COMPRADOR', 'VENDEDOR', 'ADMIN'].map((perfil) => `<option value="${perfil}"${perfil === usuario.perfil ? ' selected' : ''}>${perfil.toLowerCase()}</option>`).join('')}
          </select>
        </td>
        <td><button class="win__btn" type="button" data-salvar>Salvar</button></td>
      </tr>`).join('');
    status.textContent = `${usuarios.length} contas. Perfis de admin e vendedor são atribuídos somente por esta área.`;
  } catch (erro) {
    status.textContent = erro.message;
  }
}

tabela.addEventListener('click', async (evento) => {
  const botao = evento.target.closest('[data-salvar]');
  if (!botao) return;
  const linha = botao.closest('tr');
  botao.disabled = true;
  try {
    const resposta = await fetch(`${API_URL}/api/admin/usuarios/${linha.dataset.id}/perfil`, {
      method: 'PATCH',
      headers: sessao.comToken({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ perfil: linha.querySelector('[name="perfil"]').value }),
    });
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new Error(dados?.detail || 'Não foi possível alterar o perfil.');
    status.textContent = `Perfil de ${dados.nome} atualizado para ${dados.perfil.toLowerCase()}.`;
    await carregarUsuarios();
  } catch (erro) {
    status.textContent = erro.message;
  } finally {
    botao.disabled = false;
  }
});

await carregarUsuarios();
