package pilula.com.pilula.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.AvaliarReceitaDTO;
import pilula.com.pilula.dto.ReceitaPedidoDTO;
import pilula.com.pilula.model.Pedido;
import pilula.com.pilula.repository.PedidoRepository;

/**
 * ==============================================================================
 * SERVICE: ReceitaService
 * ==============================================================================
 * Lógica de negócio para o fluxo de envio e revisão de receita médica.
 * 
 * Fluxo:
 *  1. Comprador envia foto da receita via POST /api/receita/{referencia}
 *     → receitaStatus muda para "PENDENTE"
 *  2. Admin lista pedidos com receita pendente em GET /api/admin/receitas
 *  3. Admin aprova ou rejeita via PATCH /api/admin/receitas/{id}
 *     → receitaStatus muda para "APROVADA" ou "REJEITADA"
 */
@Service
public class ReceitaService {

  private final PedidoRepository pedidos;

  public ReceitaService(PedidoRepository pedidos) {
    this.pedidos = pedidos;
  }

  /**
   * Comprador envia a URL/base64 da foto da receita para um pedido.
   * A URL pode vir de um upload externo ou diretamente como data URI.
   */
  @Transactional
  public ReceitaPedidoDTO enviarReceita(String referencia, String receitaUrl) {
    var pedido = buscarPedido(referencia);
    pedido.setReceitaUrl(receitaUrl);
    pedido.setReceitaStatus("PENDENTE");
    pedido.setReceitaObs(null);
    pedido.setReceitaRevisadaEm(null);
    return toDTO(pedido);
  }

  /**
   * Admin lista todos os pedidos que possuem receita enviada (qualquer status).
   */
  @Transactional(readOnly = true)
  public List<ReceitaPedidoDTO> listarComReceita() {
    return pedidos.findByReceitaUrlIsNotNullOrderByCriadoEmDesc()
        .stream().map(this::toDTO).toList();
  }

  /**
   * Admin lista pedidos com receita PENDENTE (aguardando revisão).
   */
  @Transactional(readOnly = true)
  public List<ReceitaPedidoDTO> listarPendentes() {
    return pedidos.findByReceitaStatusOrderByCriadoEmDesc("PENDENTE")
        .stream().map(this::toDTO).toList();
  }

  /**
   * Admin aprova ou rejeita a receita de um pedido.
   */
  @Transactional
  public ReceitaPedidoDTO avaliarReceita(Long id, AvaliarReceitaDTO dados) {
    var pedido = pedidos.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

    if (pedido.getReceitaUrl() == null) {
      throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY, "Este pedido não possui receita enviada.");
    }

    pedido.setReceitaStatus(dados.status());
    pedido.setReceitaObs(dados.obs());
    pedido.setReceitaRevisadaEm(OffsetDateTime.now());
    return toDTO(pedido);
  }

  // --- helpers ---

  private Pedido buscarPedido(String referencia) {
    return pedidos.findByReferencia(referencia)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));
  }

  private ReceitaPedidoDTO toDTO(Pedido p) {
    return new ReceitaPedidoDTO(
        p.getId(),
        p.getReferencia(),
        p.getNomeComprador(),
        p.getEmailComprador(),
        p.getReceitaUrl(),
        p.getReceitaStatus(),
        p.getReceitaObs(),
        p.getCriadoEm() != null ? p.getCriadoEm().toString() : null
    );
  }
}
