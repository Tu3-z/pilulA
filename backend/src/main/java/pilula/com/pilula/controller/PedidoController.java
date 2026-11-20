package pilula.com.pilula.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import pilula.com.pilula.dto.PedidoDTO;
import pilula.com.pilula.service.CheckoutService;

/**
 * ==============================================================================
 * CONTROLLER: PedidoController
 * ==============================================================================
 * Disponibiliza endpoints para consulta de pedidos.
 * 
 * Conceito para estudo:
 * - @RestController: Combina @Controller e @ResponseBody. Cada método retorna dados
 *   diretos (JSON) serializados automaticamente pelo Jackson, sem renderizar páginas HTML.
 * - @PathVariable: Captura variáveis dinâmicas na URL (ex: /api/pedidos/{referencia}).
 */
@RestController
@RequestMapping("/api/pedidos")
@Tag(name = "Pedidos", description = "Consulta e acompanhamento de pedidos realizados")
public class PedidoController {

  private final CheckoutService service;

  public PedidoController(CheckoutService service) {
    this.service = service;
  }

  @GetMapping("/{referencia}")
  @Operation(
      summary = "Busca um pedido por referência",
      description = "Retorna os detalhes completos, itens, valores e status atual de um pedido pelo seu UUID.")
  public ResponseEntity<PedidoDTO> buscarPorReferencia(
      @PathVariable String referencia,
      @RequestParam(name = "status", required = false) String status) {
    return ResponseEntity.ok(service.buscarPorReferencia(referencia, status));
  }
}
