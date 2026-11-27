/* ==============================================================================
 * CONTROLADOR DE PÁGINA: admin.js (Painel Administrativo e Farmacêutico)
 * ==============================================================================
 * Centraliza o gerenciamento de permissões e o fluxo de auditoria de receitas.
 * 
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 1. Segurança e Autenticação Prévia:
 *    - Verifica se o usuário atual possui token válido e perfil estrito 'ADMIN'.
 *    - Se for comprador comum ou não logado, bloqueia o acesso à interface.
 * 
 * 2. Gestão de Contas e RBAC:
 *    - Permite promover usuários ou alterar perfis (COMPRADOR, VENDEDOR, ADMIN).
 * 
 * 3. Mesa de Revisão Farmacêutica (Receitas Médicas):
 *    - Exibe fila de pedidos com prescrições anexadas pelo cliente.
 *    - Badge de contagem em tempo real com pedidos aguardando análise (PENDENTE).
 *    - Modal interativo com visualização da receita, campo para justificativa/observações
 *      técnicas do farmacêutico e ações diretas de Aprovação ou Recusa via PATCH /api/admin/receitas/{id}.
 * ============================================================================== */

import { $, esc } from '../utils/texto.js';
import * as sessao from '../services/sessao.js';
import { iniciarLayout } from '../components/layout.js';

await iniciarLayout();

const API_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');
const status = $('#status');
const tabela = $('#usuarios');
const painelContas = $('#painel-contas');
const painelReceitas = $('#painel-receitas');
const badgePendentes = $('#badge-pendentes');
const recStatus = $('#rec-status');
const gridReceitas = $('#receitas-grid');

// Modal de receita
const modal = $('#receita-modal');
const modalImg = $('#modal-img');
const modalObs = $('#modal-obs');
const modalAprovar = $('#modal-aprovar');
const modalRejeitar = $('#modal-rejeitar');
const modalFechar = $('#modal-fechar');
const modalRes = $('#modal-res');
let receitaAtualId = null;

// Cache de receitas
let listaReceitas = [];
let filtroAtivo = 'PENDENTE';

// -------------------------------------------------------------
// CONTROLE DE ABAS
// -------------------------------------------------------------
document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('admin-tab--active'));
    tab.classList.add('admin-tab--active');

    const aba = tab.dataset.aba;
    if (aba === 'contas') {
      painelContas.hidden = false;
      painelReceitas.hidden = true;
    } else if (aba === 'receitas') {
      painelContas.hidden = true;
      painelReceitas.hidden = false;
      carregarReceitas();
    }
  });
});

// -------------------------------------------------------------
// ABA 1: GERENCIAMENTO DE CONTAS
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// ABA 2: REVISÃO DE RECEITAS MÉDICAS
// -------------------------------------------------------------
async function carregarReceitas() {
  recStatus.textContent = 'Carregando receitas…';
  gridReceitas.innerHTML = '';

  try {
    const resposta = await fetch(`${API_URL}/api/admin/receitas`, { headers: sessao.comToken() });
    if (!resposta.ok) throw new Error('Não foi possível carregar a lista de receitas.');
    listaReceitas = await resposta.json();

    // Atualiza badge de pendentes
    const qtdPendentes = listaReceitas.filter((r) => r.receitaStatus === 'PENDENTE').length;
    if (qtdPendentes > 0) {
      badgePendentes.textContent = qtdPendentes;
      badgePendentes.hidden = false;
    } else {
      badgePendentes.hidden = true;
    }

    renderizarGridReceitas();
  } catch (erro) {
    recStatus.textContent = erro.message;
  }
}

