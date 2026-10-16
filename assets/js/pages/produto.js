import { montarLayout, avisar } from '../components/layout.js';
import { cardProduto, ligarBotoesAdicionar, precoHTML } from '../components/card-produto.js';
import { PRODUTOS, RECEITA, getProduto, getCategoria, getSub, formatBRL } from '../data/produtos.js';
import { carrinho, maxParcelas } from '../lib/carrinho.js';
import { arte } from '../lib/arte.js';
import { $, $$, icones } from '../lib/util.js';

montarLayout();

const raiz = $('[data-produto]');
const id = new URLSearchParams(location.search).get('id');
const p = getProduto(id);

if (!p) {
  raiz.innerHTML = `
    <div class="not-found">
      <div class="win">
        <div class="win__bar"><span class="win__title">Erro</span><span class="win__ctls" aria-hidden="true"><span class="win__ctl">×</span></span></div>
        <div class="win__body not-found__body">
          ${icones.info}
          <div><h1 class="not-found__title">Arquivo não encontrado.</h1><p>Esse produto não existe ou saiu do catálogo.</p></div>
        </div>
        <div class="dialog__actions"><a class="win__btn win__btn--link" href="loja.html">Voltar pra loja</a></div>
      </div>
    </div>`;
} else {
  const cat = getCategoria(p.categoria);
  const sub = getSub(p.categoria, p.subcategoria);
  const receita = RECEITA[p.receita];
  const arquivo = `${p.id}.bmp`;
  const vezes = maxParcelas(p.preco);
  const parcela = vezes > 1 ? `ou ${vezes}x de ${formatBRL(p.preco / vezes)} sem juros no cartão` : 'no Pix, cartão ou na entrega';
  document.title = `${p.nome} — pílula*`;

  raiz.innerHTML = `
    <nav class="crumbs" aria-label="Você está em">
      <a href="index.html">C:\\pilula</a><span aria-hidden="true">\\</span>
      <a href="loja.html">loja</a><span aria-hidden="true">\\</span>
      <a href="loja.html?cat=${p.categoria}">${cat.arquivo.replace('.flp', '')}</a><span aria-hidden="true">\\</span>
      ${sub ? `<a href="loja.html?cat=${p.categoria}&amp;sub=${sub.id}">${sub.id}</a><span aria-hidden="true">\\</span>` : ''}
      <span aria-current="page">${p.id}</span>
    </nav>

    <article class="pdp">
      <div class="pdp__media">
        <span class="dither pdp__dither" aria-hidden="true"></span>
        <div class="win">
          <div class="win__bar"><span class="win__title">${arquivo} — visualizador</span><span class="win__ctls" aria-hidden="true"><span class="win__ctl">_</span><span class="win__ctl">□</span><span class="win__ctl">×</span></span></div>
          <div class="win__body pdp__media-inner">
            ${p.selo ? `<span class="pdp__selo badge badge--dark">${p.selo}</span>` : ''}
            <div class="art">${arte(p)}</div>
          </div>
          <div class="win__status"><span>200 × 200 px</span><span>${cat.nome}</span></div>
        </div>
      </div>

      <div class="pdp__info">
        <p class="eyebrow">${cat.nome}${sub ? ` / ${sub.nome}` : ''}</p>
        <div>
          <p class="pdp__brand"><a href="loja.html?marca=${encodeURIComponent(p.marca)}">${p.marca}</a></p>
          <h1 class="pdp__title">${p.nome}</h1>
          <p class="pdp__sub">${p.sub}</p>
        </div>
        <div class="pdp__tags">
          ${p.receita !== 'livre' ? `<span class="tarja">${receita.rotulo}</span>` : `<span class="badge">${receita.rotulo}</span>`}
          <span class="badge badge--blue">entrega em 2h</span>
        </div>

        ${p.receita !== 'livre' ? `
        <div class="pdp__alert" role="note">
          <div><b>Precisa de receita.</b>${receita.aviso} Você pode enviar a foto no carrinho.</div>
        </div>` : ''}

        <div class="pdp__buy">
          ${precoHTML(p)}
          <p class="pdp__pix">${parcela}</p>
          <div class="pdp__row">
            <div class="stepper">
              <button type="button" data-menos aria-label="Diminuir quantidade">–</button>
              <label class="sr-only" for="qtd">Quantidade</label>
              <input id="qtd" type="number" inputmode="numeric" min="1" max="99" value="1">
              <button type="button" data-mais aria-label="Aumentar quantidade">+</button>
            </div>
            <button type="button" class="btn btn--primary" data-comprar>Adicionar ao carrinho</button>
          </div>
          <ul class="pdp__ship">
            <li>chega em até 2h na Grande SP</li>
            <li>frete grátis acima de R$ 99</li>
            <li>dúvida? o farmacêutico responde no chat</li>
          </ul>
        </div>

        <div class="tabs">
          <div class="tabs__list" role="tablist" aria-label="Informações do produto">
            <button class="tabs__tab" role="tab" id="tab-desc" aria-controls="painel-desc" aria-selected="true">Descrição</button>
            <button class="tabs__tab" role="tab" id="tab-uso" aria-controls="painel-uso" aria-selected="false" tabindex="-1">Como usar</button>
            <button class="tabs__tab" role="tab" id="tab-aviso" aria-controls="painel-aviso" aria-selected="false" tabindex="-1">Avisos</button>
          </div>
          <div class="tabs__panel" role="tabpanel" id="painel-desc" aria-labelledby="tab-desc">
            <p>${p.descricao}</p>
            <p>Apresentação: ${p.sub}.</p>
          </div>
          <div class="tabs__panel" role="tabpanel" id="painel-uso" aria-labelledby="tab-uso" hidden>
            <p>Siga a orientação do seu médico ou farmacêutico e leia as instruções da embalagem${cat.id === 'medicamentos' ? ' e a bula' : ''} antes de usar.</p>
          </div>
          <div class="tabs__panel" role="tabpanel" id="painel-aviso" aria-labelledby="tab-aviso" hidden>
            <p>${receita.aviso}</p>
            <p>Mantenha fora do alcance de crianças.</p>
          </div>
        </div>
      </div>
    </article>`;

  // quantidade
  const qtd = $('#qtd');
  const ajustar = (d) => (qtd.value = Math.min(99, Math.max(1, (parseInt(qtd.value, 10) || 1) + d)));
  $('[data-menos]').addEventListener('click', () => ajustar(-1));
  $('[data-mais]').addEventListener('click', () => ajustar(1));
  qtd.addEventListener('change', () => ajustar(0));

  $('[data-comprar]').addEventListener('click', () => {
    const n = parseInt(qtd.value, 10) || 1;
    carrinho.adicionar(p.id, n);
    avisar(`${n}× ${p.nome} no carrinho.`, { link: { href: 'carrinho.html', rotulo: 'ver →' } });
  });

  // abas acessíveis (setas do teclado trocam de aba)
  const abas = $$('[role="tab"]');
  const ativar = (aba) => {
    abas.forEach((a) => {
      const ativa = a === aba;
      a.setAttribute('aria-selected', String(ativa));
      a.tabIndex = ativa ? 0 : -1;
      $('#' + a.getAttribute('aria-controls')).hidden = !ativa;
    });
    aba.focus();
  };
  abas.forEach((a, i) => {
    a.addEventListener('click', () => ativar(a));
    a.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') ativar(abas[(i + 1) % abas.length]);
      if (e.key === 'ArrowLeft') ativar(abas[(i - 1 + abas.length) % abas.length]);
    });
  });

  // relacionados
  const mesmaSub = PRODUTOS.filter((x) => x.subcategoria === p.subcategoria && x.categoria === p.categoria && x.id !== p.id);
  const mesmaCat = PRODUTOS.filter((x) => x.categoria === p.categoria && x.subcategoria !== p.subcategoria);
  const rel = [...mesmaSub, ...mesmaCat].slice(0, 4);
  if (rel.length) {
    const grade = $('[data-relacionados]');
    grade.innerHTML = rel.map(cardProduto).join('');
    ligarBotoesAdicionar(grade);
    $('[data-relacionados-sec]').hidden = false;
  }
}
