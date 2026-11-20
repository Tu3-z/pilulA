package pilula.com.pilula.model;

/**
 * ==============================================================================
 * ENUM: StatusPedido
 * ==============================================================================
 * Representa os possíveis estados de um pedido durante seu ciclo de vida.
 * 
 * O ciclo básico funciona assim:
 * 1. O cliente clica em "Ir para pagamento" -> O pedido nasce como PENDENTE.
 * 2. O cliente paga via Pix ou Cartão no Mercado Pago ->
 *    O Mercado Pago notifica o Webhook da nossa API -> O status muda para PAGO.
 * 3. Se o pagamento for rejeitado ou expirar -> O status muda para CANCELADO.
 * 
 * Utilizar um Enum em vez de Strings soltas garante:
 * - Segurança de tipos em tempo de compilação (evita erros de digitação como "pago" vs "PAGO").
 * - Facilidade de refatoração no Java.
 * - Restrição validada no banco de dados através da constraint CHECK.
 */
public enum StatusPedido {
  /**
   * Pedido criado no sistema, aguardando o cliente concluir o pagamento no Mercado Pago.
   */
  PENDENTE,

  /**
   * Pagamento aprovado pelo Mercado Pago. O pedido já pode ser preparado para entrega/retirada.
   */
  PAGO,

  /**
   * Pagamento recusado pela operadora, boleto/Pix expirado ou compra cancelada.
   */
  CANCELADO,

  /**
   * Ocorreu uma inconsistência no processamento do pagamento que exige análise manual.
   */
  FALHA
}
