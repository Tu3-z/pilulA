# pílula\* — back-end

API REST em **Spring Boot** (Java 21, Maven, JPA + banco H2 em memória). Visão geral do projeto no [README da raiz](../README.md).

## Como rodar

Pré-requisito: **Java 21** (JDK). O Maven não precisa estar instalado: o projeto traz o `mvnw` ("Maven Wrapper").

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw spring-boot:run
```

A API sobe em **http://localhost:8080**. Toda vez que ela sobe, o banco H2 é criado do zero e preenchido com o catálogo de `src/main/resources/data.sql`.

- Console do banco: **http://localhost:8080/h2-console** (JDBC URL `jdbc:h2:mem:pilula`, usuário `sa`, sem senha).
- Testes: `./mvnw test`.

## Endpoints

| Método e rota | O que devolve |
|---|---|
| `GET /api/catalogo` | categorias (com subcategorias) + produtos, **no mesmo formato** de `frontend/assets/data/catalogo.json` |
| `GET /api/categorias` | só as categorias, com as subcategorias dentro |
| `GET /api/produtos` | todos os produtos (`?categoria=dermo` filtra por categoria) |
| `GET /api/produtos/{id}` | um produto, ou **404** se não existir |

Para o front usar a API, troque `URL_CATALOGO` em `frontend/assets/js/services/catalogo.js` por `http://localhost:8080/api/catalogo` (a linha já está lá, comentada). O CORS para o front em `http://localhost:5500` já está liberado.

## Estrutura (arquitetura em camadas)

```
backend/
├── pom.xml                         ← dependências (Spring Web, JPA, Security, Validation, H2, PostgreSQL, Lombok)
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
    │       ├── application.properties      ← banco H2, console, carga do data.sql
    │       └── data.sql                    ← catálogo inicial (6 categorias, 24 subcategorias, 57 produtos)
    └── test/java/pilula/com/pilula/        ← testes
```

O caminho de uma requisição é sempre o mesmo:

```
navegador → controller → service → repository → banco (H2)
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
- [ ] Trocar o H2 pelo PostgreSQL (o driver já está no `pom.xml`): só mudar o `application.properties`.
