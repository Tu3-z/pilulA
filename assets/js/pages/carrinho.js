import { montarLayout, avisar } from '../components/layout.js';
import { formatBRL } from '../data/produtos.js';
import { carrinho, FRETE_GRATIS_A_PARTIR, maxParcelas } from '../lib/carrinho.js';
import { sessao } from '../lib/sessao.js';
import { arte } from '../lib/arte.js';
import { $, $$, icones } from '../lib/util.js';
import {
  aplicarMascara, cpfValido, celularValido, cepValido, luhn, bandeira, validadeOk, marcarErro,
} from '../lib/validacao.js';

montarLayout();
$$('[data-icone]').forEach((el) => (el.innerHTML = icones[el.dataset.icone] || ''));

const elVazio = $('[data-vazio]');
const elCheio = $('[data-cheio]');
const linhas = $('[data-linhas]');
const resumoEl = $('[data-resumo]');
const status = $('[data-status]');
const msgCupom = $('[data-cupom-msg]');
const blocoReceita = $('[data-receita]');
const inputReceita = $('[data-receita-input]');
const statusReceita = $('[data-receita-status]');
const form = $('[data-checkout]');
const f = form.elements;
const erro = $('[data-erro]');
const dialogo = $('[data-confirmacao]');

let receitaAnexada = false;
const modo = () => form.querySelector('input[name="modo"]:checked').value;
const pagamento = () => form.querySelector('input[name="pagamento"]:checked').value;

/* ================================================================ itens + resumo */

