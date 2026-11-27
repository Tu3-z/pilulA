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
// ANOTAÇÃO: @Service
// SE O PROFESSOR PERGUNTAR: Indica que esta classe é um componente de serviço Spring que contém
// as regras de negócio de autenticação, hashing criptográfico e geração de sessão JWT.
@Service
public class AuthService {

  // Repositório de acesso à tabela 'usuario' no PostgreSQL
  private final UsuarioRepository usuarios;
  
  // Codificador BCrypt gerenciado pelo Spring Security para proteger senhas
  private final PasswordEncoder senhas;
  
  // Serviço gerador e validador de tokens JWT
  private final JwtService jwt;

  // Injeção de dependências via construtor (melhor prática recomendada pelo Spring Framework)
  public AuthService(UsuarioRepository usuarios, PasswordEncoder senhas, JwtService jwt) {
    this.usuarios = usuarios;
    this.senhas = senhas;
    this.jwt = jwt;
  }

  // ANOTAÇÃO: @Transactional
  // O QUE FAZ: Abre uma transação no banco de dados. Se o 'usuarios.save(u)' falhar por qualquer razão,
  // nenhuma alteração parcial é gravada no PostgreSQL (Rollback automático).
  @Transactional
  public UsuarioDTO cadastrar(CadastroDTO dados) {
    // 1. Normaliza o e-mail: remove espaços em branco e converte para minúsculas
    String email = normalizar(dados.email());
    
    // 2. LINHA: if (usuarios.existsByEmail(email))
    // O QUE FAZ: Executa 'SELECT COUNT(*) ...' no banco para garantir unicidade do e-mail.
    // Se já existir conta com esse e-mail, devolve HTTP 409 (Conflict).
    if (usuarios.existsByEmail(email)) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Já existe uma conta com esse e-mail");
    }
    
    // 3. Instancia a entidade de domínio e preenche os campos com segurança
    Usuario u = new Usuario();
    u.setNome(dados.nome().trim());
    u.setEmail(email);
    
    // LINHA: senhas.encode(dados.senha())
    // SE O PROFESSOR PERGUNTAR: NUNCA salvamos senhas puras em texto claro no banco.
    // O BCrypt gera um salt aleatório e aplica algoritmo de hashing criptográfico unidirecional.
    u.setSenhaHash(senhas.encode(dados.senha()));
    u.setCpf(vazioViraNulo(dados.cpf()));
    u.setCelular(vazioViraNulo(dados.celular()));
    
    // Todo cadastro público começa com o perfil de acesso 'COMPRADOR'
    u.setPerfil(Perfil.COMPRADOR);
    
    // 4. Persiste o novo usuário na tabela 'usuario' do banco de dados
    u = usuarios.save(u);
    
    // 5. Retorna o DTO com os dados do usuário e o token JWT recém-gerado para já deixá-lo autenticado
    return UsuarioDTO.de(u, jwt.gerar(u.getEmail()));
  }

  // ANOTAÇÃO: @Transactional(readOnly = true)
  // SE O PROFESSOR PERGUNTAR: Informa ao Hibernate que esta transação é somente leitura.
  // Isso desativa o 'dirty checking' do Hibernate, economizando memória e acelerando a consulta no banco.
  @Transactional(readOnly = true)
  public UsuarioDTO entrar(LoginDTO dados) {
    // 1. Busca o usuário pelo e-mail normalizado
    // 2. LINHA: senhas.matches(dados.senha(), x.getSenhaHash())
    // O QUE FAZ: Compara a senha digitada com o hash BCrypt salvo no banco.
    // SE O PROFESSOR PERGUNTAR: Por que não usar if (senhaDigitada.equals(senhaDoBanco))?
    // RESPOSTA: Porque o hash do BCrypt contém um salt aleatório; a função matches() extrai o salt do hash
    // e compara matematicamente de forma segura contra timing attacks.
    Usuario u = usuarios.findByEmail(normalizar(dados.email()))
        .filter(x -> senhas.matches(dados.senha(), x.getSenhaHash()))
        // Retorna HTTP 401 caso o e-mail não exista OU a senha esteja errada
        // RESPOSTA PRO PROFESSOR: Mensagem genérica evita enumeração de usuários (o invasor não descobre se o e-mail existe no banco).
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos"));
        
    // Devolve os dados do comprador junto com seu token JWT válido
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
