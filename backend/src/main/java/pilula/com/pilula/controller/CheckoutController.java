package pilula.com.pilula.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.CheckoutCriadoDTO;
import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.service.CheckoutService;

/**
 * ==============================================================================
 * CONTROLLER: CheckoutController
 * ==============================================================================
 * Endpoints REST para inicialização de pagamentos e recebimento de webhooks.
 * 
 * 1. POST /api/checkout/preferencia:
 *    Recebe os itens do carrinho e dados do comprador, cria o pedido no banco
 *    com status 'PENDENTE', gera a preferência no Mercado Pago e retorna a URL
 *    para o frontend redirecionar o cliente.
 * 
 * 2. POST /api/checkout/webhook:
 *    Chamado diretamente pelos servidores do Mercado Pago quando o pagamento
 *    é processado (Pix aprovado, cartão aprovado ou recusado). Atualiza o pedido
 *    para 'PAGO' ou 'CANCELADO'.
 */
@RestController
@RequestMapping("/api/checkout")
@Tag(name = "Checkout", description = "Endpoints de integração com o Mercado Pago Checkout Pro e Webhooks")
public class CheckoutController {

  private final CheckoutService service;

  public CheckoutController(CheckoutService service) {
    this.service = service;
  }

  @PostMapping("/preferencia")
  @Operation(
      summary = "Inicia o pagamento e persiste o pedido",
      description = "Recalcula os valores pelo catálogo do servidor, salva o pedido como PENDENTE no banco e devolve a URL do Mercado Pago.")
  public ResponseEntity<CheckoutCriadoDTO> criarPreferencia(@Valid @RequestBody CriarCheckoutDTO pedido) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.criarPreferencia(pedido));
  }

  @PostMapping("/webhook")
  @Operation(
      summary = "Webhook do Mercado Pago (Instant Payment Notification)",
      description = "Recebe notificações automáticas do Mercado Pago quando o status de um pagamento é alterado.")
  public ResponseEntity<Void> webhook(
      @RequestBody(required = false) Map<String, Object> payload,
      @RequestParam(name = "topic", required = false) String topic,
      @RequestParam(name = "id", required = false) String id) {
    service.processarWebhook(payload, topic, id);
    return ResponseEntity.ok().build();
  }
}
