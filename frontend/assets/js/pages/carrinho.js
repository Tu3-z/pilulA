/* ==============================================================================
 * CONTROLADOR DE PÁGINA: carrinho.js
 * ==============================================================================
 * Gerencia o ciclo completo de compra no frontend:
 * 
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 
 * 1. Checkout em Etapas (Progressive Disclosure):
 *    - Dividido em 4 etapas didáticas:
 *      Etapa 0: Carrinho (ajuste de quantidades, cálculo de frete e cupom)
 *      Etapa 1: Seus dados (Nome, CPF, E-mail, Celular com máscaras e validação)
 *      Etapa 2: Entrega (Alternância entre Entrega expressa ou Retirada na Loja,
 *               autocompletar de endereço via API ViaCEP)
 *      Etapa 3: Pagamento (Resumo final, upload de receita médica caso haja remédio
 *               controlado e redirecionamento para o gateway Mercado Pago)
 * 
 * 2. Validação Sanitária da Anvisa no Frontend:
 *    - Se o carrinho contém medicamentos com retenção de receita (tarja vermelha/preta),
 *      o botão de finalizar é travado até que o comprador anexe a imagem/foto da prescrição.
 * 
 * 3. Integração com a API Backend:
 *    - Envia requisição POST para /api/checkout/preferencia.
 *    - O backend recalcula os preços com base nos valores do banco (proteção contra fraude).
 *    - Redireciona o usuário para a página de pagamento seguro do Mercado Pago Checkout Pro.
 * 
 * 4. Pós-Pagamento e Emissão de Recibo:
 *    - Ao retornar do gateway com '?pagamento=sucesso', exibe o recibo completo
 *      com opção de impressão (Ctrl+P / window.print) e compartilhamento via WhatsApp.
 * ============================================================================== */

import { $, esc, formatBRL } from '../utils/texto.js';
import { icone } from '../utils/icones.js';
import { arteHtml } from '../utils/arte.js';
import * as carrinho from '../services/carrinho.js';
import * as sessao from '../services/sessao.js';
import { mostrarAviso } from '../components/avisos.js';
import { ligarMascaras, ligarValidacao, validarCampo } from '../utils/validacao.js';
import { iniciarLayout } from '../components/layout.js';

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
let receitaBase64 = sessionStorage.getItem('receita_foto_temp') || null;
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

  const faltaReceita = r.exigeReceita && !receitaBase64;
  $('#finalizar').disabled = pagamentoEmVerificacao || faltaReceita;
  $('#finalizar').textContent = pagamentoEmVerificacao
    ? 'Confira o pagamento no Mercado Pago'
    : faltaReceita
      ? 'Anexe a receita médica para continuar'
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

/* ---------- BUSCA DE ENDEREÇO VIA CEP (API ViaCEP) ---------- */
let ultimoCep = '';
let controleCep = null;

