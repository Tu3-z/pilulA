/* ==========================================================================
   Ilustrações dos produtos em SVG, desenhadas em código.
   Cada forma é desenhada duas vezes: uma sombra dura deslocada (.sh) e a peça.
   As cores vêm das classes .a-* definidas em components.css.
   ========================================================================== */

import { esc } from './util.js';

const formas = {
  frasco: (r) => `
    <rect class="a-blue" x="80" y="24" width="40" height="28" rx="5"/>
    <rect class="a-paper" x="86" y="50" width="28" height="10"/>
    <rect class="a-paper" x="54" y="58" width="92" height="118" rx="20"/>
    <rect class="a-blue" x="62" y="96" width="76" height="46"/>
    <rect class="a-shine nos" x="64" y="68" width="8" height="22" rx="4"/>
    <text class="a-label" x="100" y="120">${r}</text>`,

  pump: (r) => `
    <rect class="a-paper" x="98" y="30" width="46" height="13" rx="3"/>
    <rect class="a-plastic" x="94" y="42" width="12" height="22"/>
    <rect class="a-blue" x="78" y="62" width="44" height="20" rx="4"/>
    <rect class="a-paper" x="58" y="80" width="84" height="98" rx="16"/>
    <rect class="a-blue" x="66" y="112" width="68" height="38"/>
    <rect class="a-shine nos" x="68" y="90" width="8" height="16" rx="4"/>
    <text class="a-label" x="100" y="132">${r}</text>`,

  bisnaga: (r) => `
    <g transform="rotate(-14 100 100)">
      <rect class="a-plastic" x="64" y="22" width="72" height="16"/>
      <path class="a-line" d="M74 24v12M84 24v12M94 24v12M104 24v12M114 24v12M124 24v12"/>
      <path class="a-paper" d="M64 38H136L127 150H73Z"/>
      <rect class="a-blue" x="80" y="148" width="40" height="28" rx="5"/>
      <rect class="a-blue" x="76" y="70" width="48" height="50"/>
      <text class="a-label" x="100" y="96">${r}</text>
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
      <text class="a-label" x="100" y="149">${r}</text>
    </g>`;
  },

  caixa: (r) => `
    <polygon class="a-hi" points="40,64 64,42 172,42 148,64"/>
    <polygon class="a-plastic" points="148,64 172,42 172,140 148,162"/>
    <rect class="a-paper" x="40" y="64" width="108" height="98"/>
    <rect class="a-blue" x="40" y="98" width="108" height="34"/>
    <text class="a-label" x="94" y="116">${r}</text>`,

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
      <rect class="a-blue" x="78" y="24" width="44" height="64" rx="8"/>
      <rect class="a-paper" x="78" y="86" width="44" height="90" rx="8"/>
      <rect class="a-plastic" x="78" y="86" width="44" height="12"/>
      <text class="a-label a-label--ink" x="100" y="138" transform="rotate(-90 100 138)">${r}</text>
    </g>`,

  pacote: (r) => `
    <rect class="a-paper" x="30" y="62" width="140" height="94" rx="28"/>
    <rect class="a-blue" x="70" y="76" width="60" height="28" rx="8"/>
    <rect class="a-shine nos" x="48" y="74" width="10" height="30" rx="5"/>
    <text class="a-label a-label--ink" x="100" y="132">${r}</text>`,
};

/**
 * Retorna o SVG de um produto.
 * @param {{arte:{forma:string, rotulo:string}, nome:string}} produto
 */
export function arte(produto) {
  const { forma, rotulo = '' } = produto.arte;
  const desenhar = formas[forma] || formas.caixa;
  const corpo = desenhar(esc(rotulo));
  return `<svg class="art-svg" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
    <g class="sh" transform="translate(7 7)">${corpo}</g>
    <g>${corpo}</g>
  </svg>`;
}
