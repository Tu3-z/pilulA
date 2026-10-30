package pilula.com.pilula.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import pilula.com.pilula.security.JwtFiltro;
import pilula.com.pilula.service.JwtService;

/**
 * Regras de acesso da API.
 *
 * - Catálogo, cadastro, login e a documentação (Scalar) são públicos.
 * - Todo o resto exige "Authorization: Bearer <token>" (o token vem do cadastro ou do login).
 * - Sem sessão no servidor (stateless): quem guarda o token é o front.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filtros(HttpSecurity http, JwtService jwt) throws Exception {
    http
        // CSRF protege sessões com cookie; com token no cabeçalho ele não se aplica
        .csrf(csrf -> csrf.disable())
        // usa as regras do CorsConfig (libera o front na porta 5500)
        .cors(Customizer.withDefaults())
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(a -> a
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/catalogo", "/api/categorias", "/api/produtos/**").permitAll()
            .requestMatchers(HttpMethod.POST, "/api/auth/cadastrar", "/api/auth/entrar").permitAll()
            .requestMatchers("/scalar/**", "/v3/api-docs/**").permitAll()
            // página de erro do Spring: sem isso um 404 ou 400 viraria 401
            .requestMatchers("/error").permitAll()
            .anyRequest().authenticated())
        // sem token (ou token inválido) numa rota protegida → 401, não 403
        .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
        .addFilterBefore(new JwtFiltro(jwt), UsernamePasswordAuthenticationFilter.class);
    return http.build();
  }

  /** BCrypt: transforma a senha num hash (o banco nunca guarda a senha pura). */
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
