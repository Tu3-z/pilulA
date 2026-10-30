package pilula.com.pilula.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pilula.com.pilula.service.JwtService;

/**
 * Lê o cabeçalho "Authorization: Bearer <token>" de cada requisição.
 * Se o token for válido, marca a requisição como autenticada com o e-mail do usuário.
 * Se não tiver token (ou for inválido), só segue em frente: as rotas públicas funcionam
 * normalmente e as protegidas respondem 401 (quem decide isso é o SecurityConfig).
 *
 * Não é @Component de propósito: o Spring Boot registraria o filtro duas vezes (uma fora
 * da segurança) e o login se perderia. Ele é criado só dentro do SecurityConfig.
 */
public class JwtFiltro extends OncePerRequestFilter {

  private static final String PREFIXO = "Bearer ";

  private final JwtService jwt;

  public JwtFiltro(JwtService jwt) {
    this.jwt = jwt;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    String cabecalho = req.getHeader(HttpHeaders.AUTHORIZATION);
    if (cabecalho != null && cabecalho.startsWith(PREFIXO)) {
      String token = cabecalho.substring(PREFIXO.length()).trim();
      if (jwt.valido(token)) {
        var auth = new UsernamePasswordAuthenticationToken(jwt.extrairEmail(token), null, List.of());
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    }
    chain.doFilter(req, res);
  }
}
