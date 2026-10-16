import { montarLayout } from '../components/layout.js';
import { formatBRL } from '../data/produtos.js';
import { carrinho, FRETE_GRATIS_A_PARTIR } from '../lib/carrinho.js';
import { arte } from '../lib/arte.js';
import { $, $$, icones } from '../lib/util.js';

montarLayout();
$$('[data-icone]').forEach((el) => (el.innerHTML = icones[el.dataset.icone] || ''));

const elVazio = $('[data-vazio]');
const elCheio = $('[data-cheio]');
const linhas = $('[data-linhas]');
const resumo = $('[data-resumo]');
const status = $('[data-status]');
const msgCupom = $('[data-cupom-msg]');
const blocoReceita = $('[data-receita]');
const inputReceita = $('[data-receita-input]');
const statusReceita = $('[data-receita-status]');
const form = $('[data-checkout]');
const erro = $('[data-erro]');
const dialogo = $('[data-confirmacao]');

let receitaAnexada = false;

function linhaHTML({ produto: p, qtd }) {
  return `
  <li class="line" data-id="${p.id}">
    <div class="art">${arte(p)}</div>
    <div class="line__info">
      <a class="line__name" href="produto.html?id=${p.id}">${p.nome}</a>
      <span class="line__sub">${p.sub}</span>
      ${p.receita === 'retencao' ? '<span class="tarja">tarja vermelha</span>' : ''}
    </div>
    <p class="line__price">${formatBRL(p.preco * qtd)}<span class="line__unit">${qtd} × ${formatBRL(p.preco)}</span></p>
    <div class="stepper">
      <button type="button" data-acao="menos" aria-label="Diminuir quantidade de ${p.nome}">–</button>
      <label class="sr-only" for="q-${p.id}">Quantidade de ${p.nome}</label>
      <input id="q-${p.id}" type="number" inputmode="numeric" min="1" max="99" value="${qtd}" data-acao="definir">
      <button type="button" data-acao="mais" aria-label="Aumentar quantidade de ${p.nome}">+</button>
    </div>
    <button type="button" class="line__rm" data-acao="remover">remover</button>
  </li>`;
}

function render() {
  const r = carrinho.resumo();
  const vazio = r.itens.length === 0;
  elVazio.hidden = !vazio;
  elCheio.hidden = vazio;
  if (vazio) return;

  // guarda o foco para não perder ao redesenhar
  const focado = document.activeElement;
  const chaveFoco = focado && focado.closest('.line') ? [focado.closest('.line').dataset.id, focado.dataset.acao] : null;

  linhas.innerHTML = r.itens.map(linhaHTML).join('');
  const n = carrinho.quantidade();
  $('[data-qtd-itens]').textContent = `${n} ${n === 1 ? 'item' : 'itens'}`;

  if (chaveFoco) {
    const alvo = linhas.querySelector(`[data-id="${chaveFoco[0]}"] [data-acao="${chaveFoco[1]}"]`);
    if (alvo) alvo.focus();
  }

  // frete grátis
  const pct = Math.round(r.progressoFrete * 100);
  $('[data-frete-texto]').textContent = r.freteGratis
    ? 'frete grátis desbloqueado ✱'
    : `faltam ${formatBRL(r.faltaParaFrete)} para o frete grátis`;
  $('[data-frete-barra]').setAttribute('aria-valuenow', String(pct));
  $('[data-frete-fill]').style.width = `${pct}%`;

  // resumo
  const cupom = carrinho.cupom();
  resumo.innerHTML = `
    <dt>Subtotal</dt><dd>${formatBRL(r.subtotal)}</dd>
    ${cupom ? `<dt class="is-discount">Cupom ${cupom.codigo}</dt><dd class="is-discount">− ${formatBRL(r.desconto)}</dd>` : ''}
    <dt>Frete</dt><dd>${r.frete === 0 ? 'grátis' : formatBRL(r.frete)}</dd>
    <dt class="is-total">Total</dt><dd class="is-total">${formatBRL(r.total)}</dd>`;
  $('[data-total-botao]').textContent = formatBRL(r.total);

  if (cupom) {
    msgCupom.className = 'coupon__msg term is-ok';
    msgCupom.innerHTML = `${cupom.codigo} aplicado: ${cupom.descricao}. <button type="button" data-tirar-cupom>remover</button>`;
  }

  blocoReceita.hidden = !r.exigeReceita;
  status.textContent = r.freteGratis ? 'pronto. frete grátis.' : `pronto. frete grátis a partir de ${formatBRL(FRETE_GRATIS_A_PARTIR)}.`;
}

