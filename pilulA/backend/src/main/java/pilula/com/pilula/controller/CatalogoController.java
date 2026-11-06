package pilula.com.pilula.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import pilula.com.pilula.dto.CatalogoDTO;
import pilula.com.pilula.dto.CategoriaDTO;
import pilula.com.pilula.dto.ProdutoDTO;
import pilula.com.pilula.service.CatalogoService;

/**
 * Endpoints do catálogo (só leitura).
 *
 *   GET /api/catalogo              → categorias + produtos (mesmo formato do catalogo.json do front)
 *   GET /api/categorias            → categorias com subcategorias
 *   GET /api/produtos?categoria=x  → produtos (todos ou de uma categoria, pelo slug dela)
 *   GET /api/produtos/{id}         → um produto pelo id numérico (404 se não existir)
 *   GET /api/produtos/slug/{slug}  → um produto pelo código público, ex.: dorflex-36
 */
@RestController
@RequestMapping("/api")
@Tag(name = "Catálogo", description = "Categorias e produtos da farmácia (só leitura)")
public class CatalogoController {

  private final CatalogoService service;

  public CatalogoController(CatalogoService service) {
    this.service = service;
  }

  @Operation(
      summary = "Catálogo completo",
      description = "Categorias (com as subcategorias) e todos os produtos, no mesmo formato do catalogo.json do front-end.")
  @GetMapping("/catalogo")
  public CatalogoDTO catalogo() {
    return service.catalogo();
  }

  @Operation(summary = "Lista as categorias", description = "Na ordem do menu, cada uma com as suas subcategorias.")
  @GetMapping("/categorias")
  public List<CategoriaDTO> categorias() {
    return service.listarCategorias();
  }

  @Operation(summary = "Lista os produtos", description = "Todos os produtos, ou só os de uma categoria.")
  @GetMapping("/produtos")
  public List<ProdutoDTO> produtos(
      @Parameter(description = "slug da categoria (opcional)", example = "dermo")
      @RequestParam(required = false) String categoria) {
    return service.listarProdutos(categoria);
  }

  @Operation(summary = "Busca um produto pelo id", description = "O id é o número gerado pelo banco (1, 2, 3…).")
  @ApiResponse(responseCode = "200", description = "Produto encontrado")
  @ApiResponse(responseCode = "404", description = "Não existe produto com esse id")
  @GetMapping("/produtos/{id}")
  public ProdutoDTO produto(@Parameter(description = "id do produto", example = "1") @PathVariable Long id) {
    return service.buscarProduto(id);
  }

  @Operation(
      summary = "Busca um produto pelo slug",
      description = "O slug é o código público do produto, o mesmo usado no link do site (produto.html?id=dorflex-36).")
  @ApiResponse(responseCode = "200", description = "Produto encontrado")
  @ApiResponse(responseCode = "404", description = "Não existe produto com esse slug")
  @GetMapping("/produtos/slug/{slug}")
  public ProdutoDTO produtoPorSlug(
      @Parameter(description = "slug do produto", example = "dipirona-gotas-medley") @PathVariable String slug) {
    return service.buscarProdutoPorSlug(slug);
  }
}
