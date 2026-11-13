# pílula\*

E-commerce de farmácia do **Projeto Integrador**: front-end em **HTML, CSS e JavaScript puros** e back-end em **Spring Boot** (Java 21).

A ideia de farmácia online é comum, então o diferencial está na direção de arte: um visual limpo de farmácia moderna com toques de anos 2000 / Windows 98, um carrossel com uma caixa de remédio em 3D e parallax, e cuidado com usabilidade e acessibilidade.

---

## 🌐 Deploys em Produção

| Serviço | Plataforma | Endereço |
|---|---|---|
| **Front-end** | Vercel | [https://pilula-frontend.vercel.app](https://pilula-frontend.vercel.app) |
| **Back-end (API)** | Railway | [https://pilula-api.up.railway.app](https://pilula-api.up.railway.app) |
| **Documentação da API** | Scalar (OpenAPI) | [https://pilula-api.up.railway.app/scalar](https://pilula-api.up.railway.app/scalar) |

> **Nota de resiliência:** O site consulta primeiro a API no Railway (`/api/catalogo`). Caso a API esteja em inicialização ou desligada, o front-end utiliza automaticamente o catálogo local de contingência (`frontend/assets/data/catalogo.json`), mantendo a navegação sempre funcional.

---

## Estrutura do repositório

```
pilulA/
├── frontend/          ← site (HTML, CSS, JS). Detalhes em frontend/README.md
│   ├── *.html             uma página por arquivo
│   ├── iniciar.bat        sobe o site em http://localhost:5500
│   └── assets/
│       ├── css/           base/ · components/ · pages/ · main.css
│       ├── js/            services/ · utils/ · components/ · pages/
│       │   └── config.js  configuração da URL da API (produção ou localhost)
│       ├── data/          catalogo.json (dados de contingência/teste)
│       └── img/           favicon e fotos dos produtos
├── backend/           ← API REST em Spring Boot. Detalhes em backend/README.md
│   ├── Procfile           comando de inicialização para produção (Railway/Render)
│   ├── .env.example       modelo dos dados de acesso ao Supabase (o .env não vai pro Git)
│   └── src/main/
│       ├── java/pilula/com/pilula/
│       │   ├── config/        segurança, CORS dinâmico e OpenAPI
│       │   ├── model/         entidades JPA (tabelas)
│       │   ├── repository/    interfaces Spring Data JPA
│       │   ├── service/       regras de negócio e JWT
│       │   ├── dto/           formato das respostas JSON
│       │   └── controller/    endpoints REST (/api/catalogo, /api/auth, /api/admin, /api/vendedor)
│       └── resources/db/      migrations do Flyway (tabelas e dados)
├── .vscode/           ← Live Server pré-configurado para servir a pasta frontend/
└── README.md          ← este arquivo
```

---

## Como rodar em desenvolvimento local

| O quê | Como rodar | Endereço local |
|---|---|---|
| **Front-end** | Dois cliques em `frontend/iniciar.bat`, ou **Go Live** no VS Code com a raiz aberta | http://localhost:5500 |
| **Back-end** | Criar `backend/.env` com as credenciais do Supabase, depois rodar `mvnw spring-boot:run` dentro de `backend/` | http://localhost:8080 · Documentação: http://localhost:8080/scalar |

> Para alternar o front-end entre o back-end local e produção, ajuste `apiUrl` em [`frontend/assets/js/config.js`](frontend/assets/js/config.js).

## Configurações e chaves: guia único

Não há um painel que reúna Supabase, Vercel, Railway e Mercado Pago. Use esta seção como checklist central; o modelo local é [`backend/.env.example`](backend/.env.example). Os valores reais ficam nos painéis dos respectivos serviços ou no arquivo `backend/.env` da sua máquina.

| Variável / configuração | Onde obter ou definir | Onde usar |
|---|---|---|
| `DB_URL` | Supabase → **Connect → Connection String → JDBC / Session pooler** | `backend/.env` local e **Railway → Variables** |
| `DB_USER` | Supabase → Connection String; no Session Pooler use `postgres.<project-ref>` | `backend/.env` e Railway |
| `DB_PASSWORD` | Senha do banco definida no Supabase ao criar o projeto (ou redefinida nas configurações do banco) | `backend/.env` e Railway |
| `JWT_SECRET` | Gere uma chave aleatória no PowerShell usando o comando abaixo; não é uma chave do Supabase | `backend/.env` e Railway. Use valores diferentes se preferir separar ambientes |
| `MERCADOPAGO_ACCESS_TOKEN` | Mercado Pago Developers → sua aplicação → **Credenciais de teste** durante desenvolvimento; credencial de produção só quando estiver pronto para operar | `backend/.env` e Railway. **Nunca** na Vercel, no JavaScript ou no Git |
| `FRONTEND_URL` | URL pública do site da Vercel; localmente `http://localhost:5500` | `backend/.env` e Railway |
| `ADMIN_BOOTSTRAP_EMAIL` | E-mail temporário para criar o primeiro admin; remova após a primeira inicialização | Secret temporário do backend |
| `ADMIN_BOOTSTRAP_PASSWORD` | Senha única de 16 a 72 bytes para o primeiro admin; remova após a primeira inicialização | Secret temporário do backend |
| `CORS_ORIGINS` | URL exata do site publicado na Vercel; pode incluir localhost para desenvolvimento | Railway. Localmente, o backend já permite localhost por padrão |
| `apiUrl` | URL pública do backend no Railway (ou `http://localhost:8080` local) | `frontend/assets/js/config.js`; o site estático da Vercel usa essa configuração do código, não um segredo |
| `PORT` | Injetada automaticamente pela Railway | Não precisa cadastrar manualmente |
| `JWT_EXPIRACAO_MS` | Opcional; já tem padrão de 24 horas | `backend/.env` ou Railway |
| `SHOW_SQL` | Opcional; em produção use `false` para reduzir logs | Railway |

Para gerar `JWT_SECRET` no PowerShell:

```powershell
[Convert]::ToBase64String((1..48 | % { Get-Random -Max 256 }))
```

### Sequência prática

1. **Local:** copie `backend/.env.example` para `backend/.env` e preencha `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` e `MERCADOPAGO_ACCESS_TOKEN` com credenciais de **teste** do Mercado Pago. Mantenha `FRONTEND_URL=http://localhost:5500`.
2. **Teste a aplicação:** a API local precisa acessar o Supabase; o front deve usar `http://localhost:8080` em `apiUrl`. Nunca cole valores reais no chat ou no repositório.
3. **Railway:** em **Project → serviço backend → Variables**, adicione as variáveis da tabela para produção. Comece com as credenciais de teste do Mercado Pago; aponte `FRONTEND_URL` e `CORS_ORIGINS` para o domínio público da Vercel. A Railway injeta `PORT`.
4. **Vercel:** não coloque nela `DB_PASSWORD`, `JWT_SECRET` nem o Access Token. Confira em [`frontend/assets/js/config.js`](frontend/assets/js/config.js) se `apiUrl` aponta para a URL do backend no Railway; publique/republique o front após mudar esse arquivo.
5. **Supabase:** mantenha as credenciais do banco no Supabase e copie-as somente para o backend local/Railway. O Mercado Pago é configurado separadamente; não há chave dele para buscar no Supabase.

O arquivo `.env` local está ignorado pelo Git. Para conferir quais **nomes** de variáveis estão cadastrados, veja Railway → **Variables**; o painel pode ocultar os valores secretos. Não compartilhe capturas com segredos. Veja também o [guia de Mercado Pago e limites atuais do checkout](backend/README.md#mercado-pago-checkout-pro). **Ainda faltam confirmação via webhook, pedidos persistidos e emissão fiscal; não mude para credenciais de produção antes de completar essas partes.**

## Perfis da loja

O cadastro público cria compradores. Para obter acesso administrativo, configure temporariamente `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD` nos secrets do backend, inicie a API e depois remova as duas variáveis. A conta admin promove compradores a vendedores pela tela [`frontend/admin.html`](frontend/admin.html); vendedores e admins gerenciam o catálogo em [`frontend/vendedor.html`](frontend/vendedor.html). Detalhes e rotas protegidas estão no [guia de perfis do backend](backend/README.md#perfis-de-comprador-vendedor-e-administrador). A migração V8 precisa ser aplicada no banco para habilitar o perfil.

---

## 🚀 Guia de Deploy

### 1. Front-end (Vercel)
1. Conecte o repositório na **Vercel**.
2. Defina o **Root Directory** como `frontend`.
3. Framework Preset: **Other** (HTML/JS estático).
4. Em [`frontend/assets/js/config.js`](frontend/assets/js/config.js), certifique-se de que a `apiUrl` aponte para o domínio do Railway:
   ```javascript
   window.APP_CONFIG = {
     apiUrl: 'https://pilula-api.up.railway.app'
   };
   ```

### 2. Back-end (Railway)
1. No **Railway**, conecte o repositório GitHub (`Tu3-z/pilulA`, branch `main`).
2. Defina o **Root Directory** do serviço como `/backend`.
3. Configure as seguintes **Variables** na aba do serviço:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_URL` | URL JDBC do Session Pooler do Supabase | `jdbc:postgresql://aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USER` | Usuário do Session Pooler (**atenção ao formato!**) | `postgres.<SEU_PROJECT_REF>` |
| `DB_PASSWORD` | Senha do banco no Supabase | `sua-senha-do-banco` |
| `JWT_SECRET` | Chave HMAC de 32+ caracteres para tokens de autenticação | Chave gerada aleatoriamente |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token da aplicação Mercado Pago (use credencial de teste durante desenvolvimento) | `TEST-...` |
| `FRONTEND_URL` | URL usada nos retornos do Checkout Pro | `https://pilula-frontend.vercel.app` |
| `CORS_ORIGINS` | URLs do front-end autorizadas (separadas por vírgula) | `https://pilula-frontend.vercel.app,https://pilula-frontend-txvins-projects.vercel.app,http://localhost:5500,http://127.0.0.1:5500` |
| `PORT` | Porta de escuta | Injetada automaticamente pelo Railway |
| `SHOW_SQL` | Mostra o SQL no log (opcional) | `false` em produção |

O **Healthcheck Path** do serviço é `/api/categorias`, com timeout de 300 s: o Spring + Flyway levam um tempo para subir, e o Railway só troca para a versão nova depois que essa rota responde.

O checkout usa Mercado Pago Checkout Pro: configure o Access Token apenas no backend. O fluxo atual inicia o pagamento, mas ainda não persiste pedidos, processa webhook, emite nota fiscal ou libera automaticamente a entrega; veja o [guia no backend](backend/README.md#mercado-pago-checkout-pro) antes de qualquer uso real.

> ⚠️ **Importante sobre o Supabase:** Ao conectar através do Session Pooler (`pooler.supabase.com`), o `DB_USER` **deve obrigatoriamente** seguir o formato `postgres.<project-ref>`. Não utilize apenas `postgres` nem inverta com a senha, sob pena de erro de tenant não encontrado (`FATAL: tenant/user ... not found`).

---

## Histórico

- `e216fed`: primeira versão do front em HTML/CSS/JS (visual 100% anos 2000).
- Branch **`angular`**: versão em Angular 22 guardada para consulta.
- `9573d07`: volta ao JavaScript puro, novo layout e carrossel 3D.
- `6c2f5d5`: separação do repositório em `frontend/` e `backend/`.
- `678625f`: cadastro e login salvos no Supabase com Spring Security e JWT.
- Atual: deploy em produção na Vercel (front-end) e Railway (back-end) com CORS dinâmico e variáveis de ambiente.

---

Projeto acadêmico do Senac. Produtos reais usados como dados de teste; preços ilustrativos. As marcas pertencem aos seus donos.
