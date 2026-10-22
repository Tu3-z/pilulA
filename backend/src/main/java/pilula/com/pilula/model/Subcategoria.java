package pilula.com.pilula.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Subcategoria {

  @Id
  private String id;
  private String nome;

  @ManyToOne
  private Categoria categoria;

  /** posição dentro da categoria */
  private Integer ordem;


}
