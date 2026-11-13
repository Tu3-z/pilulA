import { $, esc, formatBRL } from '../utils/texto.js';
import { icone } from '../utils/icones.js';
import { arteHtml } from '../utils/arte.js';
import * as carrinho from '../services/carrinho.js';
import * as sessao from '../services/sessao.js';
import { mostrarAviso } from '../components/avisos.js';
import { ligarMascaras, ligarValidacao, validarCampo } from '../utils/validacao.js';
import { iniciarLayout } from '../components/layout.js';

/*
 * Carrinho + checkout em etapas: itens → dados → entrega → pagamento.
 * O formulário está escrito no carrinho.html; aqui ficam as regras e o que muda na tela.
 */

await iniciarLayout();

const form = $('#checkout');
const f = form.elements;
const API_URL = (window.APP_CONFIG?.apiUrl ?? 'http://localhost:8080').replace(/\/+$/, '');
const parametrosRetorno = new URLSearchParams(location.search);
const retorno = parametrosRetorno.get('pagamento');
const pagamentoEmVerificacao = retorno === 'sucesso' || retorno === 'pendente';
ligarMascaras(form);
const validarTudo = ligarValidacao(form);

/** nomes legíveis para o resumo de erros */
const NOMES = {
  nome: 'nome',
  cpf: 'CPF',
  email: 'e-mail',
  celular: 'celular',
  cep: 'CEP',
  numero: 'número',
  rua: 'rua',
  bairro: 'bairro',
  cidade: 'cidade',
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
const modo = () => f.modo.value; // 'entrega' | 'retirada'
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

  $('#finalizar').disabled = pagamentoEmVerificacao || r.exigeReceita;
  $('#finalizar').textContent = pagamentoEmVerificacao
    ? 'Confira o pagamento no Mercado Pago'
    : r.exigeReceita
      ? 'Compra indisponível para medicamento com receita'
      : `Finalizar pedido · ${formatBRL(r.total)}`;
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

/* ---------- etapas: viram links e ganham ✓ quando ficam completas ---------- */

/** Confere uma etapa sem mostrar erros na tela. */
function etapaOk(i) {
  if (i === 0) return resumo().itens.length > 0;
  // só marca ✓ depois que a pessoa passou pela etapa
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

/* ================================================================ entrega e pagamento */

// Os campos de endereço só valem para entrega em casa.
// (os campos dentro de um bloco [hidden] são ignorados pela validação)
form.addEventListener('change', (e) => {
  if (e.target.name === 'modo') {
    $('#endereco').hidden = modo() === 'retirada';
    $('#retirada').hidden = modo() !== 'retirada';
    desenhar();
  }
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
  if (!f.email.value) f.email.value = u.email;
  if (!f.cpf.value && u.cpf) f.cpf.value = u.cpf;
  if (!f.celular.value && u.celular) f.celular.value = u.celular;
}

/* ================================================================ finalizar */

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  enviado = true;
  const r = resumo();

  const invalidos = validarTudo().map((el) => NOMES[el.name] ?? el.name);
  desenharEtapas();

  const erros = $('#resumo-erros');
  if (invalidos.length) {
    erros.hidden = false;
    erros.textContent = `falta corrigir: ${invalidos.join(', ')}.`;
    requestAnimationFrame(() => {
      form.querySelector('[aria-invalid="true"]')?.focus();
    });
    return;
  }
  erros.hidden = true;
  await iniciarCheckout(r);
});

async function iniciarCheckout(r) {
  const botao = $('#finalizar');
  const textoOriginal = botao.textContent;
  const erros = $('#resumo-erros');
  botao.disabled = true;
  botao.textContent = 'Conectando ao Mercado Pago…';

  const pedido = {
    nome: f.nome.value.trim(),
    email: f.email.value.trim(),
    cpf: f.cpf.value.replace(/\D/g, ''),
    celular: f.celular.value.replace(/\D/g, ''),
    modo: modo(),
    cep: f.cep.value.replace(/\D/g, ''),
    rua: f.rua.value.trim(),
    numero: f.numero.value.trim(),
    complemento: f.complemento.value.trim(),
    bairro: f.bairro.value.trim(),
    cidade: f.cidade.value.trim(),
    cupom: carrinho.cupom()?.codigo ?? null,
    itens: r.itens.map(({ produto, qtd }) => ({ slug: produto.id, quantidade: qtd })),
  };

  try {
    const resposta = await fetch(`${API_URL}/api/checkout/preferencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    });
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
      throw new Error(
        dados?.detail ??
          dados?.message ??
          'Não foi possível iniciar o pagamento. Verifique a configuração do Mercado Pago no servidor.',
      );
    }

    const totalServidor = Number(dados.total);
    if (!Number.isFinite(totalServidor) || !dados.checkoutUrl) {
      throw new Error('O servidor devolveu uma resposta inválida para iniciar o pagamento.');
    }
    if (Math.round(totalServidor * 100) !== Math.round(r.total * 100)) {
      throw new Error(
        `O catálogo do servidor atualizou o total para ${formatBRL(totalServidor)}. Confira os preços e tente novamente.`,
      );
    }

    let checkoutUrl;
    try {
      checkoutUrl = new URL(dados.checkoutUrl);
    } catch {
      throw new Error('O Mercado Pago devolveu um endereço de pagamento inválido.');
    }
    if (
      checkoutUrl.protocol !== 'https:' ||
      !/(^|\.)mercadopago\.(com|com\.br)$/i.test(checkoutUrl.hostname)
    ) {
      throw new Error('O endereço de pagamento não pertence ao Mercado Pago.');
    }

    window.location.assign(checkoutUrl.href);
  } catch (erro) {
    erros.hidden = false;
    erros.textContent =
      erro instanceof TypeError
        ? 'Não consegui falar com o servidor de pagamento. Confira se a API está no ar.'
        : erro.message;
    botao.disabled = false;
    botao.textContent = textoOriginal;
  }
}

/* ================================================================ início */

if (retorno) {
  const pedido = parametrosRetorno.get('pedido');
  const mensagens = {
    sucesso: 'Você voltou do Mercado Pago. O retorno do navegador não confirma o pagamento; confira o status na sua conta antes de tentar novamente.',
    pendente: 'O Mercado Pago informou que o pagamento está pendente. Confira o status na sua conta antes de tentar novamente.',
    falha: 'O Mercado Pago não concluiu o pagamento. Confira os dados ou tente novamente.',
  };
  const aviso = $('#retorno-mp');
  aviso.textContent = `${mensagens[retorno] ?? mensagens.pendente}${pedido ? ` Referência: ${pedido}.` : ''}`;
  aviso.hidden = false;
}

preencherComSessao();
sessao.aoMudar(() => {
  preencherComSessao();
  desenhar();
});
carrinho.aoMudar(desenhar);
desenhar();
