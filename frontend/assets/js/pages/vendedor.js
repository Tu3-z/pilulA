import { $, esc, formatBRL } from '../utils/texto.js';
import * as sessao from '../services/sessao.js';
import { iniciarLayout } from '../components/layout.js';

await iniciarLayout();

const API_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');
const form = $('#produto-form');
const tabela = $('#produtos');
const status = $('#status');
let produtos = [];
let categorias = [];

function preencherSubcategorias(categoriaSlug, selecionada = '') {
  const categoria = categorias.find((item) => item.slug === categoriaSlug);
  const campo = form.elements.subcategoria;
  campo.innerHTML = `<option value="">Sem subcategoria</option>${(categoria?.subs ?? []).map((sub) => `<option value="${esc(sub.slug)}">${esc(sub.nome)}</option>`).join('')}`;
  campo.value = selecionada;
}

function limparFormulario() {
  form.reset();
  form.elements.id.value = '';
  $('#produto-form-titulo').textContent = 'Novo produto';
  $('#salvar').textContent = 'Salvar produto';
  preencherSubcategorias(form.elements.categoria.value);
}

function editar(produto) {
  for (const chave of ['id', 'slug', 'nome', 'marca', 'sub', 'categoria', 'preco', 'precoAntigo', 'receita', 'destaque', 'selo', 'descricao', 'foto', 'ordem']) {
    const campo = form.elements[chave];
    if (campo) campo.type === 'checkbox' ? campo.checked = Boolean(produto[chave]) : campo.value = produto[chave] ?? '';
  }
  form.elements.forma.value = produto.arte?.forma ?? '';
  form.elements.rotulo.value = produto.arte?.rotulo ?? '';
  preencherSubcategorias(produto.categoria, produto.subcategoria ?? '');
  $('#produto-form-titulo').textContent = `Editar: ${produto.nome}`;
  $('#salvar').textContent = 'Atualizar produto';
  $('#conteudo').scrollIntoView({ behavior: 'smooth' });
}

async function carregar() {
  if (!sessao.logado()) {
    status.textContent = 'Entre com uma conta vendedora para continuar.';
    status.insertAdjacentHTML('beforeend', ' <a href="entrar.html?voltar=vendedor.html">Entrar</a>');
    return;
  }
  if (!['VENDEDOR', 'ADMIN'].includes(sessao.usuario()?.perfil)) {
    status.textContent = 'Acesso restrito a vendedores e administradores.';
    return;
  }

  try {
    const [resProdutos, resCategorias] = await Promise.all([
      fetch(`${API_URL}/api/vendedor/produtos`, { headers: sessao.comToken() }),
      fetch(`${API_URL}/api/categorias`),
    ]);
    const [listaProdutos, listaCategorias] = await Promise.all([resProdutos.json(), resCategorias.json()]);
    if (!resProdutos.ok || !resCategorias.ok) throw new Error('Não foi possível carregar o catálogo.');
    produtos = listaProdutos;
    categorias = listaCategorias;
    form.elements.categoria.innerHTML = categorias.map((categoria) => `<option value="${esc(categoria.slug)}">${esc(categoria.nome)}</option>`).join('');
    preencherSubcategorias(form.elements.categoria.value);
    tabela.innerHTML = produtos.map((produto) => `
      <tr data-id="${produto.id}">
        <td>${esc(produto.nome)}<span class="panel__sub">${esc(produto.slug)}</span></td>
        <td>${esc(produto.categoria)}</td>
        <td>${formatBRL(produto.preco)}</td>
        <td><div class="panel__actions"><button class="win__btn" type="button" data-editar>Editar</button><button class="win__btn" type="button" data-remover>Remover</button></div></td>
      </tr>`).join('');
    status.textContent = `${produtos.length} produtos no catálogo.`;
  } catch (erro) {
    status.textContent = erro.message;
  }
}

form.elements.categoria.addEventListener('change', () => preencherSubcategorias(form.elements.categoria.value));
$('#limpar').addEventListener('click', limparFormulario);

form.addEventListener('submit', async (evento) => {
  evento.preventDefault();
  if (!form.reportValidity()) return;
  const f = form.elements;
  const id = f.id.value;
  const dados = {
    slug: f.slug.value.trim(),
    nome: f.nome.value.trim(),
    marca: f.marca.value.trim(),
    sub: f.sub.value.trim(),
    categoria: f.categoria.value,
    subcategoria: f.subcategoria.value || null,
    preco: Number(f.preco.value),
    precoAntigo: f.precoAntigo.value ? Number(f.precoAntigo.value) : null,
    receita: f.receita.value,
    destaque: f.destaque.checked,
    selo: f.selo.value.trim(),
    descricao: f.descricao.value.trim(),
    forma: f.forma.value,
    rotulo: f.rotulo.value.trim(),
    foto: f.foto.value.trim(),
    ordem: f.ordem.value ? Number(f.ordem.value) : null,
  };
  try {
    const resposta = await fetch(`${API_URL}/api/vendedor/produtos${id ? `/${id}` : ''}`, {
      method: id ? 'PUT' : 'POST',
      headers: sessao.comToken({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(dados),
    });
    const resultado = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new Error(resultado?.detail || 'Não foi possível salvar o produto.');
    status.textContent = `Produto ${resultado.nome} salvo.`;
    limparFormulario();
    await carregar();
  } catch (erro) {
    status.textContent = erro.message;
  }
});

tabela.addEventListener('click', async (evento) => {
  const linha = evento.target.closest('tr[data-id]');
  if (!linha) return;
  const produto = produtos.find((item) => item.id === Number(linha.dataset.id));
  if (evento.target.closest('[data-editar]')) return editar(produto);
  if (!evento.target.closest('[data-remover]') || !window.confirm(`Remover ${produto.nome} do catálogo?`)) return;
  try {
    const resposta = await fetch(`${API_URL}/api/vendedor/produtos/${produto.id}`, {
      method: 'DELETE',
      headers: sessao.comToken(),
    });
    if (!resposta.ok) throw new Error('Não foi possível remover o produto.');
    status.textContent = `${produto.nome} removido.`;
    await carregar();
  } catch (erro) {
    status.textContent = erro.message;
  }
});

await carregar();
