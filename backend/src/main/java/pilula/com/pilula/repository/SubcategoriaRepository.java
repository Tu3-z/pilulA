package pilula.com.pilula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pilula.com.pilula.model.Subcategoria;

public interface SubcategoriaRepository extends JpaRepository<Subcategoria, String> {

  /** subcategorias de uma categoria, na ordem do menu */
  List<Subcategoria> findByCategoriaIdOrderByOrdemAsc(String categoriaId);
}
