package pilula.com.pilula.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.password.PasswordEncoder;

import pilula.com.pilula.dto.CadastroDTO;
import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;
import pilula.com.pilula.repository.UsuarioRepository;

class AuthServiceTest {

  @Test
  void cadastroPublicoSempreCriaComprador() {
    UsuarioRepository usuarios = mock(UsuarioRepository.class);
    PasswordEncoder senhas = mock(PasswordEncoder.class);
    JwtService jwt = mock(JwtService.class);
    when(usuarios.existsByEmail("pessoa@example.com")).thenReturn(false);
    when(senhas.encode("senha-segura")).thenReturn("hash-seguro");
    when(jwt.gerar("pessoa@example.com")).thenReturn("token");
    when(usuarios.save(any(Usuario.class))).thenAnswer(chamada -> chamada.getArgument(0));
    var service = new AuthService(usuarios, senhas, jwt);

    var resultado = service.cadastrar(
        new CadastroDTO("Pessoa Compradora", "Pessoa@Example.com", "senha-segura", null, null));

    ArgumentCaptor<Usuario> criado = ArgumentCaptor.forClass(Usuario.class);
    verify(usuarios).save(criado.capture());
    assertEquals(Perfil.COMPRADOR, criado.getValue().getPerfil());
    assertEquals("COMPRADOR", resultado.perfil());
    verify(usuarios).existsByEmail("pessoa@example.com");
  }
}