// ---------- ações nas linhas ----------
linhas.addEventListener('click', (e) => {
  const botao = e.target.closest('button[data-acao]');
  if (!botao) return;
  const id = botao.closest('.line').dataset.id;
  const atual = carrinho.itens().find((i) => i.produto.id === id)?.qtd || 0;
  if (botao.dataset.acao === 'mais') carrinho.definir(id, atual + 1);
  if (botao.dataset.acao === 'menos') carrinho.definir(id, Math.max(1, atual - 1));
  if (botao.dataset.acao === 'remover') {
    const nome = botao.closest('.line').querySelector('.line__name').textContent;
    carrinho.remover(id);
    status.textContent = `${nome} removido.`;
    $('#cupom')?.focus();
  }
});
linhas.addEventListener('change', (e) => {
  if (e.target.dataset.acao !== 'definir') return;
  const id = e.target.closest('.line').dataset.id;
  carrinho.definir(id, Math.max(1, parseInt(e.target.value, 10) || 1));
});

// ---------- cupom ----------
$('[data-cupom-form]').addEventListener('submit', (e) => {
  e.preventDefault();
  const campo = $('#cupom');
  if (carrinho.aplicarCupom(campo.value)) {
    campo.value = '';
  } else {
    msgCupom.className = 'coupon__msg term is-err';
    msgCupom.textContent = 'cupom inválido. tenta PILULA10 ;)';
  }
});
msgCupom.addEventListener('click', (e) => {
  if (e.target.matches('[data-tirar-cupom]')) {
    carrinho.removerCupom();
    msgCupom.className = 'coupon__msg term';
    msgCupom.textContent = 'cupom removido.';
  }
});

// ---------- receita ----------
inputReceita.addEventListener('change', () => {
  const f = inputReceita.files && inputReceita.files[0];
  receitaAnexada = !!f;
  statusReceita.textContent = f ? `${f.name} ✓ anexada` : 'nenhum arquivo_';
  statusReceita.classList.toggle('is-ok', !!f);
});

// ---------- CEP com máscara ----------
$('#cep').addEventListener('input', (e) => {
  const d = e.target.value.replace(/\D/g, '').slice(0, 8);
  e.target.value = d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
});

// ---------- finalizar ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const problemas = [];
  $$('input[required]', form).forEach((campo) => {
    const ok = campo.checkValidity() && campo.value.trim() !== '';
    campo.setAttribute('aria-invalid', String(!ok));
    if (!ok) problemas.push(campo);
  });
  const r = carrinho.resumo();
  if (r.exigeReceita && !receitaAnexada) problemas.push(inputReceita);

  if (problemas.length) {
    const nomes = problemas.map((c) => (c === inputReceita ? 'receita' : form.querySelector(`label[for="${c.id}"]`).textContent.toLowerCase()));
    erro.textContent = `falta preencher: ${nomes.join(', ')}.`;
    erro.hidden = false;
    (problemas[0] === inputReceita ? inputReceita : problemas[0]).focus();
    return;
  }

  erro.hidden = true;
  $('[data-pedido]').textContent = `nº ${String(Math.floor(Math.random() * 900000) + 100000)}`;
  carrinho.limpar();
  form.reset();
  receitaAnexada = false;
  if (typeof dialogo.showModal === 'function') dialogo.showModal();
});

window.addEventListener('carrinho:mudou', render);
render();
