package pilula.com.pilula.model;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ==============================================================================
 * ENTIDADE JPA: ItemPedido
 * ==============================================================================
 * Mapeia a tabela 'item_pedido' do banco de dados.
 * Cada linha representa um item comprado dentro de um Pedido.
 * 
 * Conceitos importantes para estudo:
 * 1. @ManyToOne: Relação "Muitos Itens para Um Pedido".
 * 2. FetchType.LAZY: O Hibernate só carrega os dados do pedido pai se explicitamente acessado,
 *    economizando memória e evitando queries SQL desnecessárias no banco de dados.
 * 3. Princípio de Imutabilidade Comercial:
 *    Guardamos nome, slug e precoUnitario como cópias históricas. Se o produto mudar
 *    de preço ou nome no catálogo no futuro, os itens deste pedido mantêm os valores
 *    exatos do momento da compra.
 */
@Entity
@Table(name = "item_pedido")
@Getter
@Setter
@NoArgsConstructor
public class ItemPedido {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * Pedido ao qual este item pertence.
   * JsonBackReference evita loops infinitos de serialização JSON (Item -> Pedido -> Item -> Pedido...).
   */
  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "pedido_id", nullable = false)
  @JsonBackReference
  private Pedido pedido;

  /**
   * Referência opcional ao produto original no catálogo.
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "produto_id")
  private Produto produto;

  /**
   * Nome do produto no momento exato da compra.
   */
  @Column(name = "nome_produto", nullable = false, length = 150)
  private String nomeProduto;

  /**
   * Código amigável (slug) do produto (ex: "dorflex-36").
   */
  @Column(name = "slug_produto", nullable = false, length = 100)
  private String slugProduto;

  /**
   * Quantidade de unidades compradas deste item.
   */
  @Column(nullable = false)
  private Integer quantidade;

  /**
   * Preço unitário cobrado por cada unidade do item.
   */
  @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
  private BigDecimal precoUnitario;

  /**
   * Valor total da linha (quantidade * precoUnitario).
   */
  @Column(name = "total_item", nullable = false, precision = 10, scale = 2)
  private BigDecimal totalItem;

  public ItemPedido(Produto produto, Integer quantidade, BigDecimal precoUnitario) {
    this.produto = produto;
    this.nomeProduto = produto.getNome();
    this.slugProduto = produto.getSlug();
    this.quantidade = quantidade;
    this.precoUnitario = precoUnitario;
    this.totalItem = precoUnitario.multiply(BigDecimal.valueOf(quantidade));
  }
}
