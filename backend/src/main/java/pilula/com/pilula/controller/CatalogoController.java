package pilula.com.pilula.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import pilula.com.pilula.dto.CatalogoDTO;
import pilula.com.pilula.dto.CategoriaDTO;
import pilula.com.pilula.dto.ProdutoDTO;
import pilula.com.pilula.service.CatalogoService;

/**
 * Endpoints do catálogo (só leitura).
 *
 *   GET /api/catalogo              → categorias + produtos (mesmo formato do catalogo.json do front)
 *   GET /api/categorias            → categorias com subcategorias
 *   GET /api/produtos?categoria=x  → produtos (todos ou de uma categoria)
 *   GET /api/produtos/{id}         → um produto (404 se não existir)
 */
@RestController
@RequestMapping("/api")
public class CatalogoController {

  private final CatalogoService service;

  public CatalogoController(CatalogoService service) {
    this.service = service;
  }

  @GetMapping("/catalogo")
  public CatalogoDTO catalogo() {
    return service.catalogo();
  }

  @GetMapping("/categorias")
  public List<CategoriaDTO> categorias() {
    return service.listarCategorias();
  }

  @GetMapping("/produtos")
  public List<ProdutoDTO> produtos(@RequestParam(required = false) String categoria) {
    return service.listarProdutos(categoria);
  }

  @GetMapping("/produtos/{id}")
  public ProdutoDTO produto(@PathVariable String id) {
    return service.buscarProduto(id);
  }
}
