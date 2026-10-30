package pilula.com.pilula.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Libera o front-end (Live Server / iniciar.bat em http://localhost:5500)
 * para chamar a API em http://localhost:8080.
 *
 * É um bean CorsConfigurationSource porque o Spring Security (SecurityConfig, .cors(...))
 * usa exatamente ele. Assim a "pergunta prévia" do navegador (OPTIONS) no cadastro e no
 * login é respondida antes de qualquer regra de login.
 */
@Configuration
public class CorsConfig {

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration cfg = new CorsConfiguration();
    cfg.setAllowedOrigins(List.of("http://localhost:5500", "http://127.0.0.1:5500"));
    cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    cfg.setAllowedHeaders(List.of("Content-Type", "Authorization"));
    cfg.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource fonte = new UrlBasedCorsConfigurationSource();
    fonte.registerCorsConfiguration("/api/**", cfg);
    return fonte;
  }
}
