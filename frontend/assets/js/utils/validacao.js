/* ==========================================================================
   UTILITÁRIO: Máscaras e Validações Matemáticas / Formatos
   Sem bibliotecas externas: código leve, modular (Vanilla JS ES6).
   
   NOTAS PARA APRESENTAÇÃO:
   - Este módulo gerencia duas responsabilidades essenciais de front-end:
     1. Máscaras de entrada (UX): formatam o texto em tempo real enquanto o
        usuário digita (CPF com pontos e traço, celular com DDD, CEP e cartão).
     2. Validações puras de regras de negócio: validações matemáticas (como
        o algoritmo de validação do CPF da Receita Federal e o algoritmo de Luhn
        para cartões de crédito), além de Regex para e-mail e formato de telefone.
   ========================================================================== */

// LINHA: const digitos = (s) => String(s ?? '').replace(/\D/g, '');
// O QUE FAZ: Pega qualquer texto e usa a Expressão Regular /\D/g (qualquer caractere que NÃO seja número)
// e substitui por vazio (''). Exemplo: "123.456.789-00" vira a string limpa "12345678900".
const digitos = (s) => String(s ?? '').replace(/\D/g, '');

export const mascaras = {
  // Máscara dinâmica de CPF enquanto a pessoa digita no teclado:
  cpf(v) {
    // Pega no máximo os primeiros 11 números digitados:
    const d = digitos(v).slice(0, 11);
    return d
      // Após os 3 primeiros números, coloca o primeiro ponto: 123 -> 123.
      .replace(/^(\d{3})(\d)/, '$1.$2')
      // Após os 6 primeiros números, coloca o segundo ponto: 123.456 -> 123.456.
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      // Antes dos 2 últimos números, coloca o traço: 123.456.789 -> 123.456.789-00
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  },

  // Máscara de telefone celular com DDD:
  celular(v) {
    const d = digitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    // Formato final: (11) 98765-4321
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },

  // Máscara de CEP com hífen: 01310-100
  cep(v) {
    const d = digitos(v).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },

  // Máscara de cartão de crédito separando de 4 em 4 números:
  cartao(v) {
    return digitos(v)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  },

  // Máscara de validade do cartão: MM/AA
  validade(v) {
    const d = digitos(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },

  cvv(v) {
    return digitos(v).slice(0, 4);
  },
};

/** Liga as máscaras em todos os inputs com data-mascara="cpf" (etc.) dentro de `raiz`. */
export function ligarMascaras(raiz = document) {
  // Busca no HTML todos os campos que possuem o atributo data-mascara (ex: <input data-mascara="cpf">)
  raiz.querySelectorAll('input[data-mascara]').forEach((el) => {
    // Procura no objeto 'mascaras' a função correspondente (ex: mascaras['cpf'])
    const fn = mascaras[el.dataset.mascara];
    // Adiciona o ouvinte de evento 'input': toda vez que o usuário digita uma tecla, formata o valor na tela
    if (fn) el.addEventListener('input', () => (el.value = fn(el.value)));
  });
}

/* ---------- Regras Matemáticas e Algoritmos ---------- */

/**
 * VALIDAÇÃO MATEMÁTICA DE CPF (Algoritmo da Receita Federal):
 * SE O PROFESSOR PERGUNTAR: "Explique como seu código sabe se o CPF é falso ou verdadeiro."
 */
export function cpfValido(cpf) {
  // LINHA 1: Limpa pontuações deixando apenas os 11 dígitos numéricos
  const d = digitos(cpf);

  // LINHA 2: d.length !== 11 || /^(\d)\1{10}$/.test(d)
  // O QUE FAZ: Rejeita se não tiver exatamente 11 dígitos OU se for uma sequência repetida inválida.
  // A regex /^(\d)\1{10}$/ detecta repetições como 000.000.000-00, 111.111.111-11, etc.
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;

  // LINHA 3: Função 'calc(n)' que calcula o dígito verificador pela regra do Módulo 11 da Receita
  const calc = (n) => {
    let soma = 0;
    // Multiplica cada dígito por um peso decrescente (ex: para o 1º dígito, pesos de 10 até 2):
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    // Multiplica a soma por 10 e pega o resto da divisão por 11:
    const resto = (soma * 10) % 11;
    // Se o resto for 10, a regra da Receita manda considerar 0:
    return resto === 10 ? 0 : resto;
  };

  // LINHA 4: Confere se o 1º dígito calculado (calc(9)) bate com o 10º dígito do CPF (d[9])
  // E se o 2º dígito calculado (calc(10)) bate com o 11º dígito do CPF (d[10]):
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

// Validação de E-mail usando Regex para garantir formato 'usuario@dominio.com':
export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());

// Validação de Celular brasileiro: exige 2 dígitos de DDD + número 9 inicial + 8 dígitos seguintes:
export const celularValido = (c) => /^\d{2}9\d{8}$/.test(digitos(c));

// Validação de CEP: confere se possui exatamente 8 dígitos numéricos:
export const cepValido = (c) => digitos(c).length === 8;

/**
 * Algoritmo de Luhn (Módulo 10):
 * Padrão internacional (ISO/IEC 7812) utilizado para verificar a integridade
 * de números de cartões de crédito (Visa, Mastercard, Elo, etc.) antes de
 * submeter a cobrança ao gateway de pagamento.
 */
export function luhn(numero) {
  const d = digitos(numero);
  if (d.length < 13) return false;
  let soma = 0;
  let dobrar = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (dobrar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    dobrar = !dobrar;
  }
  return soma % 10 === 0;
}

/** Bandeira pelo prefixo (simplificado para o protótipo). */
export function bandeira(numero) {
  const d = digitos(numero);
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d))
    return 'Elo';
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  return '';
}

