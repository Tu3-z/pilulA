/* ==========================================================================
   Ilustrações dos produtos em SVG, desenhadas em código.
   Cada forma é desenhada duas vezes: uma sombra dura deslocada (.sh) e a peça.
   As cores vêm das classes .a-* definidas em components.css.
   ========================================================================== */

import { esc } from './util.js';

/** Rótulo em fonte pixelada que encolhe para caber na largura disponível. */
function rotulo(x, y, texto, largura, classe = 'a-label') {
  if (!texto) return '';
  const t = esc(texto);
  const estimada = texto.length * 13.5; // avanço médio do Silkscreen bold a 17px
  const ajuste = estimada > largura ? ` textLength="${largura}" lengthAdjust="spacingAndGlyphs"` : '';
  return `<text class="${classe}" x="${x}" y="${y}"${ajuste}>${t}</text>`;
}

const formas = {
  frasco: (r) => `
    <rect class="a-blue" x="80" y="24" width="40" height="28" rx="5"/>
    <rect class="a-paper" x="86" y="50" width="28" height="10"/>
    <rect class="a-paper" x="54" y="58" width="92" height="118" rx="20"/>
    <rect class="a-blue" x="60" y="96" width="80" height="46"/>
    <rect class="a-shine nos" x="64" y="68" width="8" height="22" rx="4"/>
    ${rotulo(100, 120, r, 70)}`,

  pump: (r) => `
    <rect class="a-paper" x="98" y="30" width="46" height="13" rx="3"/>
    <rect class="a-plastic" x="94" y="42" width="12" height="22"/>
    <rect class="a-blue" x="78" y="62" width="44" height="20" rx="4"/>
    <rect class="a-paper" x="56" y="80" width="88" height="98" rx="16"/>
    <rect class="a-blue" x="62" y="112" width="76" height="38"/>
    <rect class="a-shine nos" x="66" y="90" width="8" height="16" rx="4"/>
    ${rotulo(100, 132, r, 66)}`,

  bisnaga: (r) => `
    <g transform="rotate(-14 100 100)">
      <rect class="a-plastic" x="62" y="22" width="76" height="16"/>
      <path class="a-line" d="M72 24v12M82 24v12M92 24v12M102 24v12M112 24v12M122 24v12M132 24v12"/>
      <path class="a-paper" d="M62 38H138L128 150H72Z"/>
      <rect class="a-blue" x="80" y="148" width="40" height="28" rx="5"/>
      <rect class="a-blue" x="70" y="70" width="60" height="44"/>
      ${rotulo(100, 93, r, 52)}
    </g>`,

  capsula: () => `
    <g transform="rotate(-28 100 92)">
      <rect class="a-paper" x="30" y="68" width="140" height="50" rx="25"/>
      <path class="a-blue" d="M100 68H55A25 25 0 0 0 55 118H100Z"/>
      <rect class="a-shine nos" x="44" y="77" width="44" height="8" rx="4"/>
    </g>
    <g transform="rotate(24 140 154)">
      <rect class="a-paper" x="104" y="141" width="72" height="26" rx="13"/>
      <path class="a-blue" d="M140 141H117A13 13 0 0 0 117 167H140Z"/>
    </g>`,

  blister: (r) => {
    const bolhas = [];
    for (const cy of [80, 114]) {
      for (const cx of [62, 100, 138]) {
        bolhas.push(`<circle class="a-paper" cx="${cx}" cy="${cy}" r="14"/><circle class="a-shine nos" cx="${cx - 5}" cy="${cy - 5}" r="4"/>`);
      }
    }
    return `
    <g transform="rotate(-8 100 100)">
      <rect class="a-hi" x="32" y="50" width="136" height="110" rx="10"/>
      ${bolhas.join('')}
      <rect class="a-blue" x="32" y="136" width="136" height="24"/>
      ${rotulo(100, 149, r, 118)}
    </g>`;
  },

  caixa: (r) => `
    <polygon class="a-hi" points="40,64 64,42 172,42 148,64"/>
    <polygon class="a-plastic" points="148,64 172,42 172,140 148,162"/>
    <rect class="a-paper" x="40" y="64" width="108" height="98"/>
    <rect class="a-blue" x="40" y="98" width="108" height="34"/>
    ${rotulo(94, 116, r, 92)}`,

  kit: () => `
    <polygon class="a-hi" points="36,66 60,44 172,44 148,66"/>
    <polygon class="a-plastic" points="148,66 172,44 172,142 148,164"/>
    <rect class="a-paper" x="36" y="66" width="112" height="98"/>
    <rect class="a-plastic" x="74" y="54" width="36" height="12" rx="3"/>
    <path class="a-cross" d="M82 88H102V105H119V125H102V142H82V125H65V105H82Z"/>`,

  escova: () => `
    <g transform="rotate(-32 100 100)">
      <rect class="a-blue" x="18" y="94" width="126" height="18" rx="9"/>
      <rect class="a-paper" x="138" y="90" width="44" height="26" rx="8"/>
      <rect class="a-hi" x="144" y="66" width="34" height="24" rx="3"/>
      <path class="a-line" d="M152 70v16M161 70v16M170 70v16"/>
      <rect class="a-shine nos" x="30" y="98" width="40" height="5" rx="2.5"/>
    </g>`,

  termometro: () => `
    <g transform="rotate(-24 100 100)">
      <rect class="a-paper" x="24" y="84" width="130" height="34" rx="17"/>
      <rect class="a-plastic" x="152" y="95" width="34" height="12" rx="6"/>
      <rect class="a-night" x="46" y="91" width="58" height="20" rx="3"/>
      <text class="a-lcd" x="75" y="101">36.5</text>
      <circle class="a-blue" cx="128" cy="101" r="8"/>
    </g>`,

  bastao: (r) => `
    <g transform="rotate(16 100 100)">
      <rect class="a-blue" x="76" y="24" width="48" height="64" rx="8"/>
      <rect class="a-paper" x="76" y="86" width="48" height="90" rx="8"/>
      <rect class="a-plastic" x="76" y="86" width="48" height="12"/>
      <g transform="rotate(-90 100 138)">${rotulo(100, 138, r, 66, 'a-label a-label--ink')}</g>
    </g>`,

  pacote: (r) => `
    <rect class="a-paper" x="30" y="62" width="140" height="94" rx="28"/>
    <rect class="a-blue" x="70" y="76" width="60" height="28" rx="8"/>
    <rect class="a-shine nos" x="48" y="74" width="10" height="30" rx="5"/>
    ${rotulo(100, 132, r, 100, 'a-label a-label--ink')}`,

  gotas: (r) => `
    <path class="a-blue" d="M92 18H108L112 44H88Z"/>
    <rect class="a-plastic" x="80" y="42" width="40" height="18" rx="3"/>
    <path class="a-line" d="M88 44v14M96 44v14M104 44v14M112 44v14"/>
    <rect class="a-paper" x="64" y="58" width="72" height="116" rx="12"/>
    <rect class="a-blue" x="64" y="96" width="72" height="48"/>
    <rect class="a-shine nos" x="72" y="68" width="7" height="20" rx="3.5"/>
    ${rotulo(100, 121, r, 60)}
    <path class="a-blue" d="M152 128c0 10-14 10-14 0 0-6 7-14 7-14s7 8 7 14z"/>`,

  spray: (r) => `
    <rect class="a-blue" x="74" y="22" width="52" height="34" rx="6"/>
    <rect class="a-night" x="116" y="32" width="14" height="8" rx="2"/>
    <rect class="a-plastic" x="70" y="54" width="60" height="12" rx="3"/>
    <rect class="a-paper" x="66" y="64" width="68" height="114" rx="10"/>
    <rect class="a-blue" x="66" y="98" width="68" height="52"/>
    <rect class="a-shine nos" x="74" y="72" width="7" height="22" rx="3.5"/>
    ${rotulo(100, 125, r, 58)}`,

  pote: (r) => `
    <rect class="a-blue" x="46" y="54" width="108" height="30" rx="6"/>
    <path class="a-line" d="M58 58v22M70 58v22M82 58v22M94 58v22M106 58v22M118 58v22M130 58v22M142 58v22"/>
    <rect class="a-paper" x="50" y="82" width="100" height="86" rx="12"/>
    <rect class="a-hi" x="50" y="106" width="100" height="38"/>
    ${rotulo(100, 126, r, 86, 'a-label a-label--ink')}`,

  aparelho: () => `
    <g transform="rotate(-10 100 100)">
      <rect class="a-paper" x="40" y="50" width="120" height="104" rx="16"/>
      <rect class="a-night" x="56" y="64" width="88" height="44" rx="4"/>
      <text class="a-lcd" x="100" y="78">120/80</text>
      <text class="a-lcd" x="100" y="97">♥ 72</text>
      <circle class="a-blue" cx="100" cy="132" r="12"/>
      <rect class="a-plastic" x="60" y="126" width="16" height="10" rx="3"/>
      <rect class="a-plastic" x="124" y="126" width="16" height="10" rx="3"/>
    </g>`,

  fralda: (r) => `
    <rect class="a-paper" x="34" y="44" width="132" height="128" rx="14"/>
    <rect class="a-plastic" x="34" y="44" width="132" height="22" rx="10"/>
    <path class="a-line" d="M64 54h72"/>
    <rect class="a-blue" x="50" y="82" width="100" height="70" rx="10"/>
    <text class="a-label" x="100" y="117" style="font-size:44px">${esc(r)}</text>`,
};

/**
 * Retorna o SVG de um produto.
 * @param {{arte:{forma:string, rotulo:string}}} produto
 */
export function arte(produto) {
  const { forma, rotulo: texto = '' } = produto.arte;
  const desenhar = formas[forma] || formas.caixa;
  const corpo = desenhar(texto);
  return `<svg class="art-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <g class="sh" transform="translate(7 7)">${corpo}</g>
    <g>${corpo}</g>
  </svg>`;
}
