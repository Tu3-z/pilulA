package pilula.com.pilula.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
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

                Os dados ficam num PostgreSQL no Supabase. Por enquanto a API é só de leitura:
                catálogo, categorias e produtos. O front-end usa o `GET /api/catalogo`.
                """))
        .servers(List.of(new Server().url("http://localhost:8080").description("Local")));
  }
}
