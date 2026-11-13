package pilula.com.pilula.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.CheckoutCriadoDTO;
import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.service.CheckoutService;

@RestController
@RequestMapping("/api/checkout")
@Tag(name = "Checkout", description = "Cria uma preferência do Mercado Pago para Checkout Pro")
public class CheckoutController {

  private final CheckoutService service;

  public CheckoutController(CheckoutService service) {
    this.service = service;
  }

  @PostMapping("/preferencia")
  @Operation(
      summary = "Inicia o pagamento",
      description = "Recalcula os valores pelo catálogo do servidor e devolve a URL segura do Checkout Pro.")
  public ResponseEntity<CheckoutCriadoDTO> criarPreferencia(@Valid @RequestBody CriarCheckoutDTO pedido) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.criarPreferencia(pedido));
  }
}
