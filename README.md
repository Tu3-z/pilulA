# pílula\*

E-commerce de farmácia, front-end do **Projeto Integrador**, feito com **HTML, CSS e JavaScript puros** (sem framework, sem build).

A ideia de farmácia online é comum, então o diferencial está na direção de arte: um visual **limpo de farmácia moderna** com **toques de anos 2000 / Windows 98** em pontos escolhidos:

- carrossel na home com uma **caixa de remédio em 3D** (CSS puro) e **parallax** que segue o mouse;
- fotos reais de produtos, com ilustração em SVG quando não há foto;
- detalhes retrô: o chat com cara de MSN/Windows 98, o pop-up "leu a bula?", o asterisco pixelado da marca e a "tela azul" do 404.

O retrô fica isolado na classe `.retro` (ver `assets/css/tokens.css`): qualquer bloco com essa classe volta a usar o bege de PC, as fontes pixeladas e as sombras duras.

## Como rodar (localhost)

O JavaScript usa **módulos** (`import`/`export`), e o catálogo é carregado com `fetch`. Por isso o site precisa de um servidor local: abrindo o `index.html` direto (`file://`), aparece uma faixa vermelha avisando. Escolha um jeito:

1. **Dois cliques (Windows):** abra o **`iniciar.bat`**. Ele sobe o site em **http://localhost:5500** e abre o navegador. Usa Node.js se tiver, senão Python. Para desligar, feche a janela preta.
2. **VS Code:** instale a extensão **Live Server** (o VS Code sugere ao abrir a pasta) e clique em **Go Live**, na barra de baixo. Ela já está configurada para a porta 5500.
3. **Terminal com Node.js:** `npm start` (não precisa de `npm install`).
4. **Python:** `python -m http.server 5500`.

> A porta do front é a **5500** para deixar a **8080** livre para o back-end (Spring Boot, pasta `backend/`).

O site também roda no **GitHub Pages** sem configuração extra.

## Páginas

| Página | Arquivo | O que tem |
|---|---|---|
| Início | `index.html` | Carrossel (remédio 3D com parallax, cupom, farmacêutico), categorias, destaques, "Pense antes de tomar", envio de receita, chat com farmacêutico, newsletter |
| Loja | `loja.html` | Catálogo com pastas e subpastas, marca, busca, ordenação e filtros. Tudo fica na URL: `loja.html?cat=dermo&sub=protetor&marca=ISDIN&ordem=menor` |
| Produto | `produto.html?id=…` | Foto ou ilustração, preço, parcelas, quantidade, abas acessíveis e relacionados |
| Carrinho | `carrinho.html` | Itens, cupom, frete grátis, receita obrigatória e checkout em etapas: dados → entrega → pagamento |
| Entrar | `entrar.html` | Login e cadastro (`entrar.html#criar`, `entrar.html?voltar=carrinho.html`) |
| 404 | `404.html` | "Tela azul" do Windows 98 (qualquer tecla volta pro início). O GitHub Pages usa esse arquivo sozinho |

## Estrutura

```
├── index.html, loja.html, produto.html, carrinho.html, entrar.html, 404.html
├── iniciar.bat                 ← dois cliques e o site abre em localhost:5500
├── package.json                ← npm start (opcional)
├── backend/                    ← API em Spring Boot (projeto separado)
└── assets/
    ├── css/
    │   ├── tokens.css          ← cores, fontes, espaçamentos e a classe .retro (comece por aqui)
    │   ├── base.css            ← reset, tipografia, utilitários
    │   ├── components.css      ← cabeçalho, navbar, botões, janelas, cartões, avisos, rodapé…
    │   ├── forms.css           ← campos, erros, opções de rádio
    │   ├── caixa3d.css         ← a caixa de remédio em 3D
    │   └── home.css, carrossel.css, loja.css, produto.css, carrinho.css, entrar.css, 404.css
    ├── dados/catalogo.json     ← "API" de mentira: 57 produtos, 6 categorias, 24 subcategorias
    ├── img/
    │   ├── favicon.svg
    │   └── produtos/           ← fotos reais (.webp) + faixa lateral usada na caixa 3D
    └── js/
        ├── core/               ← regras, sem tela
        │   ├── catalogo.js         carrega o catálogo + busca
        │   ├── carrinho.js         carrinho no localStorage + frete, cupom e parcelas
        │   ├── sessao.js           login/cadastro de mentira (senha em hash SHA-256)
        │   ├── validacao.js        máscaras, validações (CPF, celular, cartão/Luhn…) e o validador de formulário
        │   ├── avisos.js           avisos no canto da tela (toasts)
        │   ├── arte.js             ilustrações SVG dos produtos (e foto, quando tem)
        │   ├── icones.js           ícones em SVG
        │   └── texto.js            escape de HTML, formatação de preço, localStorage seguro
        ├── components/         ← peças usadas em várias páginas
        │   ├── layout.js           cabeçalho, busca com sugestões, menu "Categorias", rodapé
        │   ├── card.js             cartão de produto e preço
        │   └── caixa3d.js          monta a caixa 3D
        └── pages/              ← um arquivo por página (home, carrossel, loja, produto, carrinho, entrar, 404)
```

