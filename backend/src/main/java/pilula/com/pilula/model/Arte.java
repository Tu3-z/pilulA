package pilula.com.pilula.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class Arte {
  @Enumerated(EnumType.STRING)
  private FormaArte forma;

  private String rotulo;
}
