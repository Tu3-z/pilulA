import { $, esc, formatBRL } from '../utils/texto.js';
import { icone } from '../utils/icones.js';
import { arteHtml } from '../utils/arte.js';
import * as carrinho from '../services/carrinho.js';
import * as sessao from '../services/sessao.js';
import { mostrarAviso } from '../components/avisos.js';
import { bandeira, ligarMascaras, ligarValidacao, validarCampo } from '../utils/validacao.js';
import { iniciarLayout } from '../components/layout.js';

/*
 * Carrinho + checkout em etapas: itens → dados → entrega → pagamento.
 * O formulário está escrito no carrinho.html; aqui ficam as regras e o que muda na tela.
 */

await iniciarLayout();

const form = $('#checkout');
const f = form.elements;
ligarMascaras(form);
const validarTudo = ligarValidacao(form);

/** nomes legíveis para o resumo de erros */
const NOMES = {
  nome: 'nome',
  cpf: 'CPF',
  celular: 'celular',
  cep: 'CEP',
  numero: 'número',
  rua: 'rua',
  bairro: 'bairro',
  cidade: 'cidade',
  ccNumero: 'número do cartão',
  ccNome: 'nome no cartão',
  ccValidade: 'validade',
  ccCvv: 'CVV',
};

const ETAPAS = [
  { id: 'etapa-itens', rotulo: 'Carrinho' },
  { id: 'etapa-dados', rotulo: 'Seus dados' },
  { id: 'etapa-entrega', rotulo: 'Entrega' },
  { id: 'etapa-pagamento', rotulo: 'Pagamento' },
];

let etapaAtual = 0;
const visitadas = new Set();
let enviado = false; // a pessoa já tentou finalizar?
let receita = null; // nome do arquivo anexado

const modo = () => f.modo.value; // 'entrega' | 'retirada'
const forma = () => f.forma.value; // 'pix' | 'cartao' | 'entrega'
const resumo = () => carrinho.resumo(modo() === 'retirada');

/* ================================================================ desenho */

function desenhar() {
  const r = resumo();
  const vazio = !r.itens.length;
  $('#carrinho-vazio').hidden = !vazio;
  $('#carrinho-cheio').hidden = vazio;
  $('#etapas').hidden = vazio;
  if (vazio) return;

  desenharLinhas(r);
  desenharResumo(r);
  desenharParcelas(r);
  $('#bloco-receita').hidden = !r.exigeReceita;
  $('#dica-login').hidden = sessao.logado();
  desenharEtapas();
}

function desenharLinhas(r) {
  const n = carrinho.quantidade();
  $('#itens-titulo').textContent = `Seu carrinho · ${n} ${n === 1 ? 'item' : 'itens'}`;
  $('#status-frete').textContent =
    r.freteGratis || r.retirada
      ? 'pronto. sem frete.'
      : `pronto. frete grátis a partir de ${formatBRL(carrinho.FRETE_GRATIS_A_PARTIR)}.`;

  $('#linhas').innerHTML = r.itens
    .map(({ produto: p, qtd }) => {
      const nome = esc(p.nome);
      return `
      <li class="line" data-id="${esc(p.id)}">
        ${arteHtml(p)}
        <div class="line__info">
          <span class="line__brand">${esc(p.marca)}</span>
          <a class="line__name" href="produto.html?id=${encodeURIComponent(p.id)}">${nome}</a>
          <span class="line__sub">${esc(p.sub)}</span>
          ${p.receita !== 'livre' ? '<span class="tarja">tarja vermelha</span>' : ''}
        </div>
        <p class="line__price">${formatBRL(p.preco * qtd)}<span class="line__unit">${qtd} × ${formatBRL(p.preco)}</span></p>
        <div class="stepper">
          <button type="button" data-mudar="-1" aria-label="Diminuir quantidade de ${nome}">–</button>
          <label class="sr-only" for="q-${esc(p.id)}">Quantidade de ${nome}</label>
          <input id="q-${esc(p.id)}" type="number" inputmode="numeric" min="1" max="99" value="${qtd}">
          <button type="button" data-mudar="1" aria-label="Aumentar quantidade de ${nome}">+</button>
        </div>
        <button type="button" class="line__rm">remover</button>
      </li>`;
    })
    .join('');
}

