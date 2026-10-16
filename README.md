# pílula\*

E-commerce de farmácia — protótipo de front-end para o **Projeto Integrador**.

A ideia de farmácia online é comum, então o diferencial está na direção de arte: **colagem anos 2000 / Windows 98**. Tem céu de tempestade com nuvens, um computador bege desenhado em CSS, janelas e pop-ups do Windows, disquetes, retícula de impressão e títulos em serifa com letras pixeladas misturadas.

## Como rodar (localhost)

O projeto usa só HTML, CSS e JavaScript (ES modules), sem build. Os módulos não carregam abrindo o arquivo direto (`file://`), então ele precisa de um servidor local. Escolha um:

**1. Dois cliques (Windows).** Abra o **`iniciar.bat`**. Ele sobe o servidor em `http://localhost:8080` e abre o navegador. Para desligar, feche a janela preta.

**2. Terminal com Node.js.**
```bash
npm start
```
O comando sobe o `http-server` na porta 8080 e abre o navegador. Não precisa de `npm install`.

**3. VS Code.** Instale a extensão **Live Server** (o VS Code já sugere ao abrir a pasta). Depois clique em **Go Live**, na barra de baixo.

**4. Python.**
```bash
python -m http.server 8080
```

O site também roda no **GitHub Pages** sem configuração extra.

## Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Hero com o PC retrô, categorias em disquetes, "Pense antes de tomar", destaques, envio de receita, chat com farmacêutico, newsletter |
| Loja | `loja.html` | Catálogo dentro de uma janela do "Windows Explorer": pastas e subpastas (categorias), filtro por marca, busca, ordenação e filtros sincronizados com a URL (`?cat=dermo&sub=protetor&marca=ISDIN`) |
| Produto | `produto.html?id=…` | Visualizador da imagem, preço, quantidade, abas (descrição / como usar / avisos) e produtos relacionados |
| Carrinho | `carrinho.html` | Itens, cupom, barra de frete grátis estilo Win98, receita obrigatória para tarja vermelha e checkout em 3 etapas (dados → entrega → pagamento) |
| Entrar | `entrar.html` | Caixa de "Logon" do Windows com abas **Entrar** / **Criar conta** (`entrar.html#criar`, `?voltar=carrinho.html`) |
| 404 | `404.html` | "Tela azul" do Windows 98 (o GitHub Pages usa automaticamente) |

## Estrutura

```
├── index.html, loja.html, produto.html, carrinho.html, entrar.html, 404.html
├── iniciar.bat               ← dois cliques e o site abre em localhost:8080
├── package.json              ← npm start
└── assets/
    ├── css/
    │   ├── tokens.css        ← cores, fontes, espaçamentos, texturas (comece por aqui)
    │   ├── base.css          ← reset, tipografia, utilitários (.sky, .dither, .px…)
    │   ├── components.css    ← cabeçalho, botões, janela Win98, cartão de produto, rodapé…
    │   ├── forms.css         ← campos, erros, máscaras, opções de rádio
    │   └── home.css, loja.css, produto.css, carrinho.css, entrar.css
    ├── img/favicon.svg
    └── js/
        ├── data/produtos.js        ← catálogo mock com produtos reais (trocar por API depois)
        ├── lib/carrinho.js         ← estado do carrinho + localStorage + cupom + frete + parcelas
        ├── lib/sessao.js           ← login/cadastro mock (senha em hash SHA-256)
        ├── lib/validacao.js        ← máscaras e validações (CPF, celular, CEP, cartão/Luhn, senha)
        ├── lib/arte.js             ← ilustrações dos produtos em SVG
        ├── lib/util.js             ← escape de HTML, ícones, helpers
        ├── components/layout.js    ← cabeçalho, navbar, menu Iniciar, busca, rodapé e avisos
        ├── components/card-produto.js
        └── pages/home.js, loja.js, produto.js, carrinho.js, entrar.js
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

## Navbar

O cabeçalho fica fixo no topo e funciona como a **barra de tarefas do Windows 98**:

- **Iniciar** abre um menu Iniciar com todas as categorias e subcategorias, ofertas, receita, chat e conta.
- Cada categoria da barra abre um submenu ao passar o mouse ou focar pelo teclado.
- Na bandeja ficam o status "farmacêutico online" e um relógio ao vivo.
- A **busca** sugere produtos enquanto você digita. Ela busca por início de palavra ("dor" acha Dorflex e "dor de garganta", mas não "desodorante") e dá pra navegar com ↑ ↓ Enter Esc.
- No celular, a barra some e tudo vai para o menu ☰.

## Catálogo de teste

São 55 produtos reais do varejo farmacêutico (Dorflex, Neosaldina, Centrum, Anthelios, CeraVe, Colgate, Pampers…) em 6 categorias e 24 subcategorias, com marca, apresentação e preço aproximado de mercado. O tipo de receita segue a regra brasileira:

| `receita` | Significa | No site |
|---|---|---|
| `livre` | MIP / não-medicamento | compra normal |
| `prescricao` | tarja vermelha | exige anexar a receita |
| `retencao` | tarja vermelha com retenção (antibióticos) | exige anexar a receita; a original é retida na entrega |

Os preços são ilustrativos. As marcas pertencem aos seus donos e aparecem só como dado de teste.

## Formulários e pagamento

- **Cadastro:**
  - CPF com máscara e validação dos dígitos verificadores;
  - celular com DDD;
  - medidor de força da senha;
  - confirmação de senha;
  - aceite LGPD.
  - Os erros aparecem no próprio campo (`aria-invalid` + `aria-describedby`).
- **Login:** mostrar/ocultar senha e "esqueci a senha" (simulado). Depois de entrar, nome, CPF e celular já vêm preenchidos no checkout.
- **Entrega:**
  - receber em casa: o CEP completa o endereço sozinho pela API pública do **ViaCEP**;
  - ou retirar na loja, sem frete.
- **Pagamento:**
  - **Pix:** QR code ilustrativo, código copia-e-cola e contador de 30 min.
  - **Cartão:**
    - prévia do cartão desenhada ao vivo e bandeira detectada pelo número (Visa, Mastercard, Elo, Amex);
    - número validado pelo algoritmo de Luhn e validade conferida;
    - até **3x sem juros**, com parcela mínima de R$ 30.
    - Para testar, use `4111 1111 1111 1111`.
  - **Na entrega:** maquininha ou dinheiro, com campo de troco.

> ⚠️ O login é só um mock no `localStorage`, sem segurança real. Num sistema de verdade, a senha é validada no back-end (bcrypt/argon2) e a sessão fica num cookie `HttpOnly`. Nenhum dado de pagamento sai do navegador.

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
- [ ] Área do cliente (histórico de pedidos, receitas enviadas, endereços salvos).
- [ ] Dados reais da farmácia no rodapé (CRF, AFE/ANVISA, CNPJ). Hoje estão como `[placeholder]`.

---

Projeto acadêmico. Produtos e preços são ilustrativos.
