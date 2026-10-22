package pilula.com.pilula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pilula.com.pilula.model.Produto;

public interface ProdutoRepository extends JpaRepository<Produto, String> {

  List<Produto> findAllByOrderByOrdemAsc();

  List<Produto> findByCategoriaIdOrderByOrdemAsc(String categoriaId);
}
