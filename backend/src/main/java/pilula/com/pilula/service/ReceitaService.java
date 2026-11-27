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
 * SERVICE: ReceitaService - Módulo de Controle Sanitário e Farmacêutico
 * ==============================================================================
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 
 * 1. Conformidade Regulatória (Anvisa - Portaria 344/98 e RDC 44/2009):
 *    - No Brasil, medicamentos com tarja vermelha com retenção e tarja preta
 *      não podem ser dispensados sem validação e retenção de receita médica válida.
 *    - O sistema Pílula implementa essa conformidade de ponta a ponta:
 *      se o carrinho possui remédio controlado, o checkout exige a foto/documento
 *      da prescrição médica e cria o pedido com 'receitaStatus = PENDENTE'.
 * 
 * 2. Fluxo do Farmacêutico / Administrador:
 *    - O farmacêutico responsável acessa a aba restrita no painel administrativo
 *      (/admin.html) e visualiza as receitas pendentes com imagem em alta resolução.
 *    - O profissional confere: nome do paciente, dosagem, CRM do médico e data.
 *    - Ao aprovar ou rejeitar (com justificativa), o backend registra o status
 *      e o timestamp da auditoria (receitaRevisadaEm).
 * 
 * 3. Transacionalidade (@Transactional):
 *    - As alterações de status e auditoria ocorrem em transações seguras no banco de dados.
 */
@Service
public class ReceitaService {

  private final PedidoRepository pedidos;

  public ReceitaService(PedidoRepository pedidos) {
    this.pedidos = pedidos;
  }

  /**
   * Comprador envia a URL ou base64 da foto da receita para um pedido existente.
   * O status da receita é redefinido para PENDENTE para nova análise da farmácia.
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
   * Admin/Farmacêutico lista todos os pedidos que possuem prescrição anexada.
   * Ordenado cronologicamente (do mais recente para o mais antigo).
   */
  @Transactional(readOnly = true)
  public List<ReceitaPedidoDTO> listarComReceita() {
    return pedidos.findByReceitaUrlIsNotNullOrderByCriadoEmDesc()
        .stream().map(this::toDTO).toList();
  }

  /**
   * Admin/Farmacêutico filtra especificamente os pedidos com receita aguardando análise (PENDENTE).
   * Alimenta a fila de trabalho prioritária do farmacêutico no painel web.
   */
  @Transactional(readOnly = true)
  public List<ReceitaPedidoDTO> listarPendentes() {
    return pedidos.findByReceitaStatusOrderByCriadoEmDesc("PENDENTE")
        .stream().map(this::toDTO).toList();
  }

  /**
   * Aprovação ou Rejeição técnica da receita pelo Farmacêutico/Admin.
   * Grava status ("APROVADA" ou "REJEITADA"), justificativa e data/hora da auditoria.
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

  // --- Métodos Auxiliares de Mapeamento ---

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
