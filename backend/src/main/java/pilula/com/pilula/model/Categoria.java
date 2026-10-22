package pilula.com.pilula.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Categoria {

  @Id
  private String id;
  private String nome;
  private String rotulo;
  private String arquivo;
  private String tom;

  /** posição no menu */
  private Integer ordem;





}
