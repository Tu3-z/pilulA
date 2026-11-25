package pilula.com.pilula.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.AvaliarReceitaDTO;
import pilula.com.pilula.dto.ReceitaPedidoDTO;
import pilula.com.pilula.service.ReceitaService;

/**
 * ==============================================================================
 * CONTROLLER: ReceitaController
 * ==============================================================================
 * Endpoints para o fluxo de receita médica:
 *
 *  POST  /api/receita/{referencia}         — comprador envia URL da foto (autenticado)
 *  GET   /api/admin/receitas               — admin lista todos com receita
 *  GET   /api/admin/receitas/pendentes     — admin lista pendentes
 *  PATCH /api/admin/receitas/{id}          — admin aprova ou rejeita
 */
@RestController
@Tag(name = "Receita", description = "Envio e revisão de receita médica")
public class ReceitaController {

  private final ReceitaService service;

  public ReceitaController(ReceitaService service) {
    this.service = service;
  }

  // ---- Comprador: envia URL/base64 da foto ----

  @PostMapping("/api/receita/{referencia}")
  @Operation(summary = "Envia foto da receita", description = "Comprador envia a URL ou base64 da foto da receita para um pedido existente.")
  @SecurityRequirement(name = "bearer")
  public ResponseEntity<ReceitaPedidoDTO> enviarReceita(
      @PathVariable String referencia,
      @RequestBody Map<String, String> body,
      @AuthenticationPrincipal String emailComprador) {

    String url = body.get("receitaUrl");
    if (url == null || url.isBlank()) {
      return ResponseEntity.badRequest().build();
    }
    return ResponseEntity.ok(service.enviarReceita(referencia, url));
  }

  // ---- Admin: listagens ----

  @GetMapping("/api/admin/receitas")
  @Operation(summary = "Lista pedidos com receita", description = "Somente ADMIN. Retorna todos os pedidos que tiveram receita enviada.")
  @SecurityRequirement(name = "bearer")
  public List<ReceitaPedidoDTO> listarComReceita() {
    return service.listarComReceita();
  }

  @GetMapping("/api/admin/receitas/pendentes")
  @Operation(summary = "Lista receitas pendentes", description = "Somente ADMIN. Retorna pedidos com receita aguardando revisão.")
  @SecurityRequirement(name = "bearer")
  public List<ReceitaPedidoDTO> listarPendentes() {
    return service.listarPendentes();
  }

  // ---- Admin: aprovar / rejeitar ----

  @PatchMapping("/api/admin/receitas/{id}")
  @Operation(summary = "Avalia receita", description = "Somente ADMIN. Aprova ou rejeita a receita médica de um pedido.")
  @SecurityRequirement(name = "bearer")
  public ReceitaPedidoDTO avaliarReceita(
      @PathVariable Long id,
      @Valid @RequestBody AvaliarReceitaDTO dados) {
    return service.avaliarReceita(id, dados);
  }
}
