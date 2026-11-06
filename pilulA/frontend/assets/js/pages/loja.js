import { $, esc } from '../utils/texto.js';
import { icone } from '../utils/icones.js';
import * as catalogo from '../services/catalogo.js';
import { iniciarLayout, definirTermoBusca, preencherIcones } from '../components/layout.js';
import { cardHtml, ligarCards } from '../components/card.js';

/*
 * Catálogo. Todo o estado dos filtros mora na URL (?cat=&sub=&marca=&q=&ordem=&livre=&oferta=),
 * então dá pra compartilhar o link de uma busca e o botão "voltar" funciona.
 */

await iniciarLayout();
ligarCards();

const ORDENAR = {
  menor: (a, b) => a.preco - b.preco,
  maior: (a, b) => b.preco - a.preco,
  az: (a, b) => a.nome.localeCompare(b.nome, 'pt-BR'),
};

/** Lê e valida os filtros da URL atual. */
function lerFiltros() {
  const u = new URLSearchParams(location.search);
  const cat = catalogo.categoria(u.get('cat')) ? u.get('cat') : 'todos';
  return {
    cat,
    sub: catalogo.sub(cat, u.get('sub')) ? u.get('sub') : '',
    marca: catalogo.marcas().includes(u.get('marca')) ? u.get('marca') : '',
    q: u.get('q') ?? '',
    ordem: ORDENAR[u.get('ordem')] ? u.get('ordem') : 'relevancia',
    livre: u.get('livre') === '1',
    oferta: u.get('oferta') === '1',
  };
}

/**
 * Atualiza um ou mais filtros na URL e redesenha. Trocar de categoria entra no histórico
 * (o "voltar" do navegador volta pra categoria anterior); ordenar/marcar filtros, não.
 */
function filtrar(mudancas, empilhar = false, partirDoZero = false) {
  const u = partirDoZero ? new URLSearchParams() : new URLSearchParams(location.search);
  for (const [chave, valor] of Object.entries(mudancas)) {
    if (
      valor === null ||
      valor === '' ||
      valor === false ||
      valor === 'todos' ||
      valor === 'relevancia'
    )
      u.delete(chave);
    else u.set(chave, valor === true ? '1' : valor);
  }
  const busca = u.toString();
  const url = `${location.pathname}${busca ? `?${busca}` : ''}`;
  history[empilhar ? 'pushState' : 'replaceState'](null, '', url);
  desenhar();
}

const limpar = () => filtrar({}, false, true);

/* ---------------------------------------------------------------- desenho */

function desenhar() {
  const f = lerFiltros();
  const categoria = catalogo.categoria(f.cat);
  const subcategoria = catalogo.sub(f.cat, f.sub);

  // resultado
  let lista = catalogo
    .todosProdutos()
    .filter(
      (p) =>
        (f.cat === 'todos' || p.categoria === f.cat) &&
        (!f.sub || p.subcategoria === f.sub) &&
        (!f.marca || p.marca === f.marca) &&
        (!f.livre || p.receita === 'livre') &&
        (!f.oferta || !!p.precoAntigo),
    );
  if (f.q) lista = catalogo.buscar(f.q, lista);
  if (ORDENAR[f.ordem]) lista = [...lista].sort(ORDENAR[f.ordem]);

  // títulos
  $('#caminho').textContent = [
    'Loja',
    categoria?.nome,
    subcategoria?.nome,
    f.q ? `busca: ${f.q}` : '',
  ]
    .filter(Boolean)
    .join(' › ');
  let cabecalho = f.oferta ? 'Ofertas' : 'Todos os produtos';
  if (categoria)
    cabecalho = subcategoria ? `${categoria.nome} › ${subcategoria.nome}` : categoria.nome;
  if (f.q) cabecalho = `Resultados para “${f.q}”`;
  $('#resultado-titulo').textContent = cabecalho;
  document.title = `${categoria?.nome ?? (f.oferta ? 'Ofertas' : 'Loja')} — pílula*`;
  const n = lista.length;
  $('#contagem').textContent = `${n} ${n === 1 ? 'produto' : 'produtos'}`;
  $('#status-objetos').textContent = `${n} objeto(s)`;
  definirTermoBusca(f.q);

  // controles
  $('#filtro-marca').value = f.marca;
  $('#filtro-ordem').value = f.ordem;
  $('#filtro-livre').checked = f.livre;
  $('#filtro-oferta').checked = f.oferta;
  desenharPastas(f);
  desenharChips(f, categoria, subcategoria);

  // produtos
  $('#resultado').innerHTML = lista.length
    ? lista.map(cardHtml).join('')
    : `
      <div class="win empty__win">
        <div class="win__bar"><span class="win__title">Pesquisar</span></div>
        <div class="win__body empty__body">
          ${icone('info')}
          <div>
            <p class="empty__title">Nenhum produto encontrado.</p>
            <p>Tente outra palavra, tire algum filtro ou fale com o farmacêutico no chat.</p>
          </div>
        </div>
        <div class="dialog__actions"><button type="button" class="win__btn" data-limpar>Limpar filtros</button></div>
      </div>`;
}