function desenharResumo(r) {
  const progresso = r.retirada ? 100 : Math.round(r.progressoFrete * 100);
  $('#frete-texto').textContent = r.retirada
    ? 'retirada na loja: sem frete ✱'
    : r.freteGratis
      ? 'frete grátis desbloqueado ✱'
      : `faltam ${formatBRL(r.faltaParaFrete)} para o frete grátis`;
  $('#frete-barra').setAttribute('aria-valuenow', progresso);
  $('#frete-barra .ship__fill').style.width = `${progresso}%`;

  const n = carrinho.quantidade();
  const c = carrinho.cupom();
  $('#totais').innerHTML = `
    <dt>Subtotal (${n} ${n === 1 ? 'item' : 'itens'})</dt><dd>${formatBRL(r.subtotal)}</dd>
    ${c ? `<dt class="is-discount">Cupom ${esc(c.codigo)}</dt><dd class="is-discount">− ${formatBRL(r.desconto)}</dd>` : ''}
    <dt>${r.retirada ? 'Retirada' : 'Entrega'}</dt><dd>${r.frete === 0 ? 'grátis' : formatBRL(r.frete)}</dd>
    <dt class="is-total">Total</dt><dd class="is-total">${formatBRL(r.total)}</dd>`;

  $('#finalizar').textContent = `Finalizar pedido · ${formatBRL(r.total)}`;
  desenharCupom();
}

function desenharCupom(msg) {
  const el = $('#cupom-msg');
  const c = carrinho.cupom();
  el.classList.toggle('is-ok', !!c || msg?.ok === true);
  el.classList.toggle('is-err', msg?.ok === false);
  if (c)
    el.innerHTML = `${esc(c.codigo)} aplicado: ${esc(c.descricao)}. <button type="button" id="tirar-cupom">remover</button>`;
  else el.textContent = msg?.texto ?? '';
}

/** parcelas sem juros possíveis para o total (nunca passa do máximo) */
function desenharParcelas(r) {
  const select = f.parcelas;
  const escolhida = Number(select.value) || 1;
  const max = carrinho.maxParcelas(r.total);
  select.innerHTML = Array.from({ length: max }, (_, i) => {
    const n = i + 1;
    return `<option value="${n}">${n}x de ${formatBRL(r.total / n)} sem juros${n === 1 ? ' (à vista)' : ''}</option>`;
  }).join('');
  select.value = String(Math.min(escolhida, max));
}

/* ---------- etapas: viram links e ganham ✓ quando ficam completas ---------- */

/** Confere uma etapa sem mostrar erros na tela. */
function etapaOk(i) {
  if (i === 0) return resumo().itens.length > 0;
  // só marca ✓ depois que a pessoa passou pela etapa (senão "Pagamento" já nasce completo com Pix)
  if (!visitadas.has(i) && !enviado) return false;
  const bloco = $(`[data-etapa="${i}"]`);
  return [...bloco.querySelectorAll('[data-regras]')].every((el) => !validarCampo(el, false));
}

function desenharEtapas() {
  $('#etapas ol').innerHTML = ETAPAS.map((e, i) => {
    const ok = etapaOk(i);
    const atual = i === etapaAtual;
    return `<li><a href="#${e.id}" class="${atual ? 'is-on' : ''} ${ok ? 'is-ok' : ''}"${atual ? ' aria-current="step"' : ''}>
      ${ok ? icone('check') : `${i + 1}.`} ${e.rotulo}${ok ? '<span class="sr-only"> (completo)</span>' : ''}</a></li>`;
  }).join('');
}

/* ================================================================ itens */

$('#linhas').addEventListener('click', (e) => {
  const linha = e.target.closest('.line');
  if (!linha) return;
  const id = linha.dataset.id;
  const botao = e.target.closest('[data-mudar]');
  if (botao) carrinho.definir(id, Math.max(1, carrinho.qtdDe(id) + Number(botao.dataset.mudar)));
  if (e.target.closest('.line__rm')) remover(id, linha.querySelector('.line__name').textContent);
});
$('#linhas').addEventListener('change', (e) => {
  const linha = e.target.closest('.line');
  if (linha && e.target.type === 'number')
    carrinho.definir(linha.dataset.id, Math.max(1, Number(e.target.value) || 1));
});

/** remoção sem confirmação, mas com "Desfazer" (mais rápido e evita erro de clique) */
function remover(id, nome) {
  const qtd = carrinho.qtdDe(id);
  carrinho.remover(id);
  mostrarAviso(`${nome} removido do carrinho.`, {
    acao: { rotulo: 'Desfazer', executar: () => carrinho.adicionar(id, qtd) },
  });
}

