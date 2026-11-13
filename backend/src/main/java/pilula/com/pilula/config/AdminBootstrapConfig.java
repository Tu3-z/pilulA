package pilula.com.pilula.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import pilula.com.pilula.service.AdminBootstrapService;

@Configuration
public class AdminBootstrapConfig {

  @Bean
  ApplicationRunner criarAdminInicial(
      AdminBootstrapService service,
      @Value("${admin.bootstrap.email:}") String email,
      @Value("${admin.bootstrap.password:}") String senha) {
    return args -> service.criarAdminInicial(email, senha);
  }
}
