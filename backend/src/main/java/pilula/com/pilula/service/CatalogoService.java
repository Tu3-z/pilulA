package pilula.com.pilula.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CatalogoDTO;
import pilula.com.pilula.dto.CategoriaDTO;
import pilula.com.pilula.dto.ProdutoDTO;
import pilula.com.pilula.dto.SubcategoriaDTO;
import pilula.com.pilula.repository.CategoriaRepository;
import pilula.com.pilula.repository.ProdutoRepository;
import pilula.com.pilula.repository.SubcategoriaRepository;

/** Regras de leitura do catálogo. Os controllers só chamam o service; o service usa os repositories. */
@Service
@Transactional(readOnly = true)
public class CatalogoService {

  private final CategoriaRepository categorias;
  private final SubcategoriaRepository subcategorias;
  private final ProdutoRepository produtos;

  public CatalogoService(
      CategoriaRepository categorias, SubcategoriaRepository subcategorias, ProdutoRepository produtos) {
    this.categorias = categorias;
    this.subcategorias = subcategorias;
    this.produtos = produtos;
  }

  public CatalogoDTO catalogo() {
    return new CatalogoDTO(listarCategorias(), listarProdutos(null));
  }

  public List<CategoriaDTO> listarCategorias() {
    return categorias.findAllByOrderByOrdemAsc().stream()
        .map(c -> CategoriaDTO.de(c,
            subcategorias.findByCategoriaIdOrderByOrdemAsc(c.getId()).stream().map(SubcategoriaDTO::de).toList()))
        .toList();
  }

  /** Todos os produtos, ou só os de uma categoria (pelo slug dela, ex.: "dermo"). */
  public List<ProdutoDTO> listarProdutos(String categoriaSlug) {
    var lista = categoriaSlug == null
        ? produtos.findAllByOrderByOrdemAsc()
        : produtos.findByCategoriaSlugOrderByOrdemAsc(categoriaSlug);
    return lista.stream().map(ProdutoDTO::de).toList();
  }

  /** Busca pelo código público (slug), ex.: "dorflex-36". */
  public ProdutoDTO buscarProduto(String slug) {
    return produtos.findBySlug(slug)
        .map(ProdutoDTO::de)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado: " + slug));
  }
}