/* ================================================================ cupom */

$('#form-cupom').addEventListener('submit', (e) => {
  e.preventDefault();
  const campo = $('#cupom');
  if (carrinho.aplicarCupom(campo.value)) campo.value = '';
  else desenharCupom({ texto: 'cupom inválido. tenta PILULA10 ;)', ok: false });
});
$('#cupom-msg').addEventListener('click', (e) => {
  if (e.target.id !== 'tirar-cupom') return;
  carrinho.removerCupom();
  desenharCupom({ texto: 'cupom removido.', ok: true });
});

/* ================================================================ receita */

$('#receita').addEventListener('change', (e) => {
  receita = e.target.files?.[0]?.name ?? null;
  const status = $('#receita-status');
  status.textContent = receita ? `${receita} ✓ anexada` : 'nenhum arquivo_';
  status.classList.toggle('is-ok', !!receita);
  e.target.removeAttribute('aria-invalid');
});

/* ================================================================ entrega e pagamento */

// campos de endereço só valem para entrega em casa; os do cartão, só para cartão
// (os campos dentro de um bloco [hidden] são ignorados pela validação)
form.addEventListener('change', (e) => {
  if (e.target.name === 'modo') {
    $('#endereco').hidden = modo() === 'retirada';
    $('#retirada').hidden = modo() !== 'retirada';
    desenhar();
  }
  if (e.target.name === 'forma') {
    document
      .querySelectorAll('[data-forma]')
      .forEach((p) => (p.hidden = p.dataset.forma !== forma()));
  }
  if (e.target.name === 'naEntrega') $('#bloco-troco').hidden = f.naEntrega.value !== 'dinheiro';
  desenharEtapas();
});
form.addEventListener('input', () => desenharEtapas());

// qual etapa a pessoa está preenchendo agora
form.addEventListener('focusin', (e) => {
  const bloco = e.target.closest('[data-etapa]');
  if (!bloco) return;
  etapaAtual = Number(bloco.dataset.etapa);
  visitadas.add(etapaAtual);
  desenharEtapas();
});

/* ---------- prévia do cartão, atualiza enquanto digita ---------- */
form.addEventListener('input', (e) => {
  if (!['ccNumero', 'ccNome', 'ccValidade'].includes(e.target.name)) return;
  const d = f.ccNumero.value.replace(/\D/g, '');
  $('#cc-previa-num').textContent = (d + '•'.repeat(16 - d.length)).replace(/(.{4})(?=.)/g, '$1 ');
  $('#cc-bandeira').textContent = bandeira(d);
  $('#cc-previa-nome').textContent = f.ccNome.value.toUpperCase() || 'NOME IMPRESSO';
  $('#cc-previa-validade').textContent = f.ccValidade.value || 'MM/AA';
});

/* ---------- CEP com 8 dígitos → busca o endereço no ViaCEP (API pública) ---------- */
let ultimoCep = '';
let controleCep = null;
f.cep.addEventListener('input', async () => {
  const cep = f.cep.value.replace(/\D/g, '');
  if (cep.length !== 8 || cep === ultimoCep) return;
  ultimoCep = cep;
  const status = $('#cep-status');
  status.textContent = 'buscando endereço…';
  controleCep?.abort(); // cancela a busca anterior, se ainda estiver rodando
  controleCep = new AbortController();
  const tempo = setTimeout(() => controleCep.abort(), 5000);
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controleCep.signal,
    });
    const d = await resposta.json();
    if (d.erro) {
      status.textContent = 'CEP não encontrado. preenche à mão.';
      return;
    }
    if (d.logradouro) f.rua.value = d.logradouro;
    if (d.bairro) f.bairro.value = d.bairro;
    if (d.localidade) f.cidade.value = `${d.localidade} / ${d.uf}`;
    ['rua', 'bairro', 'cidade'].forEach(
      (n) => f[n].getAttribute('aria-invalid') === 'true' && validarCampo(f[n]),
    );
    status.textContent = '✓ endereço encontrado';
    f.numero.focus();
  } catch {
    status.textContent = 'sem conexão com o ViaCEP. preenche à mão.';
  } finally {
    clearTimeout(tempo);
    desenharEtapas();
  }
});

/* ---------- logado? pré-preenche os dados ---------- */
function preencherComSessao() {
  const u = sessao.dados();
  if (!u) return;
  if (!f.nome.value) f.nome.value = u.nome;
  if (!f.cpf.value && u.cpf) f.cpf.value = u.cpf;
  if (!f.celular.value && u.celular) f.celular.value = u.celular;
}

