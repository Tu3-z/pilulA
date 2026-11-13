package pilula.com.pilula.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import org.mockito.ArgumentCaptor;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;
import pilula.com.pilula.repository.UsuarioRepository;

class AdminBootstrapServiceTest {

  @Test
  void cadastroPublicoNaoCriaAdminSeBootstrapNaoFoiConfigurado() {
    UsuarioRepository usuarios = mock(UsuarioRepository.class);
    var service = new AdminBootstrapService(usuarios, mock(PasswordEncoder.class));

    service.criarAdminInicial("", "");

    verifyNoInteractions(usuarios);
  }

  @Test
  void criaPrimeiroAdminComSenhaHasheada() {
    UsuarioRepository usuarios = mock(UsuarioRepository.class);
    PasswordEncoder senhas = mock(PasswordEncoder.class);
    when(usuarios.findByEmail("admin@example.com")).thenReturn(Optional.empty());
    when(senhas.encode("senha-administrativa-forte")).thenReturn("hash-seguro");
    var service = new AdminBootstrapService(usuarios, senhas);

    service.criarAdminInicial(" Admin@Example.com ", "senha-administrativa-forte");

    ArgumentCaptor<Usuario> criado = ArgumentCaptor.forClass(Usuario.class);
    verify(usuarios).save(criado.capture());
    assertEquals("admin@example.com", criado.getValue().getEmail());
    assertEquals("hash-seguro", criado.getValue().getSenhaHash());
    assertEquals(Perfil.ADMIN, criado.getValue().getPerfil());
    verify(senhas).encode("senha-administrativa-forte");
  }
}
