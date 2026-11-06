package pilula.com.pilula.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/** Resposta de GET /api/catalogo: igual ao arquivo frontend/assets/data/catalogo.json. */
@Schema(name = "Catalogo")
public record CatalogoDTO(List<CategoriaDTO> categorias, List<ProdutoDTO> produtos) {}