/* ================================================================ finalizar */

form.addEventListener('submit', (e) => {
  e.preventDefault();
  enviado = true;
  const r = resumo();

  const invalidos = validarTudo().map((el) => NOMES[el.name] ?? el.name);
  const faltaReceita = r.exigeReceita && !receita;
  if (faltaReceita) {
    invalidos.push('receita');
    $('#receita').setAttribute('aria-invalid', 'true');
  }
  desenharEtapas();

  const erros = $('#resumo-erros');
  if (invalidos.length) {
    erros.hidden = false;
    erros.textContent = `falta corrigir: ${invalidos.join(', ')}.`;
    requestAnimationFrame(() => {
      const alvo =
        faltaReceita && invalidos.length === 1 ? '#receita' : '[aria-invalid="true"], #receita';
      form.querySelector(alvo)?.focus();
    });
    return;
  }
  erros.hidden = true;
  confirmar(r);
});

function confirmar(r) {
  const numero = Math.floor(Math.random() * 900000) + 100000;
  const quando = r.retirada
    ? 'Fica pronto pra retirada em até 30 min.'
    : 'Chega em até 2h no endereço informado.';
  let texto;
  if (forma() === 'pix') {
    texto = `Total ${formatBRL(r.total)}. Pague com o Pix abaixo para liberar a separação. ${quando}`;
  } else if (forma() === 'cartao') {
    const parcelas = Number(f.parcelas.value);
    const fim = f.ccNumero.value.replace(/\D/g, '').slice(-4);
    texto = `Pagamento aprovado (simulado) no ${bandeira(f.ccNumero.value) || 'cartão'} final ${fim}: ${parcelas}x de ${formatBRL(r.total / parcelas)} sem juros. ${quando}`;
  } else {
    const dinheiro = f.naEntrega.value === 'dinheiro';
    const troco = f.troco.value.trim();
    texto = `Total ${formatBRL(r.total)}, pago na entrega ${dinheiro ? `em dinheiro${troco ? ` (troco para ${troco})` : ''}` : 'no cartão (maquininha)'}. ${quando}`;
  }

  $('#ok-titulo').textContent = `Pedido nº ${numero} confirmado!`;
  $('#ok-texto').textContent = texto;
  const pix = forma() === 'pix';
  $('#bloco-pix').hidden = !pix;
  if (pix) {
    $('#pix-qr').innerHTML = qrFake(numero);
    $('#pix-codigo').value = `PILULA-PIX-SIMULADO-${numero}-${r.total.toFixed(2)}`;
    iniciarTimerPix();
  }

  carrinho.limpar();
  receita = null;
  $('#dialogo').showModal();
}

$('#copiar-pix').addEventListener('click', async () => {
  const campo = $('#pix-codigo');
  try {
    await navigator.clipboard.writeText(campo.value);
    mostrarAviso('Código Pix copiado.');
  } catch {
    campo.select();
  }
});

let timerPix;
function iniciarTimerPix() {
  clearInterval(timerPix);
  let resta = 30 * 60;
  const tick = () => {
    $('#pix-timer').textContent =
      `expira em ${String(Math.floor(resta / 60)).padStart(2, '0')}:${String(resta % 60).padStart(2, '0')}`;
    if (resta-- <= 0) clearInterval(timerPix);
  };
  tick();
  timerPix = setInterval(tick, 1000);
}
$('#dialogo').addEventListener('close', () => clearInterval(timerPix));

/** QR code DECORATIVO (padrão aleatório com os "olhos" de canto). Não é um Pix real. */
function qrFake(semente) {
  const n = 25;
  let s = semente;
  const rand = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const olho = (x, y) =>
    `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#FBFAF5"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  const reservado = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let mods = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (!reservado(x, y) && rand() > 0.52)
        mods += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
  return `<svg viewBox="-1 -1 ${n + 2} ${n + 2}" shape-rendering="crispEdges" role="img" aria-label="QR code ilustrativo"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" fill="#FBFAF5"/><g fill="#121216">${olho(0, 0)}${olho(n - 7, 0)}${olho(0, n - 7)}${mods}</g></svg>`;
}

/* ================================================================ início */

preencherComSessao();
sessao.aoMudar(() => {
  preencherComSessao();
  desenhar();
});
carrinho.aoMudar(desenhar);
desenhar();
