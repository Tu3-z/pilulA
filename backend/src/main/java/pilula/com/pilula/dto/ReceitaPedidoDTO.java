package pilula.com.pilula.dto;

/**
 * DTO para retorno de pedidos com receita pendente no painel do admin.
 */
public record ReceitaPedidoDTO(
    Long id,
    String referencia,
    String nomeComprador,
    String emailComprador,
    String receitaUrl,
    String receitaStatus,
    String receitaObs,
    String criadoEm
) {}
