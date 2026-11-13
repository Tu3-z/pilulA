package pilula.com.pilula.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.PerfilDTO;
import pilula.com.pilula.dto.UsuarioAdminDTO;
import pilula.com.pilula.service.AdminService;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administração", description = "Gerenciamento de perfis e vendedores")
@SecurityRequirement(name = "bearer")
public class AdminController {

  private final AdminService service;

  public AdminController(AdminService service) {
    this.service = service;
  }

  @GetMapping("/usuarios")
  @Operation(summary = "Lista contas", description = "Somente administradores podem listar e promover contas.")
  public List<UsuarioAdminDTO> listarUsuarios() {
    return service.listarUsuarios();
  }

  @PatchMapping("/usuarios/{id}/perfil")
  @Operation(
      summary = "Altera perfil",
      description = "Promove compradores para vendedores ou administra perfis. Não permite remover o último admin.")
  public UsuarioAdminDTO alterarPerfil(
      @PathVariable Long id,
      @Valid @RequestBody PerfilDTO dados,
      @AuthenticationPrincipal String emailAdministrador) {
    return service.alterarPerfil(id, dados.perfil(), emailAdministrador);
  }
}
