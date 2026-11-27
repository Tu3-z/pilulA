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
import pilula.com.pilula.repository.UsuarioRepository;
import pilula.com.pilula.service.JwtService;

/**
 * ==============================================================================
 * CONFIGURAÇÃO DE SEGURANÇA: SecurityConfig (Spring Security 6 + JWT)
 * ==============================================================================
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 
 * 1. Arquitetura Stateless (Sem Sessão no Servidor):
 *    - Definida por 'SessionCreationPolicy.STATELESS'. O backend não armazena sessões
 *      em memória (HttpSession), permitindo escalabilidade horizontal.
 *    - A autenticação é baseada em tokens JWT (JSON Web Token), onde o cliente envia
 *      o token no cabeçalho 'Authorization: Bearer <token>' a cada requisição protegida.
 * 
 * 2. Proteção CSRF desabilitada:
 *    - Como a API não usa cookies de sessão do navegador e sim tokens JWT em headers HTTP,
 *      a vulnerabilidade Cross-Site Request Forgery não se aplica aqui.
 * 
 * 3. Controle de Acesso Baseado em Perfis (RBAC - Role-Based Access Control):
 *    - Rotas públicas (permitAll): Consulta ao catálogo, cadastro, login, checkout e docs.
 *    - Rotas de Vendedor (/api/vendedor/**): Exigem perfil ROLE_VENDEDOR ou ROLE_ADMIN.
 *    - Rotas de Administração (/api/admin/**): Exigem estritamente ROLE_ADMIN (ex: revisão
 *      de receitas médicas, relatórios de vendas e gerenciamento de permissões).
 * 
 * 4. Tratamento de Exceções de Autenticação:
 *    - Configurado para retornar HTTP 401 (UNAUTHORIZED) em vez de 403 (FORBIDDEN)
 *      quando o usuário tenta acessar recurso protegido sem fornecer token válido.
 * 
 * 5. Criptografia Segura de Senhas (BCrypt):
 *    - Senhas nunca são gravadas em texto puro no banco de dados. O algoritmo BCrypt
 *      adiciona salt aleatório e derivação de chave lenta contra ataques de força bruta.
 */
// @Configuration: Avisa ao Spring que esta classe contém definições de Beans e regras de infraestrutura/configuração.
@Configuration
// @EnableWebSecurity: Habilita os recursos e a cadeia de filtros de segurança do Spring Security na aplicação.
@EnableWebSecurity
public class SecurityConfig {

  // @Bean: Indica que o retorno deste método deve ser gerenciado pelo container do Spring como um componente central.
  // SecurityFilterChain: É a cadeia de filtros que intercepta toda e qualquer requisição HTTP antes de chegar nos Controllers.
  @Bean
  public SecurityFilterChain filtros(HttpSecurity http, JwtService jwt, UsuarioRepository usuarios) throws Exception {
    http
        // csrf().disable(): Desativa a proteção contra CSRF (Cross-Site Request Forgery).
        // POR QUE O PROFESSOR PODE PERGUNTAR: CSRF é necessário para sessões que usam cookies do navegador.
        // Como nossa API é 100% REST e usa Token JWT no cabeçalho (Authorization: Bearer), essa vulnerabilidade não existe.
        .csrf(csrf -> csrf.disable())

        // cors(): Habilita o compartilhamento de recursos entre origens diferentes conforme definido no CorsConfig.
        // Permite que o frontend rodando na porta 5500 converse com a API do backend na porta 8080.
        .cors(Customizer.withDefaults())

        // sessionManagement(): Define a gestão de sessão da aplicação.
        // SessionCreationPolicy.STATELESS: Informa ao Spring para NUNCA criar ou salvar sessões HTTP em memória (HttpSession).
        // O servidor não guarda estado de login; cada requisição deve se auto-autenticar enviando seu token JWT.
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

        // authorizeHttpRequests(): Inicia o bloco de regras de autorização de rotas (quem pode acessar o quê).
        .authorizeHttpRequests(a -> a
            // HttpMethod.OPTIONS: Libera requisições de 'pre-flight' enviadas automaticamente pelo navegador em chamadas CORS.
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

            // requestMatchers(...).permitAll(): Libera acesso PÚBLICO (sem precisar de login/token) para:
            // - Leitura do catálogo, listagem de categorias, detalhes do produto e consulta de status de pedidos.
            .requestMatchers(HttpMethod.GET, "/api/catalogo", "/api/categorias", "/api/produtos/**", "/api/pedidos/**").permitAll()

            // Libera requisições POST públicas para:
            // - Criar nova conta (/cadastrar), fazer login (/entrar), iniciar pagamento (/checkout/**) e upload de receita.
            .requestMatchers(HttpMethod.POST, "/api/auth/cadastrar", "/api/auth/entrar", "/api/checkout/**", "/api/receita/**").permitAll()

            // hasRole("ADMIN"): Exige que o usuário autenticado tenha permissão estrita de Administrador (ROLE_ADMIN).
            // Ninguém mais pode acessar endpoints administrativos como /api/admin/receitas (revisão de receitas médicas).
            .requestMatchers("/api/admin/**").hasRole("ADMIN")

            // hasAnyRole("VENDEDOR", "ADMIN"): Permite acesso a usuários que sejam Vendedores OU Administradores.
            .requestMatchers("/api/vendedor/**").hasAnyRole("VENDEDOR", "ADMIN")

            // Libera as rotas da documentação interativa da API (Swagger / OpenAPI / Scalar) para testes públicos.
            .requestMatchers("/scalar/**", "/v3/api-docs/**").permitAll()

            // Libera a rota interna de erros do Spring (/error) para que mensagens 400 ou 404 não sejam mascaradas como 401.
            .requestMatchers("/error").permitAll()

            // anyRequest().authenticated(): Qualquer outra URL não listada acima exigirá que o usuário esteja autenticado com token.
            .anyRequest().authenticated())

        // exceptionHandling(): Personaliza o tratamento de erros de segurança.
        // authenticationEntryPoint(...): Se o cliente tentar acessar uma rota protegida sem token válido, devolve HTTP 401 (Unauthorized).
        .exceptionHandling(e -> e.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))

        // addFilterBefore(): Insere o nosso JwtFiltro ANTES do filtro padrão de login do Spring (UsernamePasswordAuthenticationFilter).
        // Isso garante que o token JWT seja lido e validado antes de qualquer checagem de autorização de rota.
        .addFilterBefore(new JwtFiltro(jwt, usuarios), UsernamePasswordAuthenticationFilter.class);

    // Constrói e devolve a configuração de segurança pronta para o Spring executar.
    return http.build();
  }

  // @Bean: Registra o componente de codificação de senhas no contexto do Spring.
  // BCryptPasswordEncoder: Algoritmo de hash criptográfico unidirecional seguro.
  // A senha pura do usuário NUNCA é salva no banco de dados; apenas o hash com salt gerado pelo BCrypt.
  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }
}
