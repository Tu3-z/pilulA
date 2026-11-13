package pilula.com.pilula.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import pilula.com.pilula.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

  List<Produto> findAllByOrderByOrdemAsc();

  /** produtos de uma categoria, pelo slug dela (ex.: "dermo") */
  List<Produto> findByCategoriaSlugOrderByOrdemAsc(String categoriaSlug);

  /** busca pelo código público do produto (ex.: "dorflex-36") */
  Optional<Produto> findBySlug(String slug);

  @Query("select coalesce(max(p.ordem), -1) + 1 from Produto p")
  int proximaOrdem();
}
