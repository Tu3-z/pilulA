package pilula.com.pilula.service;

import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CadastroDTO;
import pilula.com.pilula.dto.LoginDTO;
import pilula.com.pilula.dto.UsuarioDTO;
import pilula.com.pilula.model.Perfil;
import pilula.com.pilula.model.Usuario;
import pilula.com.pilula.repository.UsuarioRepository;

/** Cadastro, login e dados do usuário logado. */
@Service
public class AuthService {

  private final UsuarioRepository usuarios;
  private final PasswordEncoder senhas;
  private final JwtService jwt;

  public AuthService(UsuarioRepository usuarios, PasswordEncoder senhas, JwtService jwt) {
    this.usuarios = usuarios;
    this.senhas = senhas;
    this.jwt = jwt;
  }

  /** Cria a conta e já devolve o token (o usuário entra logado). 409 se o e-mail já existe. */
  @Transactional
  public UsuarioDTO cadastrar(CadastroDTO dados) {
    String email = normalizar(dados.email());
    if (usuarios.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta com esse e-mail");
    }
    Usuario u = new Usuario();
    u.setNome(dados.nome().trim());
    u.setEmail(email);
    u.setSenhaHash(senhas.encode(dados.senha()));
    u.setCpf(vazioViraNulo(dados.cpf()));
    u.setCelular(vazioViraNulo(dados.celular()));
    u.setPerfil(Perfil.COMPRADOR);
    u = usuarios.save(u);
    return UsuarioDTO.de(u, jwt.gerar(u.getEmail()));
  }

  /** Confere e-mail e senha. 401 com a mesma mensagem nos dois casos (não revela se o e-mail existe). */
  @Transactional(readOnly = true)
  public UsuarioDTO entrar(LoginDTO dados) {
    Usuario u = usuarios.findByEmail(normalizar(dados.email()))
        .filter(x -> senhas.matches(dados.senha(), x.getSenhaHash()))
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos"));
    return UsuarioDTO.de(u, jwt.gerar(u.getEmail()));
  }

  /** Dados de quem está logado (e-mail vem do token). */
  @Transactional(readOnly = true)
  public UsuarioDTO eu(String email) {
    Usuario u = usuarios.findByEmail(email)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Conta não encontrada"));
    return UsuarioDTO.de(u, null);
  }

  private static String normalizar(String email) {
    return email.trim().toLowerCase(Locale.ROOT);
  }

  private static String vazioViraNulo(String s) {
    return s == null || s.isBlank() ? null : s.trim();
  }
}
