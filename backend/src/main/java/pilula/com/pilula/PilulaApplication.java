package pilula.com.pilula;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ==============================================================================
 * CLASSE PRINCIPAL: PilulaApplication
 * ==============================================================================
 * Ponto de partida (entry point) do Backend da Farmácia Digital "Pílula".
 * 
 * NOTAS PARA APRESENTAÇÃO:
 * 1. @SpringBootApplication: Anotação guarda-chuva que combina:
 *    - @Configuration: Permite registrar beans e configurações adicionais.
 *    - @EnableAutoConfiguration: Configura automaticamente Tomcat embutido,
 *      JPA/Hibernate, Jackson (JSON), DataSource e Spring Security.
 *    - @ComponentScan: Escaneia todo o pacote 'pilula.com.pilula' para detectar
 *      controllers, services, repositories e componentes de segurança.
 * 
 * 2. Ciclo de Inicialização:
 *    - Inicia o container IoC (Inversão de Controle) do Spring.
 *    - Dispara as migrações do Flyway (pasta db/migration) para criar/atualizar
 *      tabelas e popular produtos reais no banco de dados.
 *    - Executa o AdminBootstrapConfig criando o usuário administrador padrão caso não exista.
 *    - Sobe o servidor HTTP na porta configurada (padrão 8080).
 */
@SpringBootApplication
public class PilulaApplication {

	public PilulaApplication() {
		super();
	}

	public static void main(String[] args) {
		SpringApplication.run(PilulaApplication.class, args);
	}
}