### Como as páginas funcionam

Cada página HTML tem dois marcadores, `<div id="topo">` e `<div id="rodape">`, e carrega **um** script de página (`<script type="module">`). O script:

1. chama `await iniciarLayout()`, que carrega o catálogo e coloca cabeçalho e rodapé no lugar dos marcadores;
2. desenha a parte que muda (lista de produtos, carrinho…) com *template strings*, sempre passando os textos por `esc()` para evitar injeção de HTML;
3. liga os eventos (`addEventListener`), em geral por **delegação** (um ouvinte no contêiner atende todos os itens, mesmo os desenhados depois).

O carrinho e a sessão avisam quando mudam (`aoMudar(fn)`), e cada parte da tela se redesenha. Assim o contador do cabeçalho, o "N no carrinho" dos cartões e o resumo do checkout ficam sempre iguais, até entre abas abertas.

**Formulários.** As regras ficam no próprio HTML: `<input data-regras="obrigatorio cpf" data-mascara="cpf">`. O `ligarValidacao(form)` valida ao sair do campo e mostra a mensagem no `<p class="field-error" id="<id do campo>-erro">`, ligado ao campo por `aria-describedby`. Campos dentro de um bloco escondido (`hidden`), como o endereço quando a pessoa escolhe retirar na loja, são ignorados.

**Ligar no back-end.** Troque `URL_CATALOGO` em `assets/js/core/catalogo.js` pelo endpoint da API (o back-end precisa liberar CORS para `http://localhost:5500`). Carrinho e sessão podem virar chamadas `fetch` sem mudar as páginas.

## Carrossel e caixa 3D

- **Carrossel** (`assets/js/pages/carrossel.js`): troca a cada 7 s, com barrinha de progresso. Pausa com o mouse em cima, com o foco dentro e pelo botão ⏸. Também não troca sozinho para quem pediu "reduzir movimento" no sistema. Funciona com setas, bolinhas, ← → do teclado e arrastando no celular. Os slides escondidos ficam `inert`, então o Tab não cai em links invisíveis.
- **Parallax**: cada enfeite do slide (`.camada`) tem uma profundidade `--p`. O mouse define `--mx` e `--my` (de -1 a 1), e cada camada anda `--p` pixels. Quanto maior o `--p`, mais "perto" a camada parece.
- **Caixa 3D** (`assets/js/components/caixa3d.js` + `assets/css/caixa3d.css`): seis faces com `transform-style: preserve-3d`. A frente é a foto do produto e as laterais são uma faixa tirada da borda da foto. A caixa balança sozinha e, com o mouse, gira seguindo o ponteiro, com um brilho que corre pela frente.
- **Vídeo (opcional)**: dá para trocar a caixa por um vídeo do remédio girando, gerado no **Higgsfield** a partir da foto. Coloque o MP4 em `assets/video/` e preencha `VIDEO_DOR` em `carrossel.js`.

**Fotos de produtos.** Basta colocar `"foto": "assets/img/produtos/<id>.webp"` no produto do `catalogo.json`. Se a foto não existir ou não carregar, aparece a ilustração SVG.

## Decisões de UX

A estética é forte, então algumas regras garantem que ela não atrapalhe o uso:

