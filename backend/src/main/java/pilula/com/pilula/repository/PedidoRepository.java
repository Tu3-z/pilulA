package pilula.com.pilula.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pilula.com.pilula.model.Pedido;
import pilula.com.pilula.model.StatusPedido;

/**
 * ==============================================================================
 * REPOSITORY: PedidoRepository
 * ==============================================================================
 * Camada de acesso a dados (Data Access Object / DAO) utilizando Spring Data JPA.
 * 
 * Conceitos importantes para estudo:
 * 1. JpaRepository<Pedido, Long>:
 *    Ao herdar de JpaRepository, o Spring cria em tempo de execução todos os métodos
 *    básicos de CRUD (save, findById, findAll, deleteById, count, etc.) sem que
 *    precisemos escrever uma única linha de SQL manual.
 * 
 * 2. Query Methods (Consultas derivadas pelo nome):
 *    O Spring lê o nome do método e gera automaticamente a query SQL:
 *    - findByReferencia -> "SELECT p FROM Pedido p WHERE p.referencia = :referencia"
 *    - findByMercadoPagoId -> "SELECT p FROM Pedido p WHERE p.mercadoPagoId = :id"
 */
@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

  /**
   * Busca um pedido pela sua referência pública única (UUID).
   * Utilizado quando o frontend consulta o status após o checkout.
   */
  Optional<Pedido> findByReferencia(String referencia);

  /**
   * Busca um pedido pelo identificador retornado pelo Mercado Pago.
   * Utilizado pelo Webhook para saber qual pedido atualizar quando o pagamento for aprovado.
   */
  Optional<Pedido> findByMercadoPagoId(String mercadoPagoId);

  /**
   * Lista todos os pedidos de um determinado e-mail, ordenados do mais recente para o mais antigo.
   */
  List<Pedido> findByEmailCompradorOrderByCriadoEmDesc(String emailComprador);

  /**
   * Lista pedidos por status (ex: listar todos os PENDENTES ou PAGOS).
   */
  List<Pedido> findByStatusOrderByCriadoEmDesc(StatusPedido status);
}
