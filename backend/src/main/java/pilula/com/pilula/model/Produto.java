package pilula.com.pilula.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor

public class Produto {
  /** chave interna, gerada pelo banco (1, 2, 3…); é ela que as outras tabelas referenciam */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** código público e único, usado nos links do site (ex.: "dorflex-36") */
  @Column(nullable = false, unique = true)
  private String slug;

  private String nome;
  private String marca;
  private String sub;
  private String selo;
  private String descricao;

  private BigDecimal preco;
  private BigDecimal precoAntigo;

  @Enumerated(EnumType.STRING)
  private TipoReceita receita;

  private boolean destaque;

  @ManyToOne
  private Categoria categoria;

  @ManyToOne
  private Subcategoria subcategoria;

  @Embedded
  private Arte arte;

  /** caminho da foto no front-end, ex.: "assets/img/produtos/codein-30.webp" (opcional) */
  private String foto;

  /** posição na vitrine (ordem de "relevância") */
  private Integer ordem;


}
