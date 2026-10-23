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
   ```
   O `.env` está no `.gitignore`: **a senha nunca vai pro GitHub**. Passe pro grupo por mensagem privada, não no repositório.
4. **Subir a API.** Pré-requisito: **Java 21** (`java -version`). O Maven vem junto (`mvnw`).
   ```bash
   cd backend
   ./mvnw spring-boot:run        # Windows: mvnw spring-boot:run
   ```
   Na primeira vez, o Flyway cria as tabelas e coloca os 57 produtos. Dá pra ver tudo no Supabase em **Table Editor**.
5. **Conferir.** Abra http://localhost:8080/api/catalogo. Depois abra o site (Live Server); no console do navegador (F12) deve aparecer `catálogo carregado da API`.

Se a API estiver desligada, o site continua funcionando com o JSON local (`frontend/assets/data/catalogo.json`).

## Banco de dados (Flyway)

As tabelas **não** são criadas pelo Hibernate. Quem cuida delas são as *migrations*, arquivos SQL numerados que o Flyway roda uma vez cada, em ordem, quando a API sobe:

| Arquivo | O que faz |
|---|---|
| `db/migration/V1__criar_tabelas_catalogo.sql` | cria `categoria`, `subcategoria` e `produto` (com chaves, `CHECK` de preço/receita e índices) |
| `db/migration/V2__popular_catalogo.sql` | coloca as 6 categorias, 24 subcategorias e 57 produtos |
| `db/supabase/V3__habilitar_rls.sql` | liga o RLS no Supabase, para ninguém mexer nas tabelas pela API pública dele (só o nosso back-end acessa) |

O Flyway anota o que já rodou na tabela `flyway_schema_history`. Regras:

- **Para mudar o banco, crie um arquivo novo** (`V4__adiciona_estoque.sql`…). Nunca edite um V1/V2/V3 que já rodou: o Flyway confere o conteúdo e a API não sobe.
- Mexeu na estrutura de uma tabela? Ajuste também a entidade em `model/`.
- Os testes (`./mvnw test`) usam um banco **H2 em memória** com as mesmas migrations V1 e V2, sem internet e sem tocar no Supabase.

## Endpoints

| Método e rota | O que devolve |
|---|---|
| `GET /api/catalogo` | categorias (com subcategorias) + produtos, **no mesmo formato** de `frontend/assets/data/catalogo.json` |
| `GET /api/categorias` | só as categorias, com as subcategorias dentro |
| `GET /api/produtos` | todos os produtos (`?categoria=dermo` filtra por categoria) |
| `GET /api/produtos/{id}` | um produto, ou **404** se não existir |

O front já tenta a API primeiro (`frontend/assets/js/services/catalogo.js`) e só usa o JSON local se ela não responder. O CORS para o front em `http://localhost:5500` e `http://127.0.0.1:5500` já está liberado.

## Estrutura (arquitetura em camadas)

```
backend/
├── pom.xml                         ← dependências (Spring Web, JPA, Flyway, Security, Validation, PostgreSQL, Lombok; H2 só nos testes)
├── .env.example                    ← modelo do .env (dados de acesso ao Supabase; o .env de verdade não vai pro Git)
├── mvnw, mvnw.cmd, .mvn/           ← Maven Wrapper
└── src/
    ├── main/
    │   ├── java/pilula/com/pilula/
    │   │   ├── PilulaApplication.java      ← ponto de entrada
    │   │   ├── config/                     ← configurações: SecurityConfig (acesso), CorsConfig (libera o front)
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
- [ ] Cadastro e login (`UsuarioController`, senha com BCrypt do Spring Security).
