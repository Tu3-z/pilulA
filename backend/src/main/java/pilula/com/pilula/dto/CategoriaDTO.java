package pilula.com.pilula.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import pilula.com.pilula.model.Categoria;

/** Categoria com as subcategorias dentro. */
@Schema(name = "Categoria")
public record CategoriaDTO(
    @Schema(description = "id gerado pelo banco", example = "3") Long id,
    @Schema(description = "código público, usado nos links do site", example = "dermo") String slug,
    @Schema(example = "Dermocosméticos") String nome,
    String rotulo,
    String arquivo,
    String tom,
    List<SubcategoriaDTO> subs) {

  public static CategoriaDTO de(Categoria c, List<SubcategoriaDTO> subs) {
    return new CategoriaDTO(c.getId(), c.getSlug(), c.getNome(), c.getRotulo(), c.getArquivo(), c.getTom(), subs);
  }
}