- **Nada se mexe enquanto a pessoa lê.** A faixa de benefícios é fixa, sem letreiro rolando. O carrossel para quando o mouse ou o foco estão nele e tem botão de pausa. Tudo respeita `prefers-reduced-motion`.
- **Só parece botão o que é botão.** Os `_ □ ×` decorativos só aparecem nas janelas retrô, e apagados. Os avisos que fecham de verdade têm um `×` real.
- **Nomes claros.** O botão da navbar se chama **Categorias**. O caminho na página de produto usa nomes reais: Início › Loja › Medicamentos › Dor e febre.
- **Uma busca só.** A busca fica no cabeçalho e, na loja, mostra o termo atual.
- **Loja escaneável:** contagem de produtos, filtros aplicados como **chips removíveis** com "Limpar tudo", filtros atrás de um botão **Filtros (n)** no celular, e o "voltar" do navegador funciona ao trocar de categoria.
- **Feedback em toda ação:** "Adicionar" vira "Adicionado ✓", o cartão mostra quantos itens já estão no carrinho, e remover item do carrinho tem **Desfazer**.
- **Checkout guiado.** As etapas viram links e ganham ✓ quando ficam completas. Os erros aparecem no próprio campo e num resumo junto ao botão de finalizar.
- **Acessibilidade:** foco visível, rótulos em todos os campos, abas e busca navegáveis pelo teclado, `aria-live` nos avisos, alvos de toque com no mínimo 44 px e nada vaza para fora da tela no celular.

## Design system

**Paleta.** São poucas cores, todas definidas em `assets/css/tokens.css`:

| Token | Uso |
|---|---|
| `--paper` `#F5F4F0` / `--paper-2` `#FFFFFF` | fundos e cartões |
| `--ink` `#15161C` | texto |
| `--blue` `#2340B8` | **única cor de destaque**: botões, links, rótulos |
| `--night` `#0B153D` | faixas escuras (hero, receita) |
| `--plastic` `#F0F1F5` | superfície neutra (vira o bege de PC `#D9D3C3` dentro de `.retro`) |
| `--cross` / `--alert` | verde só na cruz da farmácia; vermelho só na tarja e em erros |

**Tipografia.** *Instrument Serif* para títulos, *Archivo* para texto, rótulos e preços, e *Silkscreen* / *VT323* (pixeladas) só nos detalhes retrô.

## Funcionalidades

- **Navbar** fixa com menu **Categorias** (subcategorias), relógio e **busca com sugestões** por início de palavra (padrão combobox da WAI-ARIA, com ↑ ↓ Enter Esc). No celular, tudo vai para o menu ☰.
- **Catálogo de teste** com produtos reais (Dorflex, Neosaldina, Centrum, Anthelios, CeraVe, Pampers…). O tipo de receita segue a regra brasileira: `livre` (MIP), `prescricao` (tarja vermelha) e `retencao` (tarja vermelha com retenção, como antibióticos e controlados).
- **Carrinho** salvo no `localStorage` e sincronizado entre abas: cupom `PILULA10`, frete grátis acima de R$ 99 e até 3x sem juros com parcela mínima de R$ 30.
- **Cadastro e login:** CPF validado pelos dígitos verificadores, máscaras de CPF e celular, força da senha e aceite LGPD.
- **Entrega:** em casa, com o endereço completado pelo **ViaCEP**, ou retirada na loja.
- **Pagamento:** **Pix** (QR ilustrativo, copia-e-cola e contador), **cartão** (prévia ao vivo, bandeira e validação de Luhn; para testar use `4111 1111 1111 1111`) e **na entrega** (com campo de troco).

> ⚠️ O login é só de mentira, no `localStorage`, sem segurança real. Num sistema de verdade, a senha é validada no back-end (bcrypt/argon2) e a sessão fica num cookie `HttpOnly`. Nenhum dado de pagamento sai do navegador.

## Histórico

- `e216fed`: primeira versão em HTML/CSS/JS (visual 100% anos 2000).
- Branch **`angular`**: a mesma loja feita em Angular 22, guardada para consulta.
- Versão atual: de volta ao JavaScript puro, com o visual novo e o carrossel.

## Próximos passos (sugestões)

- [ ] Ligar o catálogo, o carrinho e o login no back-end (`backend/`).
- [ ] Área do cliente: histórico de pedidos, receitas enviadas, endereços salvos.
- [ ] Dados reais da farmácia no rodapé (CRF, AFE/ANVISA, CNPJ). Hoje estão como `[placeholder]`.

---

Projeto acadêmico. Produtos reais usados como dados de teste; preços ilustrativos. As marcas pertencem aos seus donos.
