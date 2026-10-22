package pilula.com.pilula.dto;

import pilula.com.pilula.model.Subcategoria;

public record SubcategoriaDTO(String id, String nome) {

  public static SubcategoriaDTO de(Subcategoria s) {
    return new SubcategoriaDTO(s.getId(), s.getNome());
  }
}
