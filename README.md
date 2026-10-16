# pílula\*

E-commerce de farmácia — protótipo de front-end para o **Projeto Integrador**.

A ideia de farmácia online é comum, então o diferencial está na direção de arte: **colagem anos 2000 / Windows 98**. Tem céu de tempestade com nuvens, um computador bege desenhado em CSS, janelas e pop-ups do Windows, disquetes, retícula de impressão e títulos em serifa com letras pixeladas misturadas.

## Como rodar

O projeto usa só HTML, CSS e JavaScript (ES modules), sem build e sem dependências. Como os módulos não carregam via `file://`, sirva a pasta por HTTP de um destes jeitos:

```bash
# Python
python -m http.server 8080

# ou Node
npx serve .
```

Depois abra `http://localhost:8080`. No VS Code, a extensão **Live Server** também funciona. O site roda no **GitHub Pages** sem nenhuma configuração extra.

## Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Hero com o PC retrô, categorias em disquetes, "Pense antes de tomar", destaques, envio de receita, chat com farmacêutico, newsletter |
| Loja | `loja.html` | Catálogo dentro de uma janela do "Windows Explorer": pastas (categorias), busca, ordenação e filtros sincronizados com a URL (`?cat=vitaminas&q=…`) |
| Produto | `produto.html?id=…` | Visualizador da imagem, preço, quantidade, abas (descrição / como usar / avisos) e produtos relacionados |
| Carrinho | `carrinho.html` | Itens, cupom, barra de frete grátis estilo Win98, upload obrigatório de receita para tarja vermelha e checkout com confirmação |

## Estrutura

```
├── index.html, loja.html, produto.html, carrinho.html
└── assets/
    ├── css/
    │   ├── tokens.css        ← cores, fontes, espaçamentos, texturas (comece por aqui)
    │   ├── base.css          ← reset, tipografia, utilitários (.sky, .dither, .px…)
    │   ├── components.css    ← cabeçalho, botões, janela Win98, cartão de produto, rodapé…
    │   └── home.css, loja.css, produto.css, carrinho.css
    ├── img/favicon.svg
    └── js/
        ├── data/produtos.js        ← catálogo mock (trocar por API depois)
        ├── lib/carrinho.js         ← estado do carrinho + localStorage + cupom + frete
        ├── lib/arte.js             ← ilustrações dos produtos em SVG
        ├── lib/util.js             ← escape de HTML, ícones, helpers
        ├── components/layout.js    ← cabeçalho, rodapé e avisos injetados em todas as páginas
        ├── components/card-produto.js
        └── pages/home.js, loja.js, produto.js, carrinho.js
```

## Design system

**Paleta.** São poucas cores, todas definidas em `tokens.css`:

| Token | Uso |
|---|---|
| `--paper` `#F2EFE7` / `--paper-2` `#FBFAF5` | fundos e cartões |
| `--ink` `#121216` | texto, contornos e sombras duras |
| `--blue` `#2340B8` | **única cor de destaque**: botões, links, rótulos |
| `--night` `#0B153D` | céu de tempestade (hero e faixas) |
| `--plastic` `#D9D3C3` | bege de computador: janelas, botões de sistema |
| `--cross` / `--alert` | verde só na cruz da farmácia; vermelho só na tarja e em erros |

**Tipografia.**
- *Instrument Serif* para títulos.
- *Silkscreen* para letras pixeladas e rótulos.
- *VT323* para texto de terminal e preços.
- *Archivo* para o texto corrido.

**Assinaturas visuais.**
- `.px`: uma letra pixelada no meio de um título serifado (`Cuide de v<b class="px">o</b>cê`).
- `.win`: janela Win98, com `.win__bar`, `.win__body`, `.win__btn` e `.win__status`.
- `.sky`: céu com nuvens. É gerado por SVG `feTurbulence`, sem nenhuma imagem.
- `.dither`: nuvem de pontinhos azuis.
- `.outline`: serifa itálica vazada.

## Funcionalidades

- O carrinho fica salvo no `localStorage` e sincroniza entre abas.
- O cupom `PILULA10` dá 10% de desconto. O frete é grátis acima de R$ 99 (abaixo disso custa R$ 9,90).
- Medicamentos de tarja vermelha exigem anexar a receita antes de finalizar.
- Tudo que vem da URL ou do usuário passa por escape de HTML (`esc()` em `util.js`).
- Acessibilidade:
  - links "pular para o conteúdo";
  - foco visível;
  - rótulos em todos os campos;
  - abas navegáveis pelo teclado;
  - `aria-live` nos avisos;
  - respeito a `prefers-reduced-motion`.
- Layout responsivo do celular ao desktop.

## Próximos passos (sugestões)

- [ ] Ligar o catálogo e o checkout a um back-end (API REST).
- [ ] Login e área do cliente (pedidos, receitas enviadas).
- [ ] Dados reais da farmácia no rodapé (CRF, AFE/ANVISA, CNPJ). Hoje estão como `[placeholder]`.

---

Projeto acadêmico. Produtos e preços são ilustrativos.
