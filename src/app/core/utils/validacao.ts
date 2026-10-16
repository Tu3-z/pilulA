import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/* ==========================================================================
   Máscaras e validações (CPF, celular, CEP, cartão, senha)
   + validadores para Reactive Forms.
   ========================================================================== */

const digitos = (s: unknown) => String(s ?? '').replace(/\D/g, '');

export type TipoMascara = 'cpf' | 'celular' | 'cep' | 'cartao' | 'validade' | 'cvv';

export const mascaras: Record<TipoMascara, (v: string) => string> = {
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
    return digitos(v)
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, '$1 ');
  },
  validade(v) {
    const d = digitos(v).slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  },
  cvv(v) {
    return digitos(v).slice(0, 4);
  },
};

/* ---------- regras puras ---------- */

export function cpfValido(cpf: string): boolean {
  const d = digitos(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const calc = (n: number) => {
    let soma = 0;
    for (let i = 0; i < n; i++) soma += Number(d[i]) * (n + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return calc(9) === Number(d[9]) && calc(10) === Number(d[10]);
}

export const emailValido = (e: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e || '').trim());
export const celularValido = (c: string) => /^\d{2}9\d{8}$/.test(digitos(c));
export const cepValido = (c: string) => digitos(c).length === 8;

/** Algoritmo de Luhn (dígito verificador de cartões). */
export function luhn(numero: string): boolean {
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
export function bandeira(numero: string): string {
  const d = digitos(numero);
  if (/^(4011|4312|4389|4514|4576|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(d))
    return 'Elo';
  if (/^4/.test(d)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  return '';
}

export function validadeOk(mmaa: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(mmaa || '');
  if (!m) return false;
  const mes = Number(m[1]);
  const ano = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const agora = new Date();
  return ano > agora.getFullYear() || (ano === agora.getFullYear() && mes >= agora.getMonth() + 1);
}

/** Força da senha de 0 a 4 + rótulo. */
export function forcaSenha(s: string): { nivel: number; rotulo: string } {
  let pontos = 0;
  if (s.length >= 8) pontos++;
  if (s.length >= 12) pontos++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) pontos++;
  if (/\d/.test(s) && /[^A-Za-z0-9]/.test(s)) pontos++;
  else if (/\d/.test(s) || /[^A-Za-z0-9]/.test(s)) pontos += 0.5;
  const nivel = Math.min(4, Math.floor(pontos));
  return { nivel, rotulo: ['muito fraca', 'fraca', 'ok', 'boa', 'forte'][nivel] };
}

/* ---------- validadores Angular ----------
   Cada um devolve { chave: 'mensagem' } — o componente de erro mostra a mensagem. */

const regra =
  (teste: (v: string) => boolean, chave: string, msg: string): ValidatorFn =>
  (c: AbstractControl): ValidationErrors | null =>
    !c.value || teste(String(c.value)) ? null : { [chave]: msg };

export const Validadores = {
  obrigatorio:
    (msg = 'obrigatório.'): ValidatorFn =>
    (c) =>
      c.value === true || (typeof c.value === 'string' ? c.value.trim() : c.value)
        ? null
        : { obrigatorio: msg },
  nomeCompleto: regra((v) => v.trim().split(/\s+/).length >= 2, 'nome', 'digite nome e sobrenome.'),
  cpf: regra(cpfValido, 'cpf', 'CPF inválido. confere os números.'),
  celular: regra(celularValido, 'celular', 'celular com DDD, ex.: (11) 91234-5678.'),
  email: regra(emailValido, 'email', 'digite um e-mail válido.'),
  cep: regra(cepValido, 'cep', 'CEP com 8 dígitos.'),
  cartao: regra(luhn, 'cartao', 'número de cartão inválido.'),
  validade: regra(validadeOk, 'validade', 'validade inválida ou vencida.'),
  cvv: regra((v) => /^\d{3,4}$/.test(v), 'cvv', '3 ou 4 dígitos.'),
  senha: regra((v) => v.length >= 8, 'senha', 'a senha precisa de pelo menos 8 caracteres.'),
  /** para o grupo: confere se `campo` é igual a `outro` */
  iguais:
    (campo: string, outro: string, msg = 'as senhas não batem.'): ValidatorFn =>
    (g) => {
      const a = g.get(campo);
      const b = g.get(outro);
      if (!a || !b) return null;
      const erro = b.value && a.value !== b.value ? { iguais: msg } : null;
      // o erro aparece no campo de confirmação
      const atuais = { ...(b.errors ?? {}) };
      delete atuais['iguais'];
      b.setErrors(erro ? { ...atuais, ...erro } : Object.keys(atuais).length ? atuais : null);
      return null;
    },
};

/** Primeira mensagem de erro de um controle (ou null). */
export function mensagemDeErro(c: AbstractControl | null): string | null {
  if (!c?.errors) return null;
  const primeiro = Object.values(c.errors)[0];
  return typeof primeiro === 'string' ? primeiro : 'campo inválido.';
}
