package pilula.com.pilula.service;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;
import pilula.com.pilula.repository.UsuarioRepository;

@Service
public class AdminBootstrapService {

  private final UsuarioRepository usuarios;
  private final PasswordEncoder senhas;

  public AdminBootstrapService(UsuarioRepository usuarios, PasswordEncoder senhas) {
    this.usuarios = usuarios;
    this.senhas = senhas;
  }

  @Transactional
  public void criarAdminInicial(String emailConfigurado, String senhaConfigurada) {
    String email = emailConfigurado == null ? "" : emailConfigurado.trim().toLowerCase(Locale.ROOT);
    String senha = senhaConfigurada == null ? "" : senhaConfigurada;
    if (!StringUtils.hasText(email) && !StringUtils.hasText(senha)) return;
    if (!StringUtils.hasText(email) || !StringUtils.hasText(senha)
        || email.length() > 254 || !email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$")
        || senha.length() < 16 || senha.getBytes(StandardCharsets.UTF_8).length > 72) {
      throw new IllegalStateException(
          "Configure ADMIN_BOOTSTRAP_EMAIL válido e ADMIN_BOOTSTRAP_PASSWORD com 16 a 72 bytes, ou remova ambas as variáveis.");
    }

    var existente = usuarios.findByEmail(email);
    if (existente.isPresent()) {
      if (existente.get().getPerfil() != Perfil.ADMIN) {
        throw new IllegalStateException(
            "ADMIN_BOOTSTRAP_EMAIL já pertence a uma conta não administradora. Remova as variáveis ou escolha outro e-mail.");
      }
      return;
    }

    Usuario admin = new Usuario();
    admin.setNome("Administrador pílula*");
    admin.setEmail(email);
    admin.setSenhaHash(senhas.encode(senha));
    admin.setPerfil(Perfil.ADMIN);
    usuarios.save(admin);
  }
}