// Escuta quando a pessoa digita no campo de CEP
f.cep.addEventListener('input', async () => {
  // LINHA: f.cep.value.replace(/\D/g, '')
  // O QUE FAZ: Limpa o traço e espaços deixando só os números do CEP
  const cep = f.cep.value.replace(/\D/g, '');

  // LINHA: if (cep.length !== 8 || cep === ultimoCep) return;
  // O QUE FAZ: Só dispara a busca na internet se o usuário tiver digitado os 8 números completos
  // e se não for o mesmo CEP que já acabamos de buscar (evita chamadas duplicadas à API).
  if (cep.length !== 8 || cep === ultimoCep) return;
  ultimoCep = cep;

  const status = $('#cep-status');
  status.textContent = 'buscando endereço…';

  // LINHA: controleCep?.abort(); controleCep = new AbortController();
  // O QUE FAZ: Se o usuário digitar rápido e mudar o CEP, cancela a requisição anterior que estava em andamento.
  controleCep?.abort();
  controleCep = new AbortController();

  // LINHA: setTimeout(() => controleCep.abort(), 5000);
  // O QUE FAZ: Define um timeout de 5 segundos. Se a API do ViaCEP travar, cancela a busca para não travar a tela.
  const tempo = setTimeout(() => controleCep.abort(), 5000);

  try {
    // LINHA: fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controleCep.signal })
    // O QUE FAZ: Envia requisição HTTP GET para o serviço público gratuito do ViaCEP passando o CEP digitado.
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controleCep.signal,
    });
    // Converte a resposta recebida em JSON:
    const d = await resposta.json();

    // Se o CEP for inexistente na base dos Correios, o ViaCEP devolve { erro: true }
    if (d.erro) {
      status.textContent = 'CEP não encontrado. preenche à mão.';
      return;
    }

    // Preenche automaticamente os campos de texto do formulário com os dados dos Correios:
    if (d.logradouro) f.rua.value = d.logradouro;
    if (d.bairro) f.bairro.value = d.bairro;
    if (d.localidade) f.cidade.value = `${d.localidade} / ${d.uf}`;

    // Dispara a validação visual (tira o contorno vermelho de campo vazio se houver)
    ['rua', 'bairro', 'cidade'].forEach(
      (n) => f[n].getAttribute('aria-invalid') === 'true' && validarCampo(f[n]),
    );

    status.textContent = '✓ endereço encontrado';
    // Coloca o cursor automaticamente no campo 'Número', que é o único dado que o ViaCEP não tem
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

// Escuta o clique no botão 'Finalizar pedido'
form.addEventListener('submit', async (e) => {
  // LINHA: e.preventDefault()
  // O QUE FAZ: Impede o comportamento padrão do navegador de recarregar a tela ao enviar um form.
  e.preventDefault();
  enviado = true;
  const r = resumo();

  // LINHA: validarTudo()
  // O QUE FAZ: Roda a validação de todos os campos (CPF, email, celular, CEP, etc.)
  const invalidos = validarTudo().map((el) => NOMES[el.name] ?? el.name);
  desenharEtapas();

  const erros = $('#resumo-erros');
  // Se tiver algum campo com erro, exibe mensagem vermelha e coloca foco no primeiro campo com erro
  if (invalidos.length) {
    erros.hidden = false;
    erros.textContent = `falta corrigir: ${invalidos.join(', ')}.`;
    requestAnimationFrame(() => {
      form.querySelector('[aria-invalid="true"]')?.focus();
    });
    return;
  }
  erros.hidden = true;
  // Se tudo estiver válido, chama a integração de checkout com o backend
  await iniciarCheckout(r);
});

async function iniciarCheckout(r) {
  const botao = $('#finalizar');
  const textoOriginal = botao.textContent;
  const erros = $('#resumo-erros');
  // Desativa o botão para evitar clique duplo enquanto a requisição viaja pela rede
  botao.disabled = true;
  botao.textContent = 'Conectando ao Mercado Pago…';

  // LINHA: Monta o objeto JavaScript com todos os dados do comprador e do carrinho
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
    // Converte os produtos do carrinho em formato simplificado { slug, quantidade } para o servidor
    itens: r.itens.map(({ produto, qtd }) => ({ slug: produto.id, quantidade: qtd })),
    // Se o cliente anexou foto de receita médica, ela viaja aqui codificada em base64
    receitaUrl: receitaBase64,
  };

  try {
    // LINHA: fetch(`${API_URL}/api/checkout/preferencia`, { method: 'POST', ... })
    // O QUE FAZ: Envia uma requisição HTTP POST para a API do Spring Boot na porta 8080.
    // O backend recebe esse JSON, recalcula os preços no banco de dados e cria a preferência no Mercado Pago.
    const resposta = await fetch(`${API_URL}/api/checkout/preferencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedido),
    });
    const dados = await resposta.json().catch(() => null);

    // Se o servidor retornou código de erro (400, 409, 500, etc.), lança exceção com o detalhe do erro
    if (!resposta.ok) {
      throw new Error(
        dados?.detail ??
          dados?.message ??
          'Não foi possível iniciar o pagamento. Verifique a configuração do Mercado Pago no servidor.',
      );
    }

    // LINHA: Proteção de Integridade Financeira
    // O QUE FAZ: Confere se o valor total devolvido pelo backend bate com o que estava no carrinho.
    const totalServidor = Number(dados.total);
    if (!Number.isFinite(totalServidor) || !dados.checkoutUrl) {
      throw new Error('O servidor devolveu uma resposta inválida para iniciar o pagamento.');
    }
    if (Math.round(totalServidor * 100) !== Math.round(r.total * 100)) {
      throw new Error(
        `O catálogo do servidor atualizou o total para ${formatBRL(totalServidor)}. Confira os preços e tente novamente.`,
      );
    }

    // LINHA: Validação de Segurança de URL do Gateway
    // O QUE FAZ: Garante que o link retornado pelo servidor seja obrigatoriamente HTTPS e pertença ao domínio 'mercadopago.com'.
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

/* ================================================================ início e retorno do pagamento */

/**
 * Quando o cliente volta da tela do Mercado Pago, a URL contém:
 * ?pagamento=sucesso&pedido=UUID (ou pendente/falha).
 * 
 * Aqui consultamos a API da farmácia (/api/pedidos/{referencia}) para buscar
 * os dados salvos no banco de dados e exibir a confirmação com o status real.
 */
function renderizarRecibo(pedido, statusRetorno) {
  const reciboEl = $('#recibo-pedido');
  const corpoEl = $('#recibo-conteudo');
  if (!reciboEl || !corpoEl) return;

  // Esconde os blocos padrão do carrinho
  $('#carrinho-cheio').hidden = true;
  $('#carrinho-vazio').hidden = true;
  $('#etapas').hidden = true;
  reciboEl.hidden = false;

  const pago = statusRetorno === 'sucesso' || pedido.status === 'PAGO';
  const pendente = statusRetorno === 'pendente' || pedido.status === 'PENDENTE';

  const badgeClass = pago ? 'receipt__badge--success' : pendente ? 'receipt__badge--pending' : 'receipt__badge--alert';
  const badgeTexto = pago ? '✓ Pagamento Aprovado' : pendente ? '⏳ Aguardando Aprovação (Pix/Boleto)' : '✕ Pagamento Não Concluído';

  const enderecoHtml = pedido.modoEntrega === 'retirada'
    ? '<strong>Retirada na Farmácia</strong><br>pílula* Paulista · Aberta 24h<br>Pronto para retirada em até 30 min'
    : `<strong>Entrega em Domicílio (até 2h)</strong><br>${esc(pedido.rua)}, ${esc(pedido.numero)}${pedido.complemento ? ` · ${esc(pedido.complemento)}` : ''}<br>${esc(pedido.bairro)} · ${esc(pedido.cidade)}/${esc(pedido.uf)} · CEP ${esc(pedido.cep)}`;

  const itensHtml = (pedido.itens || []).map(item => `
    <li class="receipt__item">
      <div>
        <strong>${esc(item.nomeProduto || 'Produto')}</strong>
        <span style="color: var(--ink-2); font-size: var(--t-xs);"> × ${item.quantidade}</span>
      </div>
      <span>${formatBRL(item.precoUnitario * item.quantidade)}</span>
    </li>
  `).join('');

  const mensagemWhats = encodeURIComponent(`Olá! Acabei de fazer o pedido *${pedido.referencia.slice(0, 8)}* na pílula* no valor de ${formatBRL(pedido.total)}. Gostaria de acompanhar a entrega!`);

  corpoEl.innerHTML = `
    <div class="receipt__hero">
      <span class="receipt__badge ${badgeClass}">${badgeTexto}</span>
      <h2 class="receipt__title">${pago ? 'Pedido Realizado com Sucesso! 🎉' : pendente ? 'Pedido Registrado!' : 'Aviso sobre o Pagamento'}</h2>
      <p class="receipt__lead">${pago ? 'Seu pedido já foi enviado para separação pelo nosso time farmacêutico.' : 'Assim que o pagamento for confirmado pelo Mercado Pago, seu pedido será separado.'}</p>
      <div class="receipt__ref-box">
        <span>Código do Pedido: <b>${esc(pedido.referencia)}</b></span>
        <button type="button" class="win__btn" style="min-height: 28px; padding: 2px 8px; font-size: 11px;" id="copiar-ref">Copiar</button>
      </div>
    </div>

    <div class="receipt__info-grid">
      <div>
        <p class="receipt__info-label">Comprador</p>
        <p><b>${esc(pedido.nomeComprador)}</b><br>${esc(pedido.emailComprador)}<br>${esc(pedido.celularComprador)}</p>
      </div>
      <div>
        <p class="receipt__info-label">Entrega / Retirada</p>
        <p>${enderecoHtml}</p>
      </div>
    </div>

    <div>
      <h3 style="font-size: var(--t-sm); text-transform: uppercase; margin-bottom: 8px; color: var(--ink-2);">Itens do Pedido</h3>
      <ul class="receipt__items-list">
        ${itensHtml || '<li class="receipt__item"><span>Itens processados pelo checkout</span></li>'}
      </ul>
    </div>

    <div class="receipt__totals">
      <div class="receipt__row">
        <span>Subtotal</span>
        <span>${formatBRL(pedido.subtotal)}</span>
      </div>
      ${pedido.desconto > 0 ? `
      <div class="receipt__row" style="color: var(--blue);">
        <span>Desconto ${pedido.cupom ? `(${esc(pedido.cupom)})` : ''}</span>
        <span>-${formatBRL(pedido.desconto)}</span>
      </div>` : ''}
      <div class="receipt__row">
        <span>Frete</span>
        <span>${pedido.frete > 0 ? formatBRL(pedido.frete) : 'Grátis'}</span>
      </div>
      <div class="receipt__row receipt__row--total">
        <span>Total Pago</span>
        <span>${formatBRL(pedido.total)}</span>
      </div>
    </div>

    <div class="receipt__actions">
      <button type="button" class="btn btn--secondary" onclick="window.print()">
        <span data-icone="doc"></span> Imprimir Comprovante
      </button>
      <a class="btn btn--secondary" href="https://wa.me/?text=${mensagemWhats}" target="_blank" rel="noopener">
        Receber no WhatsApp
      </a>
      <a class="btn btn--primary" href="loja.html">
        Continuar Comprando
      </a>
    </div>
  `;

  $('#copiar-ref')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(pedido.referencia);
    const btn = $('#copiar-ref');
    if (btn) {
      btn.textContent = 'Copiado!';
      setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
    }
  });
}

if (retorno) {
  const refPedido = parametrosRetorno.get('pedido');
  const aviso = $('#retorno-mp');

  if (refPedido) {
    aviso.textContent = 'Consultando status do pedido no servidor...';
    aviso.hidden = false;

    // Busca os dados do pedido persistidos no backend
    fetch(`${API_URL}/api/pedidos/${encodeURIComponent(refPedido)}?status=${encodeURIComponent(retorno)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((dadosPedido) => {
        if (dadosPedido) {
          if (retorno === 'sucesso' || dadosPedido.status === 'PAGO') {
            carrinho.limpar();
          }
          renderizarRecibo(dadosPedido, retorno);
          aviso.hidden = true;
        } else {
          aviso.textContent = `Retorno do Mercado Pago: ${retorno}. Pedido: ${refPedido}.`;
        }
      })
      .catch(() => {
        aviso.textContent = `Você retornou do Mercado Pago (${retorno}). Pedido: ${refPedido}.`;
      });
  } else {
    aviso.textContent = `Status do pagamento: ${retorno}.`;
    aviso.hidden = false;
  }
}

function ligarReceitaCarrinho() {
  const input = $('#carrinho-receita-arquivo');
  const status = $('#carrinho-receita-status');
  const preview = $('#carrinho-receita-preview');
  const img = $('#carrinho-receita-img');

  function atualizarPreview() {
    if (receitaBase64) {
      status.textContent = '✓ Receita anexada com sucesso! Farmacêutico irá conferir.';
      status.style.color = 'var(--cross)';
      if (img && !receitaBase64.includes('application/pdf')) {
        img.src = receitaBase64;
        preview.style.display = 'block';
      }
    }
  }

  if (receitaBase64) atualizarPreview();

  input?.addEventListener('change', (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = () => {
      receitaBase64 = reader.result;
      sessionStorage.setItem('receita_foto_temp', receitaBase64);
      atualizarPreview();
      desenharResumo(resumo());
    };
    reader.readAsDataURL(arquivo);
  });
}

ligarReceitaCarrinho();
preencherComSessao();
sessao.aoMudar(() => {
  function ligarReceitaCarrinho() {
  const input = $('#carrinho-receita-arquivo');
  const status = $('#carrinho-receita-status');
  const preview = $('#carrinho-receita-preview');
  const img = $('#carrinho-receita-img');

  function atualizarPreview() {
    if (receitaBase64) {
      status.textContent = '✓ Receita anexada com sucesso! Farmacêutico irá conferir.';
      status.style.color = 'var(--cross)';
      if (img && !receitaBase64.includes('application/pdf')) {
        img.src = receitaBase64;
        preview.style.display = 'block';
      }
    }
  }

  if (receitaBase64) atualizarPreview();

  input?.addEventListener('change', (e) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    const reader = new FileReader();
    reader.onload = () => {
      receitaBase64 = reader.result;
      sessionStorage.setItem('receita_foto_temp', receitaBase64);
      atualizarPreview();
      desenharResumo(resumo());
    };
    reader.readAsDataURL(arquivo);
  });
}

ligarReceitaCarrinho();
preencherComSessao();
  desenhar();
});
carrinho.aoMudar(desenhar);
desenhar();
