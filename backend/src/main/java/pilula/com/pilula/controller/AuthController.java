package pilula.com.pilula.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.CadastroDTO;
import pilula.com.pilula.dto.LoginDTO;
import pilula.com.pilula.dto.UsuarioDTO;
import pilula.com.pilula.service.AuthService;

/**
 * Contas de usuário.
 *
 *   POST /api/auth/cadastrar → cria a conta e devolve o usuário + token
 *   POST /api/auth/entrar    → confere e-mail/senha e devolve o usuário + token
 *   GET  /api/auth/eu        → dados de quem está logado (precisa do token)
 */
// ANOTAÇÃO: @RestController
// SE O PROFESSOR PERGUNTAR: Informa ao Spring que esta classe é um controlador de API REST.
// Diferente do @Controller tradicional (que renderiza telas HTML no servidor), o @RestController
// serializa automaticamente todos os objetos de retorno diretamente em formato JSON para o cliente.
@RestController

// ANOTAÇÃO: @RequestMapping("/api/auth")
// O QUE FAZ: Define o prefixo comum da URL para todas as rotas desta classe (ex: /api/auth/cadastrar, /api/auth/entrar).
@RequestMapping("/api/auth")

// ANOTAÇÃO: @Tag (do OpenAPI / Swagger)
// O QUE FAZ: Agrupa e rotula esses endpoints na interface gráfica interativa de documentação da API.
@Tag(name = "Autenticação", description = "Cadastro, login e conta do usuário")
public class AuthController {

  // Atributo do serviço de regras de autenticação injetado via construtor (Inversão de Controle / IoC)
  private final AuthService service;

  public AuthController(AuthService service) {
    this.service = service;
  }

  // ANOTAÇÃO: @Operation / @ApiResponse
  // O QUE FAZ: Documenta o resumo, descrição e possíveis códigos de status HTTP para o Swagger.
  @Operation(summary = "Criar conta", description = "Cria o usuário e já devolve o token JWT.")
  @ApiResponse(responseCode = "201", description = "Conta criada com sucesso")
  @ApiResponse(responseCode = "400", description = "Dados inválidos (veja o campo \"erros\")")
  @ApiResponse(responseCode = "409", description = "E-mail já cadastrado")
  
  // ANOTAÇÃO: @PostMapping("/cadastrar")
  // O QUE FAZ: Mapeia requisições HTTP POST enviadas para o endereço /api/auth/cadastrar.
  @PostMapping("/cadastrar")
  
  // ANOTAÇÃO: @ResponseStatus(HttpStatus.CREATED)
  // SE O PROFESSOR PERGUNTAR: Retorna o código padrão HTTP 201 (Created), que é a convenção REST para recursos recém-criados.
  @ResponseStatus(HttpStatus.CREATED)
  public UsuarioDTO cadastrar(
      // ANOTAÇÃO: @Valid
      // SE O PROFESSOR PERGUNTAR: Aciona o Jakarta Bean Validation antes de executar o método.
      // Se campos obrigatórios estiverem vazios ou o e-mail for malformatado, o Spring bloqueia e retorna HTTP 400.
      // ANOTAÇÃO: @RequestBody
      // O QUE FAZ: O Spring deserializa o corpo JSON da requisição HTTP transformando-o na classe CadastroDTO.
      @Valid @RequestBody CadastroDTO dados) {
    // Delega a criação da conta para o service e devolve o DTO com o token JWT gerado
    return service.cadastrar(dados);
  }

  @Operation(summary = "Entrar", description = "Confere e-mail e senha e devolve o token JWT.")
  @ApiResponse(responseCode = "200", description = "Login realizado com sucesso")
  @ApiResponse(responseCode = "401", description = "E-mail ou senha incorretos")
  
  // ANOTAÇÃO: @PostMapping("/entrar")
  // O QUE FAZ: Mapeia requisições HTTP POST para autenticação de credenciais.
  @PostMapping("/entrar")
  public UsuarioDTO entrar(@Valid @RequestBody LoginDTO dados) {
    // Valida credenciais no banco via BCrypt e retorna os dados do usuário com seu JWT
    return service.entrar(dados);
  }

  @Operation(summary = "Minha conta",
      description = "Devolve os dados do usuário dono do token.")
  @SecurityRequirement(name = "bearer")
  @ApiResponse(responseCode = "200", description = "Usuário autenticado")
  @ApiResponse(responseCode = "401", description = "Sem token, token inválido ou expirado")
  
  // ANOTAÇÃO: @GetMapping("/eu")
  // O QUE FAZ: Rota protegida via HTTP GET para obter o perfil do comprador logado no momento.
  @GetMapping("/eu")
  public UsuarioDTO eu(
      // ANOTAÇÃO: @AuthenticationPrincipal
      // SE O PROFESSOR PERGUNTAR: Injeta automaticamente o 'subject' (e-mail) extraído do token JWT
      // que o JwtFiltro validou e colocou no SecurityContextHolder.
      @AuthenticationPrincipal String email) {
    return service.eu(email);
  }
}
