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
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticação", description = "Cadastro, login e conta do usuário")
public class AuthController {

  private final AuthService service;

  public AuthController(AuthService service) {
    this.service = service;
  }

  @Operation(summary = "Criar conta", description = "Cria o usuário e já devolve o token JWT.")
  @ApiResponse(responseCode = "201", description = "Conta criada")
  @ApiResponse(responseCode = "400", description = "Dados inválidos (veja o campo \"erros\")")
  @ApiResponse(responseCode = "409", description = "E-mail já cadastrado")
  @PostMapping("/cadastrar")
  @ResponseStatus(HttpStatus.CREATED)
  public UsuarioDTO cadastrar(@Valid @RequestBody CadastroDTO dados) {
    return service.cadastrar(dados);
  }

  @Operation(summary = "Entrar", description = "Confere e-mail e senha e devolve o token JWT.")
  @ApiResponse(responseCode = "200", description = "Login feito")
  @ApiResponse(responseCode = "401", description = "E-mail ou senha incorretos")
  @PostMapping("/entrar")
  public UsuarioDTO entrar(@Valid @RequestBody LoginDTO dados) {
    return service.entrar(dados);
  }

  @Operation(summary = "Minha conta",
      description = "Devolve os dados do usuário dono do token. No Scalar, cole o token em \"Authentication\".")
  @SecurityRequirement(name = "bearer")
  @ApiResponse(responseCode = "200", description = "Usuário logado")
  @ApiResponse(responseCode = "401", description = "Sem token, token inválido ou expirado")
  @GetMapping("/eu")
  public UsuarioDTO eu(@AuthenticationPrincipal String email) {
    return service.eu(email);
  }
}
