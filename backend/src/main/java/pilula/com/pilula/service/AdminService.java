package pilula.com.pilula.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.UsuarioAdminDTO;
import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.repository.UsuarioRepository;

@Service
public class AdminService {

  private final UsuarioRepository usuarios;

  public AdminService(UsuarioRepository usuarios) {
    this.usuarios = usuarios;
  }

  @Transactional(readOnly = true)
  public List<UsuarioAdminDTO> listarUsuarios() {
    return usuarios.findAllByOrderByIdAsc().stream().map(UsuarioAdminDTO::de).toList();
  }

  @Transactional
  public UsuarioAdminDTO alterarPerfil(Long id, Perfil perfil, String emailAdministrador) {
    var usuario = usuarios.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

    if (usuario.getEmail().equals(emailAdministrador) && perfil != Perfil.ADMIN) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Você não pode remover seu próprio perfil de administrador.");
    }

    if (usuario.getPerfil() == Perfil.ADMIN && perfil != Perfil.ADMIN
        && usuarios.countByPerfil(Perfil.ADMIN) <= 1) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "O sistema precisa manter pelo menos um administrador.");
    }

    usuario.setPerfil(perfil);
    return UsuarioAdminDTO.de(usuario);
  }
}
