# pílula\*

E-commerce de farmácia do **Projeto Integrador**: front-end em **HTML, CSS e JavaScript puros** e back-end em **Spring Boot** (Java 21).

A ideia de farmácia online é comum, então o diferencial está na direção de arte: um visual limpo de farmácia moderna com toques de anos 2000 / Windows 98, um carrossel com uma caixa de remédio em 3D e parallax, e cuidado com usabilidade e acessibilidade.

---

## 🌐 Deploys em Produção

| Serviço | Plataforma | Endereço |
|---|---|---|
| **Front-end** | Vercel | [https://pilula-frontend.vercel.app](https://pilula-frontend.vercel.app) |
| **Back-end (API)** | Railway | [https://pilula-backend.up.railway.app](https://pilula-backend.up.railway.app) |
| **Documentação da API** | Scalar (OpenAPI) | [https://pilula-backend.up.railway.app/scalar](https://pilula-backend.up.railway.app/scalar) |

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
│       │   └── controller/    endpoints REST (/api/catalogo, /api/auth)
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

---

## 🚀 Guia de Deploy

### 1. Front-end (Vercel)
1. Conecte o repositório na **Vercel**.
2. Defina o **Root Directory** como `frontend`.
3. Framework Preset: **Other** (HTML/JS estático).
4. Em [`frontend/assets/js/config.js`](frontend/assets/js/config.js), certifique-se de que a `apiUrl` aponte para o domínio do Railway:
   ```javascript
   window.APP_CONFIG = {
     apiUrl: 'https://pilula-backend.up.railway.app'
   };
   ```

### 2. Back-end (Railway)
1. No **Railway**, conecte o repositório GitHub (`Tu3-z/pilulA`, branch `main`).
2. Defina o **Root Directory** do serviço como `/backend`.
3. Configure as seguintes **Variables** na aba do serviço:

| Variável | Descrição | Exemplo |
|---|---|---|
| `DB_URL` | URL JDBC do Session Pooler do Supabase | `jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require` |
| `DB_USER` | Usuário do Session Pooler (**atenção ao formato!**) | `postgres.<SEU_PROJECT_REF>` |
| `DB_PASSWORD` | Senha do banco no Supabase | `sua-senha-do-banco` |
| `JWT_SECRET` | Chave HMAC de 32+ caracteres para tokens de autenticação | Chave gerada aleatoriamente |
| `CORS_ORIGINS` | URLs do front-end autorizadas (separadas por vírgula) | `https://pilula-frontend.vercel.app,https://pilula-frontend-txvins-projects.vercel.app,http://localhost:5500,http://127.0.0.1:5500` |
| `PORT` | Porta de escuta | Injetada automaticamente pelo Railway |

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
