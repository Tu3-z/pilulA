package pilula.com.pilula.security;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import pilula.com.pilula.repository.UsuarioRepository;
import pilula.com.pilula.service.JwtService;

/**
 * ==============================================================================
 * FILTRO DE INTERCEPTAÇÃO: JwtFiltro (OncePerRequestFilter)
 * ==============================================================================
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 
 * 1. O que é o OncePerRequestFilter?
 *    - Um filtro do Spring Security executado exatamente uma vez por requisição HTTP.
 *    - Ele atua como uma barreira na entrada da aplicação: intercepta a requisição antes
 *      de atingir os controllers.
 * 
 * 2. Mecanismo de Funcionamento:
 *    a) Lê o cabeçalho 'Authorization' da requisição HTTP.
 *    b) Verifica se começa com o prefixo 'Bearer '.
 *    c) Valida a assinatura digital criptográfica HMAC-SHA e a expiração do token via JwtService.
 *    d) Se válido, extrai o e-mail do usuário (subject), busca seu perfil (ROLE_COMPRADOR,
 *       ROLE_VENDEDOR, ROLE_ADMIN) no banco e injeta um UsernamePasswordAuthenticationToken
 *       no SecurityContextHolder do Spring.
 *    e) Com isso, o Spring Security passa a reconhecer o usuário como autenticado
 *       durante todo o ciclo de vida daquela requisição.
 * 
 * 3. Tolerância a Rotas Públicas:
 *    - Se não houver token ou o formato for inválido, o filtro não rejeita a requisição
 *      imediatamente; ele simplesmente repassa a execução na cadeia (chain.doFilter).
 *    - Se a rota for pública (ex: /api/catalogo), o acesso ocorre normalmente. Se for protegida,
 *      o SecurityConfig bloqueia com HTTP 401 Unauthorized.
 * 
 * 4. Por que NÃO é anotado com @Component?
 *    - Se fosse @Component, o container servlet registraria o filtro duas vezes
 *      (uma na cadeia do Tomcat e outra no Spring Security), causando duplicação de processamento.
 *    - O registro é feito explicitamente no SecurityConfig via '.addFilterBefore(...)'.
 */
public class JwtFiltro extends OncePerRequestFilter {

  private static final String PREFIXO = "Bearer ";

  private final JwtService jwt;
  private final UsuarioRepository usuarios;

  public JwtFiltro(JwtService jwt, UsuarioRepository usuarios) {
    this.jwt = jwt;
    this.usuarios = usuarios;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {
    
    // LINHA: req.getHeader(HttpHeaders.AUTHORIZATION)
    // O QUE FAZ: Lê o cabeçalho 'Authorization' da requisição HTTP enviada pelo cliente.
    // EXEMPLO DE VALOR: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbkBhZG1pbi5jb20ifQ..."
    String cabecalho = req.getHeader(HttpHeaders.AUTHORIZATION);

    // LINHA: cabecalho != null && cabecalho.startsWith(PREFIXO)
    // O QUE FAZ: Verifica se o cabeçalho existe e se começa com a palavra "Bearer " (padrão RFC 6750 de autenticação).
    if (cabecalho != null && cabecalho.startsWith(PREFIXO)) {
      
      // LINHA: cabecalho.substring(PREFIXO.length()).trim()
      // O QUE FAZ: Corta os 7 primeiros caracteres ("Bearer ") e remove espaços extras, isolando apenas a string pura do token JWT.
      String token = cabecalho.substring(PREFIXO.length()).trim();

      // LINHA: jwt.valido(token)
      // O QUE FAZ: Verifica a criptografia HMAC-SHA256 e confere se a data de expiração do token ainda é válida.
      if (jwt.valido(token)) {
        
        // LINHA: jwt.extrairEmail(token)
        // O QUE FAZ: Abre o token descriptografando o payload (claims) e extrai o campo subject (o e-mail do usuário).
        String email = jwt.extrairEmail(token);

        // LINHA: usuarios.findByEmail(email).ifPresent(...)
        // O QUE FAZ: Faz um SELECT no banco de dados para buscar os dados desse usuário pelo e-mail.
        // O 'ifPresent' garante que o código só continue se o usuário realmente existir na base.
        usuarios.findByEmail(email).ifPresent(usuario -> {
          
          // LINHA: List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name()))
          // O QUE FAZ: Cria a autoridade de acesso do usuário (ex: "ROLE_ADMIN", "ROLE_VENDEDOR", "ROLE_COMPRADOR").
          // O Spring Security exige que as permissões (roles) tenham obrigatoriamente o prefixo "ROLE_".
          var autoridades = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getPerfil().name()));

          // LINHA: new UsernamePasswordAuthenticationToken(email, null, autoridades)
          // O QUE FAZ: Cria o objeto de credencial autenticada do Spring. Passamos:
          // 1º: identificador principal (email)
          // 2º: credenciais/senha (passamos null porque a senha já foi validada no login e não deve circular em memória)
          // 3º: lista de permissões que o usuário possui.
          var auth = new UsernamePasswordAuthenticationToken(email, null, autoridades);

          // LINHA: SecurityContextHolder.getContext().setAuthentication(auth)
          // O QUE FAZ: Grava a autenticação na thread atual da requisição.
          // A partir dessa linha, para o Spring Security este usuário está OFICIALMENTE LOGADO.
          // Qualquer controller que rodar em seguida poderá ler quem é o usuário logado via @AuthenticationPrincipal.
          SecurityContextHolder.getContext().setAuthentication(auth);
        });
      }
    }

    // LINHA: chain.doFilter(req, res)
    // O QUE FAZ: Passa a bola para o próximo filtro da fila (ou para o Controller de destino).
    // Se a requisição não tinha token ou era rota pública, a requisição segue normalmente.
    chain.doFilter(req, res);
  }
}