export function validadeOk(mmaa) {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmaa || '');
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const agora = new Date();
  return ano > agora.getFullYear() || (ano === agora.getFullYear() && mes >= agora.getMonth() + 1);
}

/** Força da senha de 0 a 4 + rótulo. */
export function forcaSenha(s) {
  let pontos = 0;
  if (s.length >= 8) pontos++;
  if (s.length >= 12) pontos++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) pontos++;
  else if (/\d/.test(s) || /[^A-Za-z0-9]/.test(s)) pontos += 0.5;
  const nivel = Math.min(4, Math.floor(pontos));
  return { nivel, rotulo: ['muito fraca', 'fraca', 'ok', 'boa', 'forte'][nivel] };
}

/* ---------- regras para o validador de formulário ----------
   Cada regra devolve a mensagem de erro, ou null se está tudo certo.
   No HTML: <input name="cpf" data-regras="obrigatorio cpf"> */

const quandoPreenchido = (teste, msg) => (v) => (!v || teste(v) ? null : msg);

export const REGRAS = {
  obrigatorio: (v, el) =>
    (el.type === 'checkbox' ? el.checked : String(v).trim()) ? null : 'obrigatório.',
  nome: quandoPreenchido((v) => v.trim().split(/\s+/).length >= 2, 'digite nome e sobrenome.'),
  cpf: quandoPreenchido(cpfValido, 'CPF inválido. confere os números.'),
  celular: quandoPreenchido(celularValido, 'celular com DDD, ex.: (11) 91234-5678.'),
  email: quandoPreenchido(emailValido, 'digite um e-mail válido.'),
  cep: quandoPreenchido(cepValido, 'CEP com 8 dígitos.'),
  cartao: quandoPreenchido(luhn, 'número de cartão inválido.'),
  validade: quandoPreenchido(validadeOk, 'validade inválida ou vencida.'),
  cvv: quandoPreenchido((v) => /^\d{3,4}$/.test(v), '3 ou 4 dígitos.'),
  senha: quandoPreenchido((v) => v.length >= 8, 'a senha precisa de pelo menos 8 caracteres.'),
};

/**
 * Valida um campo pelas regras do atributo data-regras.
 * - data-igual="senha": precisa ser igual ao campo com esse name (confirmação de senha).
 * - data-msg-obrigatorio="…": troca a mensagem padrão de campo vazio.
 * - Campos desativados (disabled) ou escondidos dentro de [hidden] são ignorados.
 * Mostra a mensagem no elemento indicado pelo aria-describedby (classe .field-error).
 */
export function validarCampo(el, mostrar = true) {
  let erro = null;
  if (!el.disabled && !el.closest('[hidden]')) {
    for (const nome of (el.dataset.regras || '').split(/\s+/).filter(Boolean)) {
      erro = REGRAS[nome]?.(el.value, el) ?? null;
      // mensagem própria para campo vazio: data-msg-obrigatorio="digite seu e-mail."
      if (erro && nome === 'obrigatorio' && el.dataset.msgObrigatorio)
        erro = el.dataset.msgObrigatorio;
      if (erro) break;
    }
    if (!erro && el.dataset.igual) {
      const outro = el.form?.elements[el.dataset.igual];
      if (el.value && outro && outro.value !== el.value) erro = 'as senhas não batem.';
    }
  }
  if (mostrar) mostrarErro(el, erro);
  return erro;
}

export function mostrarErro(el, erro) {
  el.setAttribute('aria-invalid', erro ? 'true' : 'false');
  const alvo = document.getElementById(`${el.id}-erro`);
  if (alvo) {
    alvo.textContent = erro || '';
    alvo.hidden = !erro;
  }
}

/**
 * Liga validação "ao sair do campo" (blur) e, depois do primeiro erro, a cada tecla.
 * Devolve uma função que valida o formulário inteiro: retorna a lista de campos com erro.
 */
export function ligarValidacao(form) {
  const campos = () => [...form.querySelectorAll('[data-regras], [data-igual]')];
  form.addEventListener('focusout', (e) => {
    if (e.target.matches('[data-regras], [data-igual]') && e.target.value) validarCampo(e.target);
  });
  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') validarCampo(e.target);
  });
  form.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.matches('[data-regras]')) validarCampo(e.target);
  });
  return () => campos().filter((el) => validarCampo(el));
}
