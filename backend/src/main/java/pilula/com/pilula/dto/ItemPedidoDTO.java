package pilula.com.pilula.dto;

import java.math.BigDecimal;

import pilula.com.pilula.model.ItemPedido;

/**
 * ==============================================================================
 * DTO: ItemPedidoDTO (Java Record)
 * ==============================================================================
 * Representa os dados públicos de um item do pedido enviados como resposta JSON.
 * 
 * Por que usamos Record?
 * - Introduzido no Java 14+, um 'record' cria automaticamente construtor, getters,
 *   equals, hashCode e toString de forma imutável e concisa.
 */
public record ItemPedidoDTO(
    String slug,
    String nome,
    Integer quantidade,
    BigDecimal precoUnitario,
    BigDecimal totalItem) {

  public static ItemPedidoDTO de(ItemPedido item) {
    return new ItemPedidoDTO(
        item.getSlugProduto(),
        item.getNomeProduto(),
        item.getQuantidade(),
        item.getPrecoUnitario(),
        item.getTotalItem());
  }
}
