package pilula.com.pilula.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Subcategoria {

  /** chave interna, gerada pelo banco (1, 2, 3…); é ela que as outras tabelas referenciam */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** código público e único, usado nos links do site (ex.: "dor-febre") */
  @Column(nullable = false, unique = true)
  private String slug;

  private String nome;

  @ManyToOne
  private Categoria categoria;

  /** posição dentro da categoria */
  private Integer ordem;


}
