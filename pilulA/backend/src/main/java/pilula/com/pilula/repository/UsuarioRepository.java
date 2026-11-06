package pilula.com.pilula.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pilula.com.pilula.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /** Busca pelo e-mail (usado no login). */
    Optional<Usuario> findByEmail(String email);

    /** Verifica se já existe uma conta com esse e-mail (usado no cadastro). */
    boolean existsByEmail(String email);
}