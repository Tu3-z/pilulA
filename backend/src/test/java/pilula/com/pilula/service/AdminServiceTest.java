package pilula.com.pilula.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;
import pilula.com.pilula.repository.UsuarioRepository;

class AdminServiceTest {

  @Test
  void naoPermiteRebaixarOUnicoAdministrador() {
    UsuarioRepository usuarios = mock(UsuarioRepository.class);
    Usuario admin = new Usuario();
    admin.setId(1L);
    admin.setEmail("admin@example.com");
    admin.setPerfil(Perfil.ADMIN);
    when(usuarios.findById(1L)).thenReturn(Optional.of(admin));
    when(usuarios.countByPerfil(Perfil.ADMIN)).thenReturn(1L);
    var service = new AdminService(usuarios);

    var erro = assertThrows(
        ResponseStatusException.class,
        () -> service.alterarPerfil(1L, Perfil.COMPRADOR, "outro-admin@example.com"));

    assertEquals(HttpStatus.CONFLICT, erro.getStatusCode());
  }
}
