package pilula.com.pilula.dto;

import java.util.List;

/** Resposta de GET /api/catalogo: igual ao arquivo frontend/assets/data/catalogo.json. */
public record CatalogoDTO(List<CategoriaDTO> categorias, List<ProdutoDTO> produtos) {}
