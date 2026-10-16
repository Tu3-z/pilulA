const MAPA: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapa texto antes de montar HTML/SVG em string. */
export const esc = (valor: unknown): string =>
  String(valor ?? '').replace(/[&<>"']/g, (c) => MAPA[c]);

/** Minúsculas e sem acento, para comparar em buscas. */
export const semAcento = (s: string | null | undefined): string =>
  String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatBRL = (n: number): string => brl.format(n);

/** Lê do localStorage sem quebrar em aba anônima / storage bloqueado. */
export function lerStorage<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

export function gravarStorage(chave: string, valor: unknown): void {
  try {
    if (valor === null) localStorage.removeItem(chave);
    else localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* sem storage: o estado fica só em memória */
  }
}
