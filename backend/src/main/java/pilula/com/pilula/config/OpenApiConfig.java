package pilula.com.pilula.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;

/**
 * Informações gerais da documentação da API.
 * O springdoc lê os controllers e gera a especificação OpenAPI em /v3/api-docs;
 * o Scalar mostra essa especificação numa página navegável em /scalar.
 */
@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI pilulaOpenApi() {
    return new OpenAPI()
        .info(new Info()
            .title("pílula* API")
            .version("1.0")
            .description("""
                API da farmácia online **pílula\\*** (Projeto Integrador).

                Os dados ficam num PostgreSQL no Supabase. O catálogo é público e o front-end
                usa o `GET /api/catalogo`.

                **Login:** chame `POST /api/auth/entrar` (ou `/cadastrar`), copie o `token`
                da resposta e cole em *Authentication → Bearer* para testar as rotas protegidas.
                """))
        .components(new Components().addSecuritySchemes("bearer", new SecurityScheme()
            .type(SecurityScheme.Type.HTTP)
            .scheme("bearer")
            .bearerFormat("JWT")))
        // "/" = o mesmo endereço onde a documentação foi aberta: localhost:8080 no seu
        // computador, https://pilula-api.up.railway.app em produção
        .servers(List.of(new Server().url("/").description("Este servidor")));
  }
}
