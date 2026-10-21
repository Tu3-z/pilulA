# pílula\*

E-commerce de farmácia, front-end do **Projeto Integrador**, feito em **Angular 22**.

A ideia de farmácia online é comum, então o diferencial está na direção de arte: um visual **limpo de farmácia moderna** com **toques de anos 2000 / Windows 98** em pontos escolhidos:

- carrossel na home com uma **caixa de remédio em 3D** (CSS puro) e **parallax** que segue o mouse;
- fotos reais de produtos, com ilustração em SVG quando não há foto;
- detalhes retrô: o chat com cara de MSN/Windows 98, o pop-up "leu a bula?", o asterisco pixelado da marca e a "tela azul" do 404.

O retrô fica isolado na classe `.retro` (ver `src/styles/tokens.css`): qualquer bloco com essa classe volta a usar o bege de PC, as fontes pixeladas e as sombras duras.

## Como rodar (localhost)

Pré-requisito: **Node.js 22.22.3 ou mais novo** (a versão LTS de [nodejs.org](https://nodejs.org)).

**Jeito fácil (Windows):** dê dois cliques em **`iniciar.bat`**. Na primeira vez ele instala as dependências. Depois sobe o app em **http://localhost:4200** e abre o navegador.

**Pelo terminal:**

```bash
npm install     # só na primeira vez
npm start       # ng serve --open → http://localhost:4200
```

| Comando | O que faz |
|---|---|
| `npm start` | servidor de desenvolvimento com recarga automática |
| `npm run build` | build de produção em `dist/pilula/browser` |
| `npm run build:pages` | build pronto para o **GitHub Pages** (`/pilulA/` + `404.html` para as rotas funcionarem) |
| `npm run format` | formata o código com Prettier |

## Rotas

| Rota | Página | O que tem |
|---|---|---|
| `/` | Início | Carrossel (remédio 3D com parallax, cupom, farmacêutico), categorias, destaques, "Pense antes de tomar", envio de receita, chat com farmacêutico, newsletter |
| `/loja` | Loja | Catálogo com pastas e subpastas, marca, busca, ordenação. Todos os filtros ficam na URL: `/loja?cat=dermo&sub=protetor&marca=ISDIN&ordem=menor` |
| `/produto/:id` | Produto | Visualizador, preço, parcelas, quantidade, abas acessíveis e relacionados |
| `/carrinho` | Carrinho | Itens, cupom, frete grátis, receita obrigatória e checkout em etapas: dados → entrega → pagamento |
| `/entrar` | Entrar | Login e cadastro na caixa de "Logon" do Windows (`/entrar?voltar=/carrinho`) |
| `**` | 404 | "Tela azul" do Windows 98 (qualquer tecla volta pro início) |

Todas as páginas são carregadas sob demanda (*lazy loading*).

## Arquitetura

```
src/
├── index.html
├── styles.css                     ← importa o design system global
├── styles/
│   ├── tokens.css                 ← cores, fontes, espaçamentos, texturas (comece por aqui)
│   ├── base.css                   ← reset, tipografia, utilitários (.sky, .dither, .px…)
│   ├── components.css             ← cabeçalho, navbar, botões, janela Win98, cartões, rodapé…
│   └── forms.css                  ← campos, erros, opções de rádio
└── app/
    ├── app.ts / app.config.ts / app.routes.ts
    ├── core/                      ← regras de negócio, sem tela
    │   ├── models/catalogo.ts         tipos (Produto, Categoria, TipoReceita…)
    │   ├── services/
    │   │   ├── catalogo.service.ts    carrega o catálogo via HttpClient + busca
    │   │   ├── carrinho.service.ts    carrinho com signals + localStorage + frete/cupom/parcelas
    │   │   ├── sessao.service.ts      login/cadastro mock (senha em hash SHA-256)
    │   │   └── aviso.service.ts       avisos (toasts)
    │   └── utils/
    │       ├── validacao.ts           máscaras + validadores (CPF, celular, CEP, cartão/Luhn…)
    │       ├── arte.ts                ilustrações SVG dos produtos
    │       └── texto.ts               escape, formatação, storage seguro
    ├── shared/                    ← peças reutilizáveis
    │   ├── components/  header (navbar + menu Iniciar + busca), footer, janela, produto-card,
    │   │                preco, arte (foto ou SVG), caixa-3d, icone, avisos, erro-campo
    │   └── directives/  mascara (plMascara="cpf")
    └── pages/                     ← uma pasta por rota (ts + html + css)
        home (+ carrossel) · loja · produto · carrinho · entrar · nao-encontrada

public/
├── dados/catalogo.json            ← "API" mock: 57 produtos, 6 categorias, 24 subcategorias
└── img/
    ├── favicon.svg
    └── produtos/                  ← fotos reais (.webp) + faixa lateral usada na caixa 3D
```

### Conceitos de Angular usados

- **Componentes standalone**, com `ChangeDetectionStrategy.OnPush` e app **zoneless**.
- **Signals** (`signal`, `computed`, `effect`, `input`) para todo o estado. A conversão de observables usa `toSignal`.
- **Novo controle de fluxo** nos templates: `@if`, `@for`, `@switch`, `@empty`.
- **Roteamento**:
  - lazy loading das páginas;
  - `withComponentInputBinding` (o `:id` da rota vira `input()`);
  - âncoras (`#receita`, `#chat`);
  - título por rota;
  - filtros da loja guardados nos *query params*.
- **HttpClient**:
  - o catálogo é carregado antes da primeira tela (`provideAppInitializer`);
  - o CEP é consultado na API pública **ViaCEP**, com `debounceTime` / `switchMap` / `catchError`.
- **Reactive Forms** com validadores próprios (CPF, celular, cartão com Luhn, validade, senhas iguais).
  - Os campos de endereço e de cartão são ativados ou desativados conforme a opção escolhida.
  - Os erros são acessíveis (`aria-invalid` + `aria-describedby`).
- **Diretiva de máscara** (`plMascara`) e **content projection** (`<pl-janela>` com `<ng-content>`).
- **Pipe** `currency` com locale `pt-BR`.

> Para ligar num back-end real, troque a URL em `CatalogoService.URL` pelo endpoint da API. Os serviços de carrinho e sessão viram chamadas HTTP.

## Decisões de UX

A estética é forte, então algumas regras garantem que ela não atrapalhe o uso:

- **Nada se mexe enquanto a pessoa lê.** A faixa de benefícios é fixa, sem letreiro rolando. O carrossel para quando o mouse ou o foco estão nele e tem botão de pausa. Tudo respeita `prefers-reduced-motion`.
- **Só parece botão o que é botão.** Os `_ □ ×` decorativos só aparecem nas janelas retrô, e apagados. Os pop-ups e avisos que fecham de verdade têm um `×` real.
- **Nomes claros.** O botão da navbar se chama **Categorias** (não "Iniciar"). O caminho na página de produto usa nomes reais: Início › Loja › Medicamentos › Dor e febre. Os rótulos de formulário usam fonte de leitura, não a pixelada.
- **Uma busca só.** A busca fica no cabeçalho e, na loja, mostra o termo atual.
- **Loja escaneável:**
  - contagem de produtos ao lado do título;
  - filtros aplicados como **chips removíveis**, com "Limpar tudo";
  - no celular, os filtros ficam atrás de um botão **Filtros (n)**, e os produtos aparecem na primeira tela;
  - trocar de categoria entra no histórico, então o "voltar" do navegador funciona.
- **Feedback em toda ação:**
  - "Adicionar" vira "Adicionado ✓";
  - o cartão mostra quantos itens já estão no carrinho;
  - o produto mostra "Você tem N no carrinho · ver carrinho";
  - remover item do carrinho tem **Desfazer**.
- **Checkout guiado.** As etapas viram links que pulam para cada seção e ganham ✓ quando ficam completas. Os erros aparecem no próprio campo e num resumo junto ao botão de finalizar.
- **Avisos fora do caminho.** Os toasts aparecem no topo à direita no desktop e embaixo no celular. Nunca cobrem o botão de finalizar.
- **Acessibilidade:**
  - foco visível também no fundo escuro;
  - contraste dos textos conferido;
  - alvos de toque com no mínimo 44 px;
  - nada vaza para fora da tela no celular.

## Carrossel e caixa 3D

- **Carrossel** (`pages/home/carrossel`): troca a cada 7 s, com barrinha de progresso. Pausa com o mouse em cima, com o foco dentro e pelo botão ⏸. Também não troca sozinho para quem pediu "reduzir movimento" no sistema. Funciona com setas, bolinhas, ← → do teclado e arrastando no celular. Os slides escondidos ficam `inert`, então o Tab não cai em links invisíveis.
- **Parallax**: cada enfeite do slide (`.camada`) tem uma profundidade `--p`. O mouse define `--mx` e `--my` (de -1 a 1), e cada camada anda `--p` pixels. Quanto maior o `--p`, mais "perto" a camada parece.
- **Caixa 3D** (`shared/components/caixa-3d`): seis faces com `transform-style: preserve-3d`. A frente é a foto do produto e as laterais são uma faixa tirada da borda da foto. A caixa balança sozinha e, com o mouse, gira seguindo o ponteiro, com um brilho que corre pela frente.
- **Vídeo (opcional)**: dá para trocar a caixa por um vídeo do remédio girando, gerado no **Higgsfield** a partir da foto. Coloque o MP4 em `public/video/` e preencha `VIDEO_DOR` em `carrossel.ts`.

**Fotos de produtos.** Basta colocar `"foto": "img/produtos/<id>.webp"` no produto do `catalogo.json`. Se a foto não existir ou não carregar, aparece a ilustração SVG.

## Design system

**Paleta.** São poucas cores, todas definidas em `src/styles/tokens.css`:

| Token | Uso |
|---|---|
| `--paper` `#F5F4F0` / `--paper-2` `#FFFFFF` | fundos e cartões |
| `--ink` `#121216` | texto, contornos e sombras duras |
| `--blue` `#2340B8` | **única cor de destaque**: botões, links, rótulos |
| `--night` `#0B153D` | céu de tempestade (hero e faixas) |
| `--plastic` `#F0F1F5` | superfície neutra (vira o bege de PC `#D9D3C3` dentro de `.retro`) |
| `--cross` / `--alert` | verde só na cruz da farmácia; vermelho só na tarja e em erros |

**Tipografia.**
- *Instrument Serif* para títulos.
- *Archivo* para texto, rótulos e preços.
- *Silkscreen* e *VT323* (pixeladas) só nos detalhes retrô.

## Funcionalidades

- **Navbar** fixa, no estilo da barra de tarefas do Win98:
  - menu **Iniciar** com subcategorias;
  - submenus por categoria;
  - relógio;
  - **busca com sugestões**. Ela busca por início de palavra (padrão combobox da WAI-ARIA, com ↑ ↓ Enter Esc).
  - No celular, tudo vai para o menu ☰.
- **Catálogo de teste** com produtos reais (Dorflex, Neosaldina, Centrum, Anthelios, CeraVe, Pampers…). O tipo de receita segue a regra brasileira:
  - `livre` (MIP);
  - `prescricao` (tarja vermelha);
  - `retencao` (tarja vermelha com retenção, como os antibióticos).
- **Carrinho** salvo no `localStorage`, sincronizado entre abas:
  - cupom `PILULA10`;
  - frete grátis acima de R$ 99;
  - até 3x sem juros, com parcela mínima de R$ 30.
- **Cadastro e login:**
  - CPF validado pelos dígitos verificadores;
  - máscaras de CPF e celular;
  - força da senha;
  - aceite LGPD.
- **Entrega:** em casa, com o endereço completado pelo ViaCEP, ou retirada na loja.
- **Pagamento:**
  - **Pix**, com QR ilustrativo, copia-e-cola e contador;
  - **cartão**, com prévia ao vivo, bandeira e validação de Luhn. Para testar, use `4111 1111 1111 1111`;
  - **na entrega**, com campo de troco.
- **Acessibilidade:**
  - link "pular para o conteúdo";
  - foco visível;
  - rótulos em todos os campos;
  - abas e combobox navegáveis pelo teclado;
  - `aria-live` nos avisos;
  - `prefers-reduced-motion`.

> ⚠️ O login é só um mock no `localStorage`, sem segurança real. Num sistema de verdade, a senha é validada no back-end (bcrypt/argon2) e a sessão fica num cookie `HttpOnly`. Nenhum dado de pagamento sai do navegador.

## Histórico

A primeira versão do protótipo era em HTML/CSS/JS puro e continua no histórico do Git: commit `e216fed`, antes da migração para Angular.

## Próximos passos (sugestões)

- [ ] Back-end com API REST (catálogo, pedidos, autenticação).
- [ ] Área do cliente: histórico de pedidos, receitas enviadas, endereços salvos.
- [ ] Testes unitários dos serviços de carrinho e validação (`ng generate config` + Vitest).
- [ ] Dados reais da farmácia no rodapé (CRF, AFE/ANVISA, CNPJ). Hoje estão como `[placeholder]`.

---

Projeto acadêmico. Produtos reais usados como dados de teste; preços ilustrativos. As marcas pertencem aos seus donos.
