# pílula\*

E-commerce de farmácia do **Projeto Integrador**: front-end em **HTML, CSS e JavaScript puros** e back-end em **Spring Boot**.

A ideia de farmácia online é comum, então o diferencial está na direção de arte: um visual limpo de farmácia moderna com toques de anos 2000 / Windows 98, um carrossel com uma caixa de remédio em 3D e parallax, e cuidado com usabilidade e acessibilidade.

## Estrutura do repositório

```
pilulA/
├── frontend/          ← site (HTML, CSS, JS). Detalhes em frontend/README.md
│   ├── *.html             uma página por arquivo
│   ├── iniciar.bat        sobe o site em http://localhost:5500
│   └── assets/
│       ├── css/           base/ · components/ · pages/ · main.css
│       ├── js/            services/ · utils/ · components/ · pages/
│       ├── data/          catalogo.json (dados de teste)
│       └── img/           favicon e fotos dos produtos
├── backend/           ← API REST em Spring Boot. Detalhes em backend/README.md
│   └── src/main/java/pilula/com/pilula/
│       ├── config/        segurança e CORS
│       ├── model/         entidades (tabelas)
│       ├── repository/    acesso ao banco
│       ├── service/       regras de negócio
│       ├── dto/           formato das respostas
│       └── controller/    endpoints /api/...
├── .vscode/           ← Live Server já configurado para servir a pasta frontend/
└── README.md          ← este arquivo
```

## Como rodar

| O quê | Como | Endereço |
|---|---|---|
| **Front-end** | dois cliques em `frontend/iniciar.bat`, ou **Go Live** no VS Code (com a raiz do repositório aberta) | http://localhost:5500 |
| **Back-end** | `cd backend` e `mvnw spring-boot:run` (precisa do Java 21) | http://localhost:8080/api/catalogo |

O front funciona sozinho, lendo `frontend/assets/data/catalogo.json`. Para ele usar a API, troque `URL_CATALOGO` em `frontend/assets/js/services/catalogo.js` (a linha já está pronta, comentada).

## Histórico

- `e216fed`: primeira versão do front em HTML/CSS/JS (visual 100% anos 2000).
- Branch **`angular`**: a mesma loja feita em Angular 22, guardada para consulta.
- `9573d07`: de volta ao JavaScript puro, com o visual novo e o carrossel.
- Atual: repositório separado em `frontend/` e `backend/`, back-end em camadas com a API do catálogo.

---

Projeto acadêmico. Produtos reais usados como dados de teste; preços ilustrativos. As marcas pertencem aos seus donos.
