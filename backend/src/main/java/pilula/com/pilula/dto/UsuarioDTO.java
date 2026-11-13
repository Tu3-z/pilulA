package pilula.com.pilula.dto;

import pilula.com.pilula.model.Usuario;

/** O que a API devolve depois de cadastrar ou logar (nunca devolve a senha) */
public record UsuarioDTO(
    Long id,
    String nome,
    String email,
    String cpf,
    String celular,
    String perfil,
    String token
) {
    public static UsuarioDTO de(Usuario u, String token) {
        return new UsuarioDTO(
            u.getId(), u.getNome(), u.getEmail(), u.getCpf(), u.getCelular(), u.getPerfil().name(), token);
    }
}