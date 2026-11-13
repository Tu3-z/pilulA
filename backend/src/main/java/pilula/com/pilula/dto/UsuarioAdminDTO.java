package pilula.com.pilula.dto;

import java.time.OffsetDateTime;

import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;

public record UsuarioAdminDTO(Long id, String nome, String email, Perfil perfil, OffsetDateTime criadoEm) {
  public static UsuarioAdminDTO de(Usuario usuario) {
    return new UsuarioAdminDTO(
        usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getPerfil(), usuario.getCriadoEm());
  }
}
