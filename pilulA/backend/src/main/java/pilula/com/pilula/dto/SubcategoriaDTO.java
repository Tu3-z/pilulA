package pilula.com.pilula.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import pilula.com.pilula.model.Subcategoria;

@Schema(name = "Subcategoria")
public record SubcategoriaDTO(
    @Schema(description = "id gerado pelo banco", example = "9") Long id,
    @Schema(description = "código público", example = "protetor") String slug,
    @Schema(example = "Protetor solar") String nome) {

  public static SubcategoriaDTO de(Subcategoria s) {
    return new SubcategoriaDTO(s.getId(), s.getSlug(), s.getNome());
  }
}
