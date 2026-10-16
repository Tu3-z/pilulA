import { montarLayout } from '../components/layout.js';
import { cardProduto, ligarBotoesAdicionar } from '../components/card-produto.js';
import { CATEGORIAS, PRODUTOS, MARCAS, getCategoria, getSub, buscarProdutos } from '../data/produtos.js';
import { $, $$, esc, icones } from '../lib/util.js';

montarLayout();
$$('[data-icone]').forEach((el) => (el.innerHTML = icones[el.dataset.icone] || ''));

const grade = $('[data-grade]');
const vazio = $('[data-vazio]');
const status = $('[data-status]');
const titulo = $('[data-titulo]');
const pastas = $('[data-pastas]');
const campoBusca = $('#filtro-q');
const campoOrdem = $('#filtro-ordem');
const campoMarca = $('#filtro-marca');
const soLivre = $('[data-filtro-livre]');
const soOferta = $('[data-filtro-oferta]');

// ---------- estado inicial vindo da URL ----------
const params = new URLSearchParams(location.search);
const estado = {
  cat: getCategoria(params.get('cat')) ? params.get('cat') : 'todos',
  sub: '',
  marca: MARCAS.includes(params.get('marca')) ? params.get('marca') : '',
  q: params.get('q') || '',
  ordem: params.get('ordem') || 'relevancia',
  livre: params.get('livre') === '1',
  oferta: params.get('oferta') === '1',
};
if (estado.cat !== 'todos' && getSub(estado.cat, params.get('sub'))) estado.sub = params.get('sub');

campoMarca.insertAdjacentHTML('beforeend', MARCAS.map((m) => `<option value="${esc(m)}">${esc(m)}</option>`).join(''));
campoBusca.value = estado.q;
campoOrdem.value = estado.ordem;
campoMarca.value = estado.marca;
soLivre.checked = estado.livre;
soOferta.checked = estado.oferta;

// ---------- pastas: categorias + subpastas da categoria aberta ----------
function renderPastas() {
  const opcoes = [{ id: 'todos', nome: 'Todos os produtos' }, ...CATEGORIAS];
  pastas.innerHTML = opcoes.map((c) => {
    const n = c.id === 'todos' ? PRODUTOS.length : PRODUTOS.filter((p) => p.categoria === c.id).length;
    const aberta = c.id === estado.cat && c.subs;
    const subs = aberta
      ? c.subs.map((s) => {
          const ns = PRODUTOS.filter((p) => p.categoria === c.id && p.subcategoria === s.id).length;
          return `<label class="folder folder--sub">
            <input type="radio" name="pasta" value="${c.id}/${s.id}"${estado.sub === s.id ? ' checked' : ''}>
            ${icones.pasta}<span>${s.nome}</span><span class="folder__n" aria-label="${ns} produtos">${ns}</span>
          </label>`;
        }).join('')
      : '';
    return `<label class="folder">
      <input type="radio" name="pasta" value="${c.id}"${c.id === estado.cat && !estado.sub ? ' checked' : ''}>
      ${icones.pasta}<span>${c.nome}</span><span class="folder__n" aria-label="${n} produtos">${n}</span>
    </label>${subs}`;
  }).join('');
}

// ---------- filtrar + ordenar ----------
function filtrar() {
  let lista = PRODUTOS.filter((p) => {
    if (estado.cat !== 'todos' && p.categoria !== estado.cat) return false;
    if (estado.sub && p.subcategoria !== estado.sub) return false;
    if (estado.marca && p.marca !== estado.marca) return false;
    if (estado.livre && p.receita !== 'livre') return false;
    if (estado.oferta && !p.precoAntigo) return false;
    return true;
  });
  if (estado.q) lista = buscarProdutos(estado.q, lista);
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
  if (estado.sub) p.set('sub', estado.sub);
  if (estado.marca) p.set('marca', estado.marca);
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
  const sub = cat ? getSub(cat.id, estado.sub) : null;
  const pasta = cat ? cat.arquivo.replace('.flp', '') : '';
  const caminho = `C:\\pilula\\loja${pasta ? '\\' + pasta : ''}${sub ? '\\' + sub.id : ''}${estado.q ? '\\busca?' + estado.q : ''}`;
  $$('[data-caminho]').forEach((el) => (el.textContent = caminho));

  let t = estado.oferta ? 'Ofertas' : 'Todos os produtos';
  if (cat) t = sub ? `${cat.nome} › ${sub.nome}` : cat.nome;
  if (estado.marca) t += ` · ${estado.marca}`;
  titulo.innerHTML = estado.q ? `Resultados para “${esc(estado.q)}”` : esc(t);

  grade.innerHTML = lista.map(cardProduto).join('');
  vazio.hidden = lista.length > 0;
  status.textContent = `${lista.length} objeto(s)`;
  document.title = `${cat ? cat.nome : estado.oferta ? 'Ofertas' : 'Loja'} — pílula*`;
  renderPastas();
  sincronizarURL();
}

// ---------- eventos ----------
pastas.addEventListener('change', (e) => {
  if (e.target.name !== 'pasta') return;
  const [cat, sub = ''] = e.target.value.split('/');
  estado.cat = cat;
  estado.sub = sub;
  const valor = e.target.value;
  render();
  pastas.querySelector(`input[value="${valor}"]`)?.focus();
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
campoMarca.addEventListener('change', () => { estado.marca = campoMarca.value; render(); });
soLivre.addEventListener('change', () => { estado.livre = soLivre.checked; render(); });
soOferta.addEventListener('change', () => { estado.oferta = soOferta.checked; render(); });

$('[data-limpar]').addEventListener('click', () => {
  Object.assign(estado, { cat: 'todos', sub: '', marca: '', q: '', ordem: 'relevancia', livre: false, oferta: false });
  campoBusca.value = '';
  campoOrdem.value = 'relevancia';
  campoMarca.value = '';
  soLivre.checked = soOferta.checked = false;
  const topo = $('#busca-topo');
  if (topo) topo.value = '';
  render();
});

ligarBotoesAdicionar(grade);
render();