function linhaHTML({ produto: p, qtd }) {
  return `
  <li class="line" data-id="${p.id}">
    <div class="art">${arte(p)}</div>
    <div class="line__info">
      <span class="line__brand">${p.marca}</span>
      <a class="line__name" href="produto.html?id=${p.id}">${p.nome}</a>
      <span class="line__sub">${p.sub}</span>
      ${p.receita !== 'livre' ? '<span class="tarja">tarja vermelha</span>' : ''}
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

function renderParcelas(total) {
  const sel = $('[data-parcelas]');
  const atual = Number(sel.value) || 1;
  const max = maxParcelas(total);
  sel.innerHTML = Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    return `<option value="${n}">${n}x de ${formatBRL(total / n)} sem juros${n === 1 ? ' (à vista)' : ''}</option>`;
  }).join('');
  sel.value = String(Math.min(atual, max));
}

function render() {
  const r = carrinho.resumo({ retirada: modo() === 'retirada' });
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
  if (chaveFoco) linhas.querySelector(`[data-id="${chaveFoco[0]}"] [data-acao="${chaveFoco[1]}"]`)?.focus();

  // frete grátis
  const pct = r.retirada ? 100 : Math.round(r.progressoFrete * 100);
  $('[data-frete-texto]').textContent = r.retirada
    ? 'retirada na loja: sem frete ✱'
    : r.freteGratis ? 'frete grátis desbloqueado ✱' : `faltam ${formatBRL(r.faltaParaFrete)} para o frete grátis`;
  $('[data-frete-barra]').setAttribute('aria-valuenow', String(pct));
  $('[data-frete-fill]').style.width = `${pct}%`;

  // resumo
  const cupom = carrinho.cupom();
  resumoEl.innerHTML = `
    <dt>Subtotal (${n} ${n === 1 ? 'item' : 'itens'})</dt><dd>${formatBRL(r.subtotal)}</dd>
    ${cupom ? `<dt class="is-discount">Cupom ${cupom.codigo}</dt><dd class="is-discount">− ${formatBRL(r.desconto)}</dd>` : ''}
    <dt>${r.retirada ? 'Retirada' : 'Entrega'}</dt><dd>${r.frete === 0 ? 'grátis' : formatBRL(r.frete)}</dd>
    <dt class="is-total">Total</dt><dd class="is-total">${formatBRL(r.total)}</dd>`;
  $('[data-total-botao]').textContent = formatBRL(r.total);
  renderParcelas(r.total);

  if (cupom) {
    msgCupom.className = 'coupon__msg term is-ok';
    msgCupom.innerHTML = `${cupom.codigo} aplicado: ${cupom.descricao}. <button type="button" data-tirar-cupom>remover</button>`;
  }

  blocoReceita.hidden = !r.exigeReceita;
  status.textContent = r.freteGratis || r.retirada ? 'pronto. sem frete.' : `pronto. frete grátis a partir de ${formatBRL(FRETE_GRATIS_A_PARTIR)}.`;
}

/* ================================================================ eventos do carrinho */

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
  carrinho.definir(e.target.closest('.line').dataset.id, Math.max(1, parseInt(e.target.value, 10) || 1));
});

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

inputReceita.addEventListener('change', () => {
  const arq = inputReceita.files && inputReceita.files[0];
  receitaAnexada = !!arq;
  statusReceita.textContent = arq ? `${arq.name} ✓ anexada` : 'nenhum arquivo_';
  statusReceita.classList.toggle('is-ok', !!arq);
});

/* ================================================================ dados do cliente */

aplicarMascara(f.cpf, 'cpf');
aplicarMascara(f.celular, 'celular');
aplicarMascara(f.cep, 'cep');
aplicarMascara(f.ccNumero, 'cartao');
aplicarMascara(f.ccValidade, 'validade');
aplicarMascara(f.ccCvv, 'cvv');

function preencherComSessao() {
  const u = sessao.dados();
  $('[data-login-hint]').hidden = !!u;
  if (!u) return;
  if (!f.nome.value) f.nome.value = u.nome || '';
  if (!f.cpf.value && u.cpf) f.cpf.value = u.cpf;
  if (!f.celular.value && u.celular) f.celular.value = u.celular;
}
preencherComSessao();
window.addEventListener('sessao:mudou', preencherComSessao);

/* ================================================================ entrega + CEP */

const blocoEndereco = $('[data-endereco]');
const blocoLoja = $('[data-loja]');
form.addEventListener('change', (e) => {
  if (e.target.name === 'modo') {
    const retirada = modo() === 'retirada';
    blocoEndereco.hidden = retirada;
    blocoLoja.hidden = !retirada;
    render();
  }
  if (e.target.name === 'pagamento') {
    $$('[data-painel]').forEach((p) => (p.hidden = p.dataset.painel !== pagamento()));
  }
  if (e.target.name === 'naEntrega') {
    $('[data-troco]').hidden = e.target.value !== 'dinheiro';
  }
});

const statusCep = $('[data-cep-status]');
let ultimoCep = '';
f.cep.addEventListener('input', async () => {
  const cep = f.cep.value.replace(/\D/g, '');
  if (cep.length !== 8 || cep === ultimoCep) return;
  ultimoCep = cep;
  statusCep.textContent = 'buscando endereço…';
  try {
    // ViaCEP: API pública e gratuita de CEPs
    const resp = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: AbortSignal.timeout(5000) });
    const dados = await resp.json();
    if (dados.erro) throw new Error('nao-encontrado');
    f.rua.value = dados.logradouro || f.rua.value;
    f.bairro.value = dados.bairro || f.bairro.value;
    f.cidade.value = dados.localidade ? `${dados.localidade} / ${dados.uf}` : f.cidade.value;
    statusCep.textContent = '✓ endereço encontrado';
    marcarErro(f.cep, '');
    f.numero.focus();
  } catch (err) {
    statusCep.textContent = err.message === 'nao-encontrado'
      ? 'CEP não encontrado. preenche à mão.'
      : 'sem conexão com o ViaCEP. preenche à mão.';
  }
});

/* ================================================================ cartão (prévia ao vivo) */

const prev = {
  num: $('[data-cc-num]'), nome: $('[data-cc-nome]'), val: $('[data-cc-val]'), band: $('[data-cc-bandeira]'),
};
f.ccNumero.addEventListener('input', () => {
  const d = f.ccNumero.value.replace(/\D/g, '');
  prev.num.textContent = (d + '•'.repeat(16 - d.length)).replace(/(.{4})(?=.)/g, '$1 ');
  prev.band.textContent = bandeira(d);
});
f.ccNome.addEventListener('input', () => (prev.nome.textContent = f.ccNome.value.toUpperCase() || 'NOME IMPRESSO'));
f.ccValidade.addEventListener('input', () => (prev.val.textContent = f.ccValidade.value || 'MM/AA'));

/* ================================================================ finalizar */

function validar() {
  const resultados = [];
  const checar = (campo, msg) => resultados.push({ campo, ok: marcarErro(campo, msg) });

  checar(f.nome, f.nome.value.trim().split(/\s+/).length >= 2 ? '' : 'nome e sobrenome.');
  checar(f.cpf, cpfValido(f.cpf.value) ? '' : 'CPF inválido.');
  checar(f.celular, celularValido(f.celular.value) ? '' : 'celular com DDD.');

  if (modo() === 'entrega') {
    checar(f.cep, cepValido(f.cep.value) ? '' : 'CEP com 8 dígitos.');
    checar(f.numero, f.numero.value.trim() ? '' : 'obrigatório.');
    checar(f.rua, f.rua.value.trim() ? '' : 'obrigatório.');
    checar(f.bairro, f.bairro.value.trim() ? '' : 'obrigatório.');
    checar(f.cidade, f.cidade.value.trim() ? '' : 'obrigatório.');
  } else {
    [f.cep, f.numero, f.rua, f.bairro, f.cidade].forEach((c) => marcarErro(c, ''));
  }

  if (pagamento() === 'cartao') {
    checar(f.ccNumero, luhn(f.ccNumero.value) ? '' : 'número de cartão inválido.');
    checar(f.ccNome, f.ccNome.value.trim().length >= 3 ? '' : 'como está no cartão.');
    checar(f.ccValidade, validadeOk(f.ccValidade.value) ? '' : 'validade inválida ou vencida.');
    checar(f.ccCvv, /^\d{3,4}$/.test(f.ccCvv.value) ? '' : '3 ou 4 dígitos.');
  } else {
    [f.ccNumero, f.ccNome, f.ccValidade, f.ccCvv].forEach((c) => marcarErro(c, ''));
  }

  const r = carrinho.resumo();
  if (r.exigeReceita && !receitaAnexada) resultados.push({ campo: inputReceita, ok: false, receita: true });
  return resultados.filter((x) => !x.ok);
}

/** QR code DECORATIVO (padrão aleatório com os "olhos" de canto). Não é um Pix real. */
function qrFake(semente) {
  const n = 25;
  let s = semente;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const olho = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FBFAF5"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const reservado = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let mods = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!reservado(x, y) && rand() > 0.52) mods += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" role="img" aria-label="QR code ilustrativo"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#FBFAF5"/><g fill="#121216">${olho(0, 0)}${olho(n - 7, 0)}${olho(0, n - 7)}${mods}</g></svg>`;
}

