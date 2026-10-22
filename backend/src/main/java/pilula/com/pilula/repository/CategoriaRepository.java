package pilula.com.pilula.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pilula.com.pilula.model.Categoria;

/** Acesso às categorias no banco. O Spring Data cria a implementação sozinho. */
public interface CategoriaRepository extends JpaRepository<Categoria, String> {

  List<Categoria> findAllByOrderByOrdemAsc();
}
