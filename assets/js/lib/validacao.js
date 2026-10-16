/* ==========================================================================
   Máscaras e validações de formulário (CPF, celular, CEP, cartão, senha).
   ========================================================================== */

const digitos = (s) => String(s || '').replace(/\D/g, '');

/* ---------- máscaras ---------- */
export const mascaras = {
  cpf(v) {
    const d = digitos(v).slice(0, 11);
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
  },
  celular(v) {
    const d = digitos(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : '';
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },
  cep(v) {
    const d = digitos(v).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  },
  cartao(v) {
    const d = digitos(v).slice(0, 16);
    return d.replace(/(\d{4})(?=\d)/g, '$1 ');
  },
  validade(v) {
    const d = digitos(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv(v) {
    return digitos(v).slice(0, 4);
  },
};

/** Liga uma máscara a um input mantendo o cursor no fim. */
export function aplicarMascara(input, tipo) {
  input.addEventListener('input', () => {
    input.value = mascaras[tipo](input.value);
  });
}

/* ---------- validações ---------- */
export function cpfValido(cpf) {
  const d = digitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (n) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
export const celularValido = (c) => /^\d{2}9\d{8}$/.test(digitos(c));
export const cepValido = (c) => digitos(c).length === 8;

/** Algoritmo de Luhn (dígito verificador de cartões). */
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
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d)) return 'Elo';
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
  const n = Math.min(4, Math.floor(pontos));
  return { nivel: n, rotulo: ['muito fraca', 'fraca', 'ok', 'boa', 'forte'][n] };
}

/* ---------- mensagens de erro nos campos ---------- */
export function marcarErro(input, mensagem) {
  const idErro = `${input.id}-erro`;
  let el = document.getElementById(idErro);
  if (!el) {
    el = document.createElement('p');
    el.id = idErro;
    el.className = 'field-error';
    (input.closest('.form-field') || input.parentElement).appendChild(el);
  }
  const desc = (input.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== idErro);
  if (mensagem) {
    el.textContent = mensagem;
    el.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', [...desc, idErro].join(' '));
  } else {
    el.hidden = true;
    input.removeAttribute('aria-invalid');
    if (desc.length) input.setAttribute('aria-describedby', desc.join(' '));
    else input.removeAttribute('aria-describedby');
  }
  return !mensagem;
}