function renderizarGridReceitas() {
  const filtradas = filtroAtivo === 'TODAS'
    ? listaReceitas
    : listaReceitas.filter((r) => r.receitaStatus === filtroAtivo);

  recStatus.textContent = `${filtradas.length} receita(s) ${filtroAtivo === 'TODAS' ? 'no total' : `com status ${filtroAtivo.toLowerCase()}`}.`;

  if (filtradas.length === 0) {
    gridReceitas.innerHTML = `<p class="receitas-vazio">Nenhuma receita encontrada para este filtro.</p>`;
    return;
  }

  gridReceitas.innerHTML = filtradas.map((r) => {
    const isPdf = r.receitaUrl?.toLowerCase().includes('.pdf');
    const fotoHtml = isPdf
      ? `<div class="receita-card__foto receita-card__foto--pdf" title="Arquivo PDF">📄 PDF</div>`
      : `<img class="receita-card__foto" src="${esc(r.receitaUrl)}" alt="Receita médica de ${esc(r.nomeComprador)}" loading="lazy">`;

    return `
      <article class="receita-card" data-id="${r.id}">
        ${fotoHtml}
        <div class="receita-card__info">
          <span class="receita-card__status receita-card__status--${esc(r.receitaStatus)}">${esc(r.receitaStatus)}</span>
          <h3 class="receita-card__nome">${esc(r.nomeComprador)}</h3>
          <p class="receita-card__email">${esc(r.emailComprador)}</p>
          <p class="panel__sub">Pedido: <code>#${esc(r.referencia?.slice(0, 8))}</code></p>
          ${r.receitaObs ? `<p class="panel__sub" style="margin-top:4px"><em>Obs: ${esc(r.receitaObs)}</em></p>` : ''}
          <div style="margin-top:12px">
            <button class="receita-card__btn" type="button" data-revisar="${r.id}">
              🔍 Revisar receita
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// Filtros da aba de receitas
document.querySelectorAll('[data-filtro]').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-filtro]').forEach((b) => b.classList.remove('receitas-filtro--active'));
    btn.classList.add('receitas-filtro--active');
    filtroAtivo = btn.dataset.filtro;
    renderizarGridReceitas();
  });
});

// Abrir modal de revisão
gridReceitas.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-revisar]');
  if (!btn) return;
  const id = Number(btn.dataset.revisar);
  const r = listaReceitas.find((item) => item.id === id);
  if (!r) return;

  receitaAtualId = id;
  modalImg.src = r.receitaUrl || '';
  modalObs.value = r.receitaObs || '';
  modalRes.textContent = '';
  modalAprovar.disabled = false;
  modalRejeitar.disabled = false;

  modal.showModal();
});

modalFechar?.addEventListener('click', () => modal.close());

// Fechar ao clicar no backdrop
modal?.addEventListener('click', (e) => {
  if (e.target === modal) modal.close();
});

// Ações no modal
async function avaliarReceita(status) {
  if (!receitaAtualId) return;
  modalAprovar.disabled = true;
  modalRejeitar.disabled = true;
  modalRes.textContent = 'Enviando avaliação…';

  try {
    const resposta = await fetch(`${API_URL}/api/admin/receitas/${receitaAtualId}`, {
      method: 'PATCH',
      headers: sessao.comToken({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        status,
        obs: modalObs.value.trim() || (status === 'APROVADA' ? 'Receita conferida e aprovada pelo farmacêutico.' : 'Receita ilegível ou inválida.'),
      }),
    });

    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new Error(dados?.detail || 'Erro ao avaliar receita.');

    modalRes.textContent = `Receita ${status.toLowerCase()} com sucesso!`;
    setTimeout(() => {
      modal.close();
      carregarReceitas();
    }, 700);
  } catch (err) {
    modalRes.textContent = err.message;
    modalAprovar.disabled = false;
    modalRejeitar.disabled = false;
  }
}

modalAprovar?.addEventListener('click', () => avaliarReceita('APROVADA'));
modalRejeitar?.addEventListener('click', () => avaliarReceita('REJEITADA'));

// Inicialização
await carregarUsuarios();
// Busca receitas em segundo plano para o badge
fetch(`${API_URL}/api/admin/receitas`, { headers: sessao.comToken() })
  .then((res) => (res.ok ? res.json() : []))
  .then((dados) => {
    listaReceitas = dados;
    const qtd = dados.filter((r) => r.receitaStatus === 'PENDENTE').length;
    if (qtd > 0) {
      badgePendentes.textContent = qtd;
      badgePendentes.hidden = false;
    }
  })
  .catch(() => {});
