package pilula.com.pilula.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import pilula.com.pilula.model.Pedido;

/**
 * ==============================================================================
 * DTO: PedidoDTO (Data Transfer Object)
 * ==============================================================================
 * Objeto transferido pela rede entre a API Spring Boot e o frontend JavaScript.
 * 
 * Por que separar Entity (Pedido) de DTO (PedidoDTO)?
 * 1. Segurança: Evita expor a estrutura interna das tabelas do banco de dados (ex: IDs sequenciais).
 * 2. Desacoplamento: O banco pode mudar sem quebrar o contrato da API com o frontend.
 * 3. Otimização: Enviamos para o cliente apenas os campos que a interface realmente precisa.
 */
public record PedidoDTO(
    String referencia,
    String status,
    String nomeComprador,
    String emailComprador,
    String celularComprador,
    String modoEntrega,
    String cep,
    String rua,
    String numero,
    String complemento,
    String bairro,
    String cidade,
    String uf,
    String cupom,
    BigDecimal subtotal,
    BigDecimal desconto,
    BigDecimal frete,
    BigDecimal total,
    String checkoutUrl,
    OffsetDateTime criadoEm,
    List<ItemPedidoDTO> itens) {

  public static PedidoDTO de(Pedido pedido) {
    List<ItemPedidoDTO> itensDTO = pedido.getItens().stream()
        .map(ItemPedidoDTO::de)
        .toList();

    return new PedidoDTO(
        pedido.getReferencia(),
        pedido.getStatus().name(),
        pedido.getNomeComprador(),
        pedido.getEmailComprador(),
        pedido.getCelularComprador(),
        pedido.getModoEntrega(),
        pedido.getCep(),
        pedido.getRua(),
        pedido.getNumero(),
        pedido.getComplemento(),
        pedido.getBairro(),
        pedido.getCidade(),
        pedido.getUf(),
        pedido.getCupom(),
        pedido.getSubtotal(),
        pedido.getDesconto(),
        pedido.getFrete(),
        pedido.getTotal(),
        pedido.getCheckoutUrl(),
        pedido.getCriadoEm(),
        itensDTO);
  }
}
