package pilula.com.pilula.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pilula.com.pilula.model.ItemPedido;

/**
 * ==============================================================================
 * REPOSITORY: ItemPedidoRepository
 * ==============================================================================
 * Gerencia a persistência dos itens individuais de pedidos.
 * Como o Pedido utiliza CascadeType.ALL, os itens são salvos automaticamente junto
 * com o Pedido pai, mas este repositório fica disponível para consultas analíticas
 * ou relatórios caso necessário no futuro.
 */
@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
}
