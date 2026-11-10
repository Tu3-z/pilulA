package pilula.com.pilula.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Libera o front-end para chamar a API.
 *
 * Em desenvolvimento (localhost), as origens padrão são http://localhost:5500 e
 * http://127.0.0.1:5500. Em produção, defina a variável de ambiente CORS_ORIGINS
 * com a URL do Vercel (ou várias, separadas por vírgula).
 *
 * Exemplo Railway / Render:
 *   CORS_ORIGINS=https://seu-projeto.vercel.app
 *
 * Exemplo com múltiplas origens:
 *   CORS_ORIGINS=https://seu-projeto.vercel.app,https://www.seudominio.com.br
 */
@Configuration
public class CorsConfig {

  @Value("${CORS_ORIGINS:http://localhost:5500,http://127.0.0.1:5500}")
  private String origensPermitidas;

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();

    List<String> origens = Arrays.asList(origensPermitidas.split(","));
    cfg.setAllowedOrigins(origens);

    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("Content-Type", "Authorization"));
    cfg.setAllowCredentials(false);
    cfg.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
    fonte.registerCorsConfiguration("/api/**", cfg);
    return fonte;
  }
}
