import { montarLayout } from '../components/layout.js';
import { cardProduto, ligarBotoesAdicionar } from '../components/card-produto.js';
import { CATEGORIAS, PRODUTOS, getCategoria } from '../data/produtos.js';
import { $, $$, esc, icones, normalizar } from '../lib/util.js';

montarLayout();
$$('[data-icone]').forEach((el) => (el.innerHTML = icones[el.dataset.icone] || ''));

const grade = $('[data-grade]');
const vazio = $('[data-vazio]');
const status = $('[data-status]');
const titulo = $('[data-titulo]');
const pastas = $('[data-pastas]');
const campoBusca = $('#filtro-q');
const campoOrdem = $('#filtro-ordem');
const soLivre = $('[data-filtro-livre]');
const soOferta = $('[data-filtro-oferta]');

// ---------- estado inicial vindo da URL (?cat=...&q=...) ----------
const params = new URLSearchParams(location.search);
const estado = {
  cat: getCategoria(params.get('cat')) ? params.get('cat') : 'todos',
  q: params.get('q') || '',
  ordem: params.get('ordem') || 'relevancia',
  livre: params.get('livre') === '1',
  oferta: params.get('oferta') === '1',
};

// ---------- pastas (categorias) ----------
const opcoes = [{ id: 'todos', nome: 'Todos os produtos' }, ...CATEGORIAS];
pastas.innerHTML = opcoes
  .map((c) => {
    const n = c.id === 'todos' ? PRODUTOS.length : PRODUTOS.filter((p) => p.categoria === c.id).length;
    return `<label class="folder">
      <input type="radio" name="cat" value="${c.id}"${c.id === estado.cat ? ' checked' : ''}>
      ${icones.pasta}<span>${c.nome}</span><span class="folder__n" aria-label="${n} produtos">${n}</span>
    </label>`;
  })
  .join('');

campoBusca.value = estado.q;
campoOrdem.value = estado.ordem;
soLivre.checked = estado.livre;
soOferta.checked = estado.oferta;

// ---------- filtrar + ordenar ----------
function filtrar() {
  const termo = normalizar(estado.q);
  let lista = PRODUTOS.filter((p) => {
    if (estado.cat !== 'todos' && p.categoria !== estado.cat) return false;
    if (estado.livre && p.receita !== 'livre') return false;
    if (estado.oferta && !p.precoAntigo) return false;
    if (termo) {
      const alvo = normalizar(`${p.nome} ${p.sub} ${p.descricao} ${getCategoria(p.categoria)?.nome}`);
      return termo.split(/\s+/).every((t) => alvo.includes(t));
    }
    return true;
  });
  const ordenar = {
    menor: (a, b) => a.preco - b.preco,
    maior: (a, b) => b.preco - a.preco,
    az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
  }[estado.ordem];
  if (ordenar) lista = [...lista].sort(ordenar);
  return lista;
}

function sincronizarURL() {
  const p = new URLSearchParams();
  if (estado.cat !== 'todos') p.set('cat', estado.cat);
  if (estado.q) p.set('q', estado.q);
  if (estado.ordem !== 'relevancia') p.set('ordem', estado.ordem);
  if (estado.livre) p.set('livre', '1');
  if (estado.oferta) p.set('oferta', '1');
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
}

function render() {
  const lista = filtrar();
  const cat = getCategoria(estado.cat);
  const pasta = cat ? cat.arquivo.replace('.flp', '') : '';
  const caminho = `C:\\pilula\\loja${pasta ? '\\' + pasta : ''}${estado.q ? '\\busca?' + estado.q : ''}`;
  $$('[data-caminho]').forEach((el) => (el.textContent = caminho));

  titulo.innerHTML = estado.q
    ? `Resultados para “${esc(estado.q)}”`
    : cat ? esc(cat.nome) : 'Todos os produtos';

  grade.innerHTML = lista.map(cardProduto).join('');
  vazio.hidden = lista.length > 0;
  status.textContent = `${lista.length} objeto(s)`;
  document.title = `${cat ? cat.nome : 'Loja'} — pílula*`;
  sincronizarURL();
}

// ---------- eventos ----------
pastas.addEventListener('change', (e) => {
  if (e.target.name === 'cat') {
    estado.cat = e.target.value;
    render();
  }
});

let atraso;
campoBusca.addEventListener('input', () => {
  clearTimeout(atraso);
  atraso = setTimeout(() => {
    estado.q = campoBusca.value.trim();
    render();
  }, 180);
});
$('[data-filtros]').addEventListener('submit', (e) => e.preventDefault());
campoOrdem.addEventListener('change', () => { estado.ordem = campoOrdem.value; render(); });
soLivre.addEventListener('change', () => { estado.livre = soLivre.checked; render(); });
soOferta.addEventListener('change', () => { estado.oferta = soOferta.checked; render(); });

$('[data-limpar]').addEventListener('click', () => {
  Object.assign(estado, { cat: 'todos', q: '', ordem: 'relevancia', livre: false, oferta: false });
  campoBusca.value = '';
  campoOrdem.value = 'relevancia';
  soLivre.checked = soOferta.checked = false;
  $$('input[name="cat"]', pastas).forEach((r) => (r.checked = r.value === 'todos'));
  const topo = $('#busca-topo');
  if (topo) topo.value = '';
  render();
});

ligarBotoesAdicionar(grade);
render();
