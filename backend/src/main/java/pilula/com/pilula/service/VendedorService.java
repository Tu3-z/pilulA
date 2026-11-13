package pilula.com.pilula.service;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.ProdutoDTO;
import pilula.com.pilula.dto.SalvarProdutoDTO;
import pilula.com.pilula.model.Arte;
import pilula.com.pilula.model.FormaArte;
import pilula.com.pilula.model.Produto;
import pilula.com.pilula.model.TipoReceita;
import pilula.com.pilula.repository.CategoriaRepository;
import pilula.com.pilula.repository.ProdutoRepository;
import pilula.com.pilula.repository.SubcategoriaRepository;

@Service
@Transactional
public class VendedorService {

  private final ProdutoRepository produtos;
  private final CategoriaRepository categorias;
  private final SubcategoriaRepository subcategorias;

  public VendedorService(
      ProdutoRepository produtos,
      CategoriaRepository categorias,
      SubcategoriaRepository subcategorias) {
    this.produtos = produtos;
    this.categorias = categorias;
    this.subcategorias = subcategorias;
  }

  @Transactional(readOnly = true)
  public List<ProdutoDTO> listar() {
    return produtos.findAllByOrderByOrdemAsc().stream().map(ProdutoDTO::de).toList();
  }

  public ProdutoDTO criar(SalvarProdutoDTO dados) {
    if (produtos.findBySlug(dados.slug()).isPresent()) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um produto com esse código.");
    }
    return ProdutoDTO.de(aplicar(new Produto(), dados));
  }

  public ProdutoDTO atualizar(Long id, SalvarProdutoDTO dados) {
    Produto produto = produtos.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
    produtos.findBySlug(dados.slug()).filter(outro -> !outro.getId().equals(id)).ifPresent(outro -> {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe um produto com esse código.");
    });
    return ProdutoDTO.de(aplicar(produto, dados));
  }

  public void remover(Long id) {
    Produto produto = produtos.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
    produtos.delete(produto);
  }

  private Produto aplicar(Produto produto, SalvarProdutoDTO dados) {
    var categoria = categorias.findBySlug(dados.categoria())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Categoria não encontrada."));

    produto.setSlug(dados.slug().trim());
    produto.setNome(dados.nome().trim());
    produto.setMarca(dados.marca().trim());
    produto.setSub(vazioNulo(dados.sub()));
    produto.setCategoria(categoria);
    produto.setSubcategoria(null);
    if (dados.subcategoria() != null && !dados.subcategoria().isBlank()) {
      produto.setSubcategoria(subcategorias.findBySlugAndCategoriaSlug(dados.subcategoria(), dados.categoria())
          .orElseThrow(() -> new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "A subcategoria não pertence à categoria selecionada.")));
    }
    produto.setPreco(dados.preco());
    produto.setPrecoAntigo(dados.precoAntigo());
    produto.setReceita(TipoReceita.valueOf(dados.receita().toUpperCase(Locale.ROOT)));
    produto.setDestaque(dados.destaque());
    produto.setSelo(vazioNulo(dados.selo()));
    produto.setDescricao(vazioNulo(dados.descricao()));
    produto.setFoto(vazioNulo(dados.foto()));
    produto.setOrdem(dados.ordem() == null ? produtos.proximaOrdem() : dados.ordem());

    if (dados.forma() == null || dados.forma().isBlank()) {
      produto.setArte(null);
    } else {
      Arte arte = produto.getArte() == null ? new Arte() : produto.getArte();
      arte.setForma(FormaArte.valueOf(dados.forma().toUpperCase(Locale.ROOT)));
      arte.setRotulo(vazioNulo(dados.rotulo()));
      produto.setArte(arte);
    }
    return produtos.save(produto);
  }

  private static String vazioNulo(String valor) {
    return valor == null || valor.isBlank() ? null : valor.trim();
  }
}