function desenharPastas(f) {
  const pasta = (rotulo, n, marcado, valores, sub = false) => `
    <label class="folder${sub ? ' folder--sub' : ''}">
      <input type="radio" name="pasta" data-cat="${esc(valores.cat ?? '')}" data-sub="${esc(valores.sub ?? '')}" ${marcado ? 'checked' : ''}>
      ${icone('pasta')}<span>${esc(rotulo)}</span><span class="folder__n">${n}</span>
    </label>`;
  let html = pasta('Todos os produtos', catalogo.todosProdutos().length, f.cat === 'todos', {});
  for (const c of catalogo.todasCategorias()) {
    html += pasta(c.nome, catalogo.contar(c.id), f.cat === c.id && !f.sub, { cat: c.id });
    if (f.cat === c.id) {
      for (const s of c.subs)
        html += pasta(
          s.nome,
          catalogo.contar(c.id, s.id),
          f.sub === s.id,
          { cat: c.id, sub: s.id },
          true,
        );
    }
  }
  $('#pastas').innerHTML = html;
}

/** Filtros aplicados viram "chips": clicar no × remove aquele filtro. */
function desenharChips(f, categoria, subcategoria) {
  const chips = [];
  if (f.q) chips.push({ rotulo: `Busca: “${f.q}”`, remover: { q: null } });
  if (categoria) chips.push({ rotulo: categoria.nome, remover: { cat: null, sub: null } });
  if (subcategoria) chips.push({ rotulo: subcategoria.nome, remover: { sub: null } });
  if (f.marca) chips.push({ rotulo: `Marca: ${f.marca}`, remover: { marca: null } });
  if (f.livre) chips.push({ rotulo: 'Só sem receita', remover: { livre: null } });
  if (f.oferta) chips.push({ rotulo: 'Em oferta', remover: { oferta: null } });

  const el = $('#chips');
  el.hidden = !chips.length;
  el.innerHTML = chips.length
    ? chips
        .map(
          (c) =>
            `<button type="button" class="chip" data-remover='${esc(JSON.stringify(c.remover))}' aria-label="Remover filtro ${esc(c.rotulo)}">${esc(c.rotulo)} ${icone('fechar')}</button>`,
        )
        .join('') +
      '<button type="button" class="chip chip--limpar" data-limpar>Limpar tudo</button>'
    : '';
  const contador = $('#filtros-n');
  contador.hidden = !chips.length;
  contador.textContent = chips.length;
}

/* ---------------------------------------------------------------- eventos */

$('#filtro-marca').innerHTML += catalogo
  .marcas()
  .map((m) => `<option value="${esc(m)}">${esc(m)}</option>`)
  .join('');

$('#filtro-marca').addEventListener('change', (e) => filtrar({ marca: e.target.value }));
$('#filtro-ordem').addEventListener('change', (e) => filtrar({ ordem: e.target.value }));
$('#filtro-livre').addEventListener('change', (e) => filtrar({ livre: e.target.checked }));
$('#filtro-oferta').addEventListener('change', (e) => filtrar({ oferta: e.target.checked }));

$('#pastas').addEventListener('change', (e) => {
  const r = e.target;
  filtrar({ cat: r.dataset.cat || null, sub: r.dataset.sub || null }, true);
  $(`#pastas input[data-cat="${r.dataset.cat}"][data-sub="${r.dataset.sub}"]`)?.focus();
});

document.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-remover]');
  if (chip) filtrar(JSON.parse(chip.dataset.remover));
  if (e.target.closest('[data-limpar]')) limpar();
});

// no celular, os filtros ficam recolhidos atrás do botão "Filtros"
$('#botao-filtros').addEventListener('click', (e) => {
  const aberto = e.currentTarget.getAttribute('aria-expanded') !== 'true';
  e.currentTarget.setAttribute('aria-expanded', String(aberto));
  $('#explorer-filtros').classList.toggle('is-open', aberto);
});

// busca do cabeçalho enquanto já estamos na loja: nova busca, do zero
window.addEventListener('pl:buscar', (e) => filtrar({ q: e.detail }, true, true));
// voltar/avançar do navegador
window.addEventListener('popstate', desenhar);

desenhar();
preencherIcones();
