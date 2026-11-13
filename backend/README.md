# pílula\* — back-end

API REST em **Spring Boot** (Java 21, Maven, JPA) com banco **PostgreSQL no Supabase**. As tabelas são criadas e populadas pelo **Flyway**. Visão geral do projeto no [README da raiz](../README.md).

## Primeira vez: ligar no Supabase

Cada pessoa do grupo faz isso uma vez no próprio computador. O banco é um só, na nuvem, e todo mundo usa o mesmo.

1. **Criar o projeto (só uma pessoa do grupo).** Em [supabase.com](https://supabase.com), clique em *New project*. Escolha a região **South America (São Paulo)** e anote a **senha do banco** (*Database Password*). Depois, convide o grupo em *Project Settings → Team*.
2. **Pegar os dados de conexão.** No projeto, clique em **Connect** (no topo), aba **Connection String**. Escolha **Type: JDBC** e **Method: Session pooler**. O Session pooler funciona em qualquer rede; a conexão "Direct" pede IPv6.
3. **Criar o arquivo `.env`.** Copie `backend/.env.example` para `backend/.env` e preencha:
   ```properties
   DB_URL=jdbc:postgresql://aws-0-sa-east-1.pooler.supabase.com:5432/postgres?sslmode=require
   DB_USER=postgres.abcdefghijklmnop
   DB_PASSWORD=a-senha-do-banco
   JWT_SECRET=uma-chave-aleatoria-com-pelo-menos-32-caracteres
   MERCADOPAGO_ACCESS_TOKEN=TEST-seu_access_token_de_teste
   FRONTEND_URL=http://localhost:5500
   ```
   O `.env` está no `.gitignore`: **a senha nunca vai pro GitHub**. Passe pro grupo por mensagem privada, não no repositório.

   O `JWT_SECRET` assina os tokens de login e precisa ter **no mínimo 32 caracteres**; sem ele a API não sobe. Gere um no PowerShell:
   ```powershell
   [Convert]::ToBase64String((1..48 | % { Get-Random -Max 256 }))
   ```
4. **Subir a API.** Pré-requisito: **Java 21** (`java -version`). O Maven vem junto (`mvnw`).
   ```bash
   cd backend
   ./mvnw spring-boot:run        # Windows: mvnw spring-boot:run
   ```
   Na primeira vez, o Flyway cria as tabelas e coloca os 57 produtos. Dá pra ver tudo no Supabase em **Table Editor**.
5. **Fechar a tabela do Flyway (uma vez só, por quem criou o projeto).** No Supabase, abra o **SQL Editor** e rode:
   ```sql
   ALTER TABLE flyway_schema_history ENABLE ROW LEVEL SECURITY;
   ```
   As outras tabelas a migration V3 já protege. Esta é a do próprio Flyway, que não pode ser alterada enquanto ele roda.
6. **Conferir.** Abra http://localhost:8080/api/catalogo. Depois abra o site (Live Server); no console do navegador (F12) deve aparecer `catálogo carregado da API`.

Se a API estiver desligada, o site continua funcionando com o JSON local (`frontend/assets/data/catalogo.json`).

## Banco de dados (Flyway)

As tabelas **não** são criadas pelo Hibernate. Quem cuida delas são as *migrations*, arquivos SQL numerados que o Flyway roda uma vez cada, em ordem, quando a API sobe:

| Arquivo | O que faz |
|---|---|
| `db/migration/V1__criar_tabelas_catalogo.sql` | cria `categoria`, `subcategoria` e `produto` (com chaves, `CHECK` de preço/receita e índices) |
| `db/migration/V2__popular_catalogo.sql` | coloca as 6 categorias, 24 subcategorias e 57 produtos |
| `db/supabase/V3__habilitar_rls.sql` | liga o RLS no Supabase (em `categoria`, `subcategoria` e `produto`), para ninguém mexer nas tabelas pela API pública dele (só o nosso back-end acessa) |
| `db/migration/V4__ids_numericos_e_slug.sql` | troca as chaves: cada tabela ganha um `id` numérico gerado pelo banco (1, 2, 3…) e o código em texto (`dorflex-36`) vira a coluna `slug`, única, usada nos links do site. Os dados são copiados sem perder nada |
| `db/supabase/V5__habilitar_rls_tabelas_novas.sql` | liga o RLS de novo, porque a V4 recriou as tabelas |
| `db/migration/V6__criar_tabela_usuario.sql` | tabela `usuario` (e-mail único, senha só como hash BCrypt) |
| `db/supabase/V7__habilitar_rls_usuario.sql` | liga o RLS na `usuario` (sem isso a Data API do Supabase exporia os usuários) |
| `db/migration/V8__adicionar_perfil_usuario.sql` | adiciona o perfil (`COMPRADOR`, `VENDEDOR` ou `ADMIN`); contas existentes começam como comprador |

O Flyway anota o que já rodou na tabela `flyway_schema_history`. Regras:

- **Para mudar o banco, crie um arquivo novo** (`V4__adiciona_estoque.sql`…). Nunca edite um V1/V2/V3 que já rodou: o Flyway confere o conteúdo e a API não sobe.
- Mexeu na estrutura de uma tabela? Ajuste também a entidade em `model/`.
- Os testes (`./mvnw test`) usam um banco **H2 em memória** com as mesmas migrations V1 e V2, sem internet e sem tocar no Supabase.

## Documentação da API (Scalar)

Com a API rodando, abra **http://localhost:8080/scalar**. É uma página com todos os endpoints, os parâmetros, os formatos de resposta (com exemplos) e um botão **Test Request** para chamar cada endpoint ali mesmo.

- A página é gerada sozinha a partir dos controllers pelo **springdoc**, que monta a especificação OpenAPI em http://localhost:8080/v3/api-docs. O **Scalar** só desenha essa especificação.
- Endpoint novo aparece lá automaticamente. Para ficar bem documentado, use as anotações:
  - `@Tag`: o grupo, no controller;
  - `@Operation`: resumo e descrição, em cada método;
  - `@Parameter`: descrição e exemplo de um parâmetro;
  - `@ApiResponse`: as respostas possíveis, como 404;
  - `@Schema`: descrição e exemplo dos campos, nos DTOs.
- Título e descrição gerais ficam em `config/OpenApiConfig.java`.
- O Postman e o Insomnia também importam a especificação: é só colar a URL `/v3/api-docs`.

## Endpoints

| Método e rota | O que devolve |
|---|---|
| `GET /api/catalogo` | categorias (com subcategorias) + produtos, no formato que o front usa (igual a `frontend/assets/data/catalogo.json`, mais o `slug` e o `id` numérico) |
| `GET /api/categorias` | só as categorias, com as subcategorias dentro |
| `GET /api/produtos` | todos os produtos (`?categoria=dermo` filtra por categoria) |
| `GET /api/produtos/{id}` | um produto pelo id numérico (ex.: `/api/produtos/1`), ou **404** se não existir |
| `GET /api/produtos/slug/{slug}` | um produto pelo código público (ex.: `/api/produtos/slug/dorflex-36`), ou **404** |
| `POST /api/auth/cadastrar` | cria a conta (`nome`, `email`, `senha` com 8+ caracteres, `cpf` e `celular` opcionais) e devolve o usuário + `token`. **409** se o e-mail já existe, **400** com os campos errados |
| `POST /api/auth/entrar` | `email` + `senha` → usuário + `token`, ou **401** |
| `GET /api/auth/eu` | 🔒 dados de quem está logado |
| `POST /api/checkout/preferencia` | Recalcula o carrinho pelo banco e cria uma preferência do Mercado Pago Checkout Pro |
| `GET /api/admin/usuarios` | 🔒 lista contas para administradores |
| `PATCH /api/admin/usuarios/{id}/perfil` | 🔒 altera um perfil; não remove o último admin |
| `/api/vendedor/produtos` (`GET`, `POST`, `PUT /{id}`, `DELETE /{id}`) | 🔒 gerencia produtos para vendedor/admin |

**Ids.** Cada categoria, subcategoria e produto tem um `id` numérico (gerado pelo banco, usado nas relações e na busca `/api/produtos/{id}`) e um `slug` em texto (único, usado nos links do site). A API devolve os dois. Nos produtos, `categoria` e `subcategoria` vêm pelo slug. O front usa o slug como identificador (ver `comSlug` em `frontend/assets/js/services/catalogo.js`).

**Login (JWT).** O cadastro e o login devolvem um `token`. As rotas marcadas com 🔒 exigem o cabeçalho `Authorization: Bearer <token>`; sem ele respondem **401**. O token vale 24h (`JWT_EXPIRACAO_MS`). O catálogo continua público. A senha é guardada só como hash BCrypt (`senha_hash`). No Scalar: faça o login, copie o `token` e cole em *Authentication*. Quem confere o token é o `security/JwtFiltro.java`; as regras de quais rotas são públicas ficam em `config/SecurityConfig.java`.

O front já tenta a API primeiro (`frontend/assets/js/services/catalogo.js`) e só usa o JSON local se ela não responder. O CORS para o front em `http://localhost:5500` e `http://127.0.0.1:5500` já está liberado.

## Mercado Pago Checkout Pro

1. Crie uma aplicação em [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel) e, primeiro, use as **credenciais de teste**. Copie o **Access Token de teste** (não a Public Key) para `MERCADOPAGO_ACCESS_TOKEN` em `backend/.env`. O token fica somente no servidor e nunca deve ir para `frontend/assets/js/config.js` ou para o GitHub.
2. Deixe `FRONTEND_URL=http://localhost:5500` no teste local. Em `frontend/assets/js/config.js`, troque temporariamente `apiUrl` para `http://localhost:8080`. Suba a API e o front-end; adicione um produto de receita livre e finalize. Informe nome, CPF, e-mail e celular; escolha entrega e preencha o endereço, ou selecione retirada. A API usa os preços do banco para calcular o valor e abre a URL de sandbox devolvida pelo Mercado Pago.
3. Use uma conta compradora de teste e os meios de pagamento de teste fornecidos no painel do Mercado Pago. Não use seu cartão/conta real para simular compra.
4. Em produção, configure `MERCADOPAGO_ACCESS_TOKEN` no painel do Railway (não no repositório) e `FRONTEND_URL` com o domínio HTTPS do site. O front precisa apontar para a API publicada.

Este primeiro passo **cria a preferência e redireciona ao Mercado Pago**, mas ainda não salva um pedido no banco, não recebe webhook nem confirma automaticamente o pagamento. O retorno do navegador não é prova de pagamento: confira o status no painel do Mercado Pago. Para operar de verdade, falta implementar persistência de pedidos, webhook assinado, conciliação e processo de entrega.

**Nota fiscal:** o Checkout Pro não emite NF-e/NFC-e. O projeto não tem empresa emissora, certificado fiscal, ERP ou integração com provedor fiscal; portanto não é possível gerar uma nota válida neste momento. O CPF preenchido é enviado ao Mercado Pago, mas isso não substitui a emissão. Escolha um ERP/provedor fiscal e confirme os requisitos com o contador antes de automatizar.

**Medicamentos com receita:** o endpoint recusa produtos que exigem receita ou retenção porque o projeto ainda não envia nem revisa receitas com um farmacêutico. Não coloque esse catálogo em venda real até implementar a análise e atender aos requisitos regulatórios aplicáveis.

## Perfis de comprador, vendedor e administrador

O cadastro público cria sempre `COMPRADOR`; enviar `"perfil": "ADMIN"` ou `"VENDEDOR"` no JSON não altera essa regra. O perfil é persistido no banco e carregado pelo backend em cada requisição autenticada, então mudanças de perfil têm efeito imediato sem confiar no valor guardado no navegador.

Para criar o primeiro admin localmente, defina temporariamente `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD` no `backend/.env`; a senha precisa ter de 16 a 72 bytes. Suba a API uma vez, faça login em `frontend/entrar.html` e **remova as duas variáveis**. A senha é salva somente com BCrypt. Se já existir uma conta para aquele e-mail, o bootstrap não a promove nem altera a senha.

Na Railway, configure as mesmas duas variáveis temporariamente no serviço backend para criar o primeiro administrador depois que a migration V8 for aplicada; após confirmar o login, remova-as. O admin pode abrir `admin.html`, listar contas e promover compradores a vendedores. Vendedores e admins acessam `vendedor.html` para criar, editar e remover produtos. A API protege as rotas; esconder links no front-end não é a proteção.

Quem controla `ADMIN_BOOTSTRAP_EMAIL` e `ADMIN_BOOTSTRAP_PASSWORD` pode obter acesso administrativo total: use uma senha única, longa e armazenada somente em secrets, não publique em Git e remova o bootstrap depois de criar o admin. Esta estrutura cobre contas e gerenciamento de catálogo; não implementa gestão de pedidos/pagamentos nem aprovação comercial formal de vendedor.

## Estrutura (arquitetura em camadas)

```
backend/
├── pom.xml                         ← dependências (Spring Web, JPA, Flyway, Security, Validation, PostgreSQL, Lombok, springdoc + Scalar; H2 só nos testes)
├── .env.example                    ← modelo do .env (dados de acesso ao Supabase; o .env de verdade não vai pro Git)
├── mvnw, mvnw.cmd, .mvn/           ← Maven Wrapper
└── src/
    ├── main/
    │   ├── java/pilula/com/pilula/
    │   │   ├── PilulaApplication.java      ← ponto de entrada
    │   │   ├── config/                     ← configurações: SecurityConfig (acesso), CorsConfig (libera o front),
    │   │   │                                 OpenApiConfig (título e descrição da documentação no Scalar)
    │   │   ├── model/                      ← entidades JPA (tabelas): Categoria, Subcategoria, Produto
    │   │   │                                 + Arte (embutida) e os enums TipoReceita e FormaArte
    │   │   ├── repository/                 ← acesso ao banco (Spring Data JPA): uma interface por entidade
    │   │   ├── service/                    ← regras de negócio: CatalogoService
    │   │   ├── dto/                        ← o que a API devolve (records), separado das entidades
    │   │   └── controller/                 ← endpoints REST: CatalogoController
    │   └── resources/
    │       ├── application.properties      ← conexão com o Supabase (lida do .env) e Flyway
    │       └── db/
    │           ├── migration/              ← V1 cria as tabelas, V2 coloca os produtos
    │           └── supabase/               ← V3 segurança (RLS), só no Supabase
    └── test/
        ├── java/pilula/com/pilula/         ← testes
        └── resources/application.properties ← testes usam H2 em memória
```

O caminho de uma requisição é sempre o mesmo:

```
navegador → controller → service → repository → banco (Supabase)
                 ↑            ↓
                 └──── dto ←──┘   (a entidade nunca sai direto pela API)
```

- **controller**: recebe a requisição HTTP e devolve a resposta. Não tem regra de negócio.
- **service**: onde ficam as regras (ex.: montar o catálogo, dar 404 se o produto não existe).
- **repository**: conversa com o banco. Os métodos são só declarados (ex.: `findAllByOrderByOrdemAsc()`) e o Spring Data cria a implementação pelo nome.
- **dto**: o formato da resposta. Separar do `model` deixa mudar o banco sem quebrar o front (ex.: `receita` sai como `"livre"`, igual ao JSON do front, e não como o enum `LIVRE`).

## Próximos passos (sugestões)

- [ ] `PedidoController` + entidades `Pedido`/`ItemPedido` para finalizar a compra de verdade.
- [x] Cadastro e login (`AuthController`, JWT, senha com BCrypt).
- [ ] Ligar as telas de entrar/cadastrar do front na API (`/api/auth/*`).