let timerPix;
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const problemas = validar();
  if (problemas.length) {
    const nomes = problemas.map((p) => (p.receita ? 'receita' : form.querySelector(`label[for="${p.campo.id}"]`).childNodes[0].textContent.trim().toLowerCase()));
    erro.textContent = `falta corrigir: ${nomes.join(', ')}.`;
    erro.hidden = false;
    problemas[0].campo.focus();
    return;
  }
  erro.hidden = true;

  const r = carrinho.resumo({ retirada: modo() === 'retirada' });
  const numero = Math.floor(Math.random() * 900000) + 100000;
  $('[data-pedido]').textContent = `nº ${numero}`;
  const quando = modo() === 'retirada' ? 'Fica pronto pra retirada em até 30 min.' : 'Chega em até 2h no endereço informado.';
  const pix = $('[data-pix]');
  clearInterval(timerPix);

  if (pagamento() === 'pix') {
    $('[data-confirm-texto]').textContent = `Total ${formatBRL(r.total)}. Pague com o Pix abaixo para liberar a separação. ${quando}`;
    $('[data-pix-qr]').innerHTML = qrFake(numero);
    $('[data-pix-codigo]').value = `PILULA-PIX-SIMULADO-${numero}-${r.total.toFixed(2)}`;
    pix.hidden = false;
    let resta = 30 * 60;
    const tick = () => {
      $('[data-pix-timer]').textContent = `${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`;
      if (resta-- <= 0) clearInterval(timerPix);
    };
    tick();
    timerPix = setInterval(tick, 1000);
  } else if (pagamento() === 'cartao') {
    const parcelas = Number(f.parcelas.value) || 1;
    const fim = f.ccNumero.value.replace(/\D/g, '').slice(-4);
    $('[data-confirm-texto]').textContent = `Pagamento aprovado (simulado) no ${bandeira(f.ccNumero.value) || 'cartão'} final ${fim}: ${parcelas}x de ${formatBRL(r.total / parcelas)} sem juros. ${quando}`;
    pix.hidden = true;
  } else {
    const dinheiro = form.querySelector('input[name="naEntrega"]:checked').value === 'dinheiro';
    const troco = f.troco.value.trim();
    $('[data-confirm-texto]').textContent = `Total ${formatBRL(r.total)}, pago na entrega ${dinheiro ? `em dinheiro${troco ? ` (troco para ${troco})` : ''}` : 'no cartão (maquininha)'}. ${quando}`;
    pix.hidden = true;
  }

  carrinho.limpar();
  receitaAnexada = false;
  if (typeof dialogo.showModal === 'function') dialogo.showModal();
});

$('[data-copiar]').addEventListener('click', async () => {
  const campo = $('[data-pix-codigo]');
  try {
    await navigator.clipboard.writeText(campo.value);
    avisar('Código Pix copiado.');
  } catch {
    campo.select();
  }
});
dialogo.addEventListener('close', () => clearInterval(timerPix));

/* ================================================================ indicador de etapas */

const passos = $$('[data-step]');
const marcarEtapa = (n) => passos.forEach((p) => {
  const ativo = Number(p.dataset.step) <= n;
  p.classList.toggle('is-on', ativo);
  if (Number(p.dataset.step) === n) p.setAttribute('aria-current', 'step');
  else p.removeAttribute('aria-current');
});
form.addEventListener('focusin', (e) => {
  const bloco = e.target.closest('[data-etapa]');
  if (bloco) marcarEtapa(Number(bloco.dataset.etapa));
});
marcarEtapa(0);

window.addEventListener('carrinho:mudou', render);
render();
