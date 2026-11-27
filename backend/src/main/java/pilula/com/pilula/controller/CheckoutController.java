package pilula.com.pilula.controller;

import java.util.Map;

// Importa classes do Spring para controle de status HTTP e montagem de respostas
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// Anotações do Spring MVC para criar endpoints REST e receber dados
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

// Anotações da OpenAPI / Swagger para documentar a API interativa
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
// Anotação para acionar a validação automática do Bean Validation nos DTOs
import jakarta.validation.Valid;

// DTOs (Data Transfer Objects): objetos leves usados para receber e devolver dados via JSON
import pilula.com.pilula.dto.CheckoutCriadoDTO;
import pilula.com.pilula.dto.CriarCheckoutDTO;
// Camada de serviço com as regras de negócio
import pilula.com.pilula.service.CheckoutService;

// @RestController: Avisa ao Spring que esta classe é um controlador REST.
// Cada método retornará dados puros (JSON) diretamente no corpo da resposta HTTP, sem renderizar páginas HTML.
@RestController
// @RequestMapping: Define o caminho (rota) base da URL para todos os endpoints deste arquivo.
@RequestMapping("/api/checkout")
// @Tag: Usado pelo gerador de documentação OpenAPI/Swagger para agrupar estes endpoints sob o título "Checkout".
@Tag(name = "Checkout", description = "Endpoints de integração com o Mercado Pago Checkout Pro e Webhooks")
public class CheckoutController {

  // Declaração do serviço de checkout como 'final' para garantir imutabilidade (não pode ser alterado depois de instanciado).
  private final CheckoutService service;

  // Injeção de dependência via construtor: o Spring instancia e passa o CheckoutService automaticamente para o controller.
  public CheckoutController(CheckoutService service) {
    this.service = service;
  }

  // @PostMapping: Mapeia requisições HTTP do tipo POST para a URL "/api/checkout/preferencia".
  @PostMapping("/preferencia")
  // @Operation: Descrição legível que aparece na interface interativa da documentação do Swagger.
  @Operation(
      summary = "Inicia o pagamento e persiste o pedido",
      description = "Recalcula os valores pelo catálogo do servidor, salva o pedido como PENDENTE no banco e devolve a URL do Mercado Pago.")
  // @Valid: Dispara a validação das anotações existentes dentro de CriarCheckoutDTO (ex: campos obrigatórios, formatos válidos).
  // @RequestBody: Pega o JSON enviado pelo front-end no corpo da requisição e o converte automaticamente para o objeto CriarCheckoutDTO.
  public ResponseEntity<CheckoutCriadoDTO> criarPreferencia(@Valid @RequestBody CriarCheckoutDTO pedido) {
    // service.criarPreferencia(pedido): Executa as regras de negócio (salva o pedido no banco e chama a API do Mercado Pago).
    // ResponseEntity.status(HttpStatus.CREATED): Monta a resposta com código de status HTTP 201 (Created), que é o padrão REST para criação de recursos.
    // .body(...): Envia o CheckoutCriadoDTO (com id do pedido e link de pagamento) no corpo da resposta serializado em JSON.
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(service.criarPreferencia(pedido));
  }

  // @PostMapping: Mapeia requisições HTTP POST para "/api/checkout/webhook".
  // Este endpoint é chamado pelos servidores do próprio Mercado Pago quando um pagamento é aprovado, cancelado ou recusado.
  @PostMapping("/webhook")
  @Operation(
      summary = "Webhook do Mercado Pago (Instant Payment Notification)",
      description = "Recebe notificações automáticas do Mercado Pago quando o status de um pagamento é alterado.")
  public ResponseEntity<Void> webhook(
      // @RequestBody(required = false): Captura o JSON do payload do webhook caso venha no corpo da requisição.
      @RequestBody(required = false) Map<String, Object> payload,
      // @RequestParam: Captura parâmetros passados na URL (?topic=payment ou ?id=123). O 'required = false' evita que dê erro se não vier.
      @RequestParam(name = "topic", required = false) String topic,
      @RequestParam(name = "id", required = false) String id) {
    
    // Repassa os dados recebidos para o service atualizar o status do pedido no banco de dados.
    service.processarWebhook(payload, topic, id);
    
    // ResponseEntity.ok().build(): Devolve código HTTP 200 (OK) vazio para avisar ao Mercado Pago que a notificação foi recebida com sucesso.
    return ResponseEntity.ok().build();
  }
}
