package pilula.com.pilula.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import pilula.com.pilula.model.Subcategoria;

@Schema(name = "Subcategoria")
public record SubcategoriaDTO(String id, String nome) {

  public static SubcategoriaDTO de(Subcategoria s) {
    return new SubcategoriaDTO(s.getSlug(), s.getNome()); // "id" na API é o slug
  }
}
