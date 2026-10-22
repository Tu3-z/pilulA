import { esc } from '../core/texto.js';

/**
 * Caixa de remédio em 3D feita só com CSS (transform-style: preserve-3d).
 * Os estilos estão em assets/css/caixa3d.css.
 *
 *   caixa3dHtml({
 *     frente: 'assets/img/produtos/x.webp',      // foto da frente (recortada)
 *     lado: 'assets/img/produtos/x-lado.webp',   // faixa tirada da borda da foto: vira as laterais
 *     topo: '#3cbfae', base: '#e7e7ea',          // cor das tampas
 *     proporcao: 0.545,                          // largura ÷ altura da frente
 *     profundidade: 0.62,                        // profundidade ÷ largura
 *   })
 *
 * O giro vem de fora, pelas variáveis CSS --rx e --ry (números, em graus).
 * O tamanho vem de --altura (ex.: 330px). Um ancestral precisa ter `perspective`.
 */
export function caixa3dHtml({
  frente,
  lado,
  alt = '',
  topo = '#fff',
  base = '#ddd',
  proporcao = 0.55,
  profundidade = 0.6,
}) {
  const estilo = `--proporcao: ${proporcao}; --prof: ${profundidade}; --topo: ${esc(topo)}; --base: ${esc(base)}`;
  const faixa = `style="background-image: url('${esc(lado)}')"`;
  return `
    <div class="caixa3d" style="${estilo}">
      <div class="caixa3d__corpo">
        <div class="caixa3d__face caixa3d__face--frente"><img src="${esc(frente)}" alt="${esc(alt)}" decoding="async"></div>
        <div class="caixa3d__face caixa3d__face--tras"></div>
        <div class="caixa3d__face caixa3d__face--dir" ${faixa}></div>
        <div class="caixa3d__face caixa3d__face--esq" ${faixa}></div>
        <div class="caixa3d__face caixa3d__face--topo"></div>
        <div class="caixa3d__face caixa3d__face--base"></div>
      </div>
    </div>`;
}
