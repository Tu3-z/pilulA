package pilula.com.pilula.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * ==============================================================================
 * ENTIDADE JPA: Pedido
 * ==============================================================================
 * Mapeia a tabela 'pedido' do banco de dados (PostgreSQL no Supabase ou H2 nos testes).
 * 
 * Conceitos essenciais para estudo:
 * 
 * 1. @Table e @Entity:
 *    Indica ao Hibernate/JPA que esta classe Java é uma tabela relacional.
 * 
 * 2. @OneToMany com CascadeType.ALL e orphanRemoval = true:
 *    - CascadeType.ALL: Quando você salva (salvar/persistir) um Pedido, o Hibernate
 *      salva automaticamente todos os itens da lista 'itens' no banco.
 *    - orphanRemoval = true: Se um item for removido da lista Java, o Hibernate
 *      executa o DELETE correspondente na tabela 'item_pedido'.
 * 
 * 3. @Enumerated(EnumType.STRING):
 *    Salva o nome do status no banco como texto ("PENDENTE", "PAGO") em vez do índice numérico (0, 1).
 *    Isso evita problemas se um dia a ordem dos enums for alterada.
 * 
 * 4. Métodos @PrePersist e @PreUpdate:
 *    Gatilhos de ciclo de vida executados automaticamente pelo JPA antes de INSERTs e UPDATEs,
 *    garantindo que as datas de auditoria ('criadoEm' e 'atualizadoEm') estejam sempre preenchidas.
 */
@Entity
@Table(name = "pedido")
@Getter
@Setter
@NoArgsConstructor
public class Pedido {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /**
   * Código UUID único público (external_reference).
   * Enviado ao Mercado Pago e utilizado nas URLs do frontend (ex: /carrinho.html?pedido=...).
   */
  @Column(nullable = false, unique = true, length = 50)
  private String referencia;

  /**
   * Usuário que realizou a compra (opcional, pode ser null se comprar como visitante).
   */
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "usuario_id")
  private Usuario usuario;

  // --- Dados do Comprador ---
  @Column(name = "nome_comprador", nullable = false, length = 150)
  private String nomeComprador;

  @Column(name = "email_comprador", nullable = false, length = 254)
  private String emailComprador;

  @Column(name = "cpf_comprador", nullable = false, length = 14)
  private String cpfComprador;

  @Column(name = "celular_comprador", nullable = false, length = 15)
  private String celularComprador;

  // --- Modalidade e Endereço ---
  @Column(name = "modo_entrega", nullable = false, length = 20)
  private String modoEntrega; // "entrega" ou "retirada"

  @Column(length = 9)
  private String cep;

  @Column(length = 200)
  private String rua;

  @Column(length = 20)
  private String numero;

  @Column(length = 100)
  private String complemento;

  @Column(length = 100)
  private String bairro;

  @Column(length = 100)
  private String cidade;

  @Column(length = 2)
  private String uf;

  // --- Totais Financeiros ---
  @Column(length = 30)
  private String cupom;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal subtotal;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal desconto;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal frete;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal total;

  // --- Ciclo de Vida e Integração ---
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private StatusPedido status = StatusPedido.PENDENTE;

  @Column(name = "mercado_pago_id", length = 100)
  private String mercadoPagoId;

  @Column(name = "mercado_pago_status", length = 50)
  private String mercadoPagoStatus;

  @Column(name = "checkout_url", columnDefinition = "TEXT")
  private String checkoutUrl;

  // --- Auditoria de Datas ---
  @Column(name = "criado_em", nullable = false, updatable = false)
  private OffsetDateTime criadoEm;

  @Column(name = "atualizado_em", nullable = false)
  private OffsetDateTime atualizadoEm;

  /**
   * Lista de itens que compõem o pedido.
   * CascadeType.ALL propaga todas as operações de persistência do Pedido para os Itens.
   */
  @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
  @JsonManagedReference
  private List<ItemPedido> itens = new ArrayList<>();

  /**
   * Método auxiliar para adicionar um item mantendo a coerência bidirecional no modelo de objetos.
   */
  public void adicionarItem(ItemPedido item) {
    this.itens.add(item);
    item.setPedido(this);
  }

  @PrePersist
  protected void aoCriar() {
    this.criadoEm = OffsetDateTime.now();
    this.atualizadoEm = OffsetDateTime.now();
  }

  @PreUpdate
  protected void aoAtualizar() {
    this.atualizadoEm = OffsetDateTime.now();
  }
}
