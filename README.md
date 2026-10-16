# pílula\*

E-commerce de farmácia, front-end do **Projeto Integrador**, feito em **Angular 22**.

A ideia de farmácia online é comum, então o diferencial está na direção de arte: **colagem anos 2000 / Windows 98**. Tem:

- céu de tempestade com nuvens;
- um computador bege desenhado em CSS;
- janelas e pop-ups do Windows, disquetes e retícula de impressão;
- títulos em serifa com letras pixeladas misturadas.

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
| `/` | Início | Hero com o PC retrô, categorias em disquetes, "Pense antes de tomar", destaques, envio de receita, chat com farmacêutico, newsletter |
| `/loja` | Loja | Catálogo numa janela do "Windows Explorer": pastas e subpastas, marca, busca, ordenação. Todos os filtros ficam na URL: `/loja?cat=dermo&sub=protetor&marca=ISDIN&ordem=menor` |
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
    │   │                preco, arte, icone, avisos, erro-campo
    │   └── directives/  mascara (plMascara="cpf")
    └── pages/                     ← uma pasta por rota (ts + html + css)
        home · loja · produto · carrinho · entrar · nao-encontrada

public/
├── dados/catalogo.json            ← "API" mock: 55 produtos, 6 categorias, 24 subcategorias
└── img/favicon.svg
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

- **Nada se mexe enquanto a pessoa lê.** A faixa de benefícios é fixa, sem letreiro rolando. Os pop-ups não flutuam e nenhum texto pisca. Tudo respeita `prefers-reduced-motion`.
- **Só parece botão o que é botão.** Os `_ □ ×` das janelas decorativas ficam apagados. Os pop-ups e avisos que fecham de verdade têm um `×` real. A tela do PC no topo é só ilustração.
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

## Design system

**Paleta.** São poucas cores, todas definidas em `src/styles/tokens.css`:

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
