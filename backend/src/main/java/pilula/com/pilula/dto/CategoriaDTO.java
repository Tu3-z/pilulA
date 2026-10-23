package pilula.com.pilula.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import pilula.com.pilula.model.Categoria;

/** Categoria com as subcategorias dentro, no mesmo formato do catalogo.json do front-end. */
@Schema(name = "Categoria")
public record CategoriaDTO(String id, String nome, String rotulo, String arquivo, String tom, List<SubcategoriaDTO> subs) {

  public static CategoriaDTO de(Categoria c, List<SubcategoriaDTO> subs) {
    // "id" na API é o slug (ex.: "dermo"), como no catalogo.json do front
    return new CategoriaDTO(c.getSlug(), c.getNome(), c.getRotulo(), c.getArquivo(), c.getTom(), subs);
  }
}
