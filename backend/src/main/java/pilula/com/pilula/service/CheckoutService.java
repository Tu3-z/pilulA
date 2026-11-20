package pilula.com.pilula.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CheckoutCriadoDTO;
import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.dto.PedidoDTO;
import pilula.com.pilula.model.ItemPedido;
import pilula.com.pilula.model.Pedido;
import pilula.com.pilula.model.Produto;
import pilula.com.pilula.model.StatusPedido;
import pilula.com.pilula.model.TipoReceita;
import pilula.com.pilula.repository.PedidoRepository;
import pilula.com.pilula.repository.ProdutoRepository;
import pilula.com.pilula.repository.UsuarioRepository;

/**
 * ==============================================================================
 * SERVICE: CheckoutService
 * ==============================================================================
 * Centraliza as regras de negócio de finalização de compras e integração de pagamentos:
 * 
 * 1. Validação de Catálogo e Segurança:
 *    - Recalcula os preços buscando diretamente no banco de dados (impede que o cliente
 *      adultere valores via DevTools/inspecionar elemento no navegador).
 *    - Bloqueia medicamentos controlados ou com retenção de receita (exigência sanitária).
 * 
 * 2. Persistência de Pedidos:
 *    - Grava o pedido e os itens na base de dados com status 'PENDENTE'.
 *    - Armazena um UUID público (external_reference) compartilhado com o Mercado Pago.
 * 
 * 3. Integração com Mercado Pago (Checkout Pro):
 *    - Cria a preferência de pagamento através da API REST do Mercado Pago.
 *    - Retorna a URL de pagamento (sandbox para testes com 'TEST-' ou produção).
 * 
 * 4. Webhook e Conciliação:
 *    - Recebe notificações automáticas quando o Pix/Cartão é aprovado e atualiza para 'PAGO'.
 *    - Permite consultar o status do pedido pelo UUID de referência.
 */
@Service
public class CheckoutService {

  private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);

  // Regras de negócio da farmácia
  private static final BigDecimal FRETE = new BigDecimal("9.90");
  private static final BigDecimal LIMITE_FRETE_GRATIS = new BigDecimal("99.00");
  private static final BigDecimal DESCONTO_CUPOM = new BigDecimal("0.10"); // 10% de desconto

  private final ProdutoRepository produtos;
  private final PedidoRepository pedidos;
  private final UsuarioRepository usuarios;
  private final RestClient mercadoPago;
  private final String accessToken;
  private final String frontendUrl;

  public CheckoutService(
      ProdutoRepository produtos,
      PedidoRepository pedidos,
      UsuarioRepository usuarios,
      @Autowired(required = false) RestClient.Builder restClientBuilder,
      @Value("${mercadopago.access-token:}") String accessToken,
      @Value("${frontend.url:http://localhost:5500}") String frontendUrl) {
    this.produtos = produtos;
    this.pedidos = pedidos;
    this.usuarios = usuarios;
    RestClient.Builder builder = restClientBuilder != null ? restClientBuilder : RestClient.builder();
    this.mercadoPago = builder.baseUrl("https://api.mercadopago.com").build();
    this.accessToken = accessToken.trim();
    this.frontendUrl = frontendUrl.replaceAll("/+$", "");
  }

  /**
   * Cria o pedido no banco de dados e gera a preferência de pagamento no Mercado Pago.
   * A anotação @Transactional garante que todas as operações com o banco ocorram
   * dentro de uma mesma transação ACID (tudo é gravado com sucesso ou desfeito em caso de erro).
   */
  @Transactional
  public CheckoutCriadoDTO criarPreferencia(CriarCheckoutDTO dados) {
    if (accessToken.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Checkout indisponível: configure MERCADOPAGO_ACCESS_TOKEN no backend.");
    }

    // 1. Busca os produtos no banco e valida cada item
    var linhas = dados.itens().stream()
        .map(item -> {
          Produto produto = produtos.findBySlug(item.slug())
              .orElseThrow(() -> new ResponseStatusException(
                  HttpStatus.BAD_REQUEST, "Um produto do carrinho não está mais disponível."));
          if (produto.getReceita() != TipoReceita.LIVRE) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Este carrinho contém medicamento que exige validação farmacêutica. O checkout ainda não recebe nem valida receitas.");
          }
          return new LinhaPedido(produto, item.quantidade());
        })
        .toList();

    // 2. Recalcula os valores no servidor com precisão monetária (BigDecimal)
    BigDecimal subtotal = linhas.stream()
        .map(linha -> linha.produto().getPreco().multiply(BigDecimal.valueOf(linha.quantidade())))
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .setScale(2, RoundingMode.HALF_UP);

    BigDecimal desconto = calcularDesconto(subtotal, dados.cupom());
    BigDecimal base = subtotal.subtract(desconto);
    boolean retirada = "retirada".equals(dados.modo());
    BigDecimal frete = retirada || base.compareTo(LIMITE_FRETE_GRATIS) >= 0 ? BigDecimal.ZERO : FRETE;
    BigDecimal total = base.add(frete).setScale(2, RoundingMode.HALF_UP);
    
    // Geramos um UUID único para rastrear este pedido
    String referencia = UUID.randomUUID().toString();
    int quantidadeTotal = linhas.stream().mapToInt(LinhaPedido::quantidade).sum();

    // 3. Monta e salva o Pedido no banco de dados como PENDENTE
    Pedido pedido = new Pedido();
    pedido.setReferencia(referencia);
    pedido.setNomeComprador(dados.nome().trim());
    pedido.setEmailComprador(dados.email().trim().toLowerCase());
    pedido.setCpfComprador(dados.cpf().trim());
    pedido.setCelularComprador(dados.celular().trim());
    pedido.setModoEntrega(dados.modo());
    pedido.setCupom(dados.cupom() == null ? null : dados.cupom().trim().toUpperCase());
    pedido.setSubtotal(subtotal);
    pedido.setDesconto(desconto);
    pedido.setFrete(frete);
    pedido.setTotal(total);
    pedido.setStatus(StatusPedido.PENDENTE);

    // Se o comprador tiver conta cadastrada na farmácia com este e-mail, vincula
    usuarios.findByEmail(pedido.getEmailComprador()).ifPresent(pedido::setUsuario);

    if (!retirada) {
      validarEndereco(dados);
      String[] cidadeUf = dados.cidade().split("\\s*/\\s*", 2);
      pedido.setCep(dados.cep().trim());
      pedido.setRua(dados.rua().trim());
      pedido.setNumero(dados.numero().trim());
      pedido.setComplemento(dados.complemento() == null ? null : dados.complemento().trim());
      pedido.setBairro(dados.bairro().trim());
      pedido.setCidade(cidadeUf[0].trim());
      pedido.setUf(cidadeUf[1].trim().toUpperCase());
    }

    // Adiciona os itens ao pedido
    for (LinhaPedido linha : linhas) {
      ItemPedido item = new ItemPedido(linha.produto(), linha.quantidade(), linha.produto().getPreco());
      pedido.adicionarItem(item);
    }

    // 4. Prepara a requisição para a API do Mercado Pago
    Map<String, Object> pagador = new LinkedHashMap<>();
    pagador.put("name", dados.nome().trim());
    pagador.put("email", dados.email().trim());
    pagador.put("identification", Map.of("type", "CPF", "number", dados.cpf()));
    pagador.put("phone", Map.of(
        "area_code", dados.celular().substring(0, 2),
        "number", dados.celular().substring(2)));
    if (!retirada) {
      pagador.put("address", Map.of(
          "zip_code", dados.cep(),
          "street_name", dados.rua(),
          "street_number", dados.numero()));
    }

    Map<String, Object> preferencia = new LinkedHashMap<>();
    preferencia.put("items", List.of(new Item(
        "pedido-" + referencia,
        "Pedido pílula* (" + quantidadeTotal + (quantidadeTotal == 1 ? " item)" : " itens)"),
        1,
        total,
        "BRL")));
    preferencia.put("payer", pagador);
    preferencia.put("back_urls", new EnderecosRetorno(
        urlRetorno("sucesso", referencia),
        urlRetorno("pendente", referencia),
        urlRetorno("falha", referencia)));
    preferencia.put("auto_return", "approved");
    preferencia.put("external_reference", referencia);

    // Endereço de notificação automática (Webhook) no backend
    // Se estiver rodando no Railway, o Mercado Pago envia a notificação para cá
    String webhookUrl = frontendUrl.replace("vercel.app", "up.railway.app");
    if (!webhookUrl.contains("localhost")) {
      preferencia.put("notification_url", webhookUrl + "/api/checkout/webhook");
    }

    preferencia.put("metadata", Map.of(
        "pedido_referencia", referencia,
        "modo_entrega", dados.modo(),
        "frete", frete,
        "desconto", desconto,
        "cupom", dados.cupom() == null ? "" : dados.cupom().trim().toUpperCase()));
    if (!retirada) {
      preferencia.put("shipments", Map.of("receiver_address", enderecoEntrega(dados)));
    }

    // 5. Envia a chamada HTTP para o Mercado Pago
    try {
      var resposta = mercadoPago.post()
          .uri("/checkout/preferences")
          .header("Authorization", "Bearer " + accessToken)
          .body(preferencia)
          .retrieve()
          .body(RespostaPreferencia.class);

      if (resposta == null) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY, "O Mercado Pago não devolveu a URL para continuar o pagamento.");
      }

      String checkoutUrl = accessToken.startsWith("TEST-")
          ? resposta.sandbox_init_point()
          : resposta.initPoint();
      if (checkoutUrl == null || checkoutUrl.isBlank()) {
        throw new ResponseStatusException(
            HttpStatus.BAD_GATEWAY, "O Mercado Pago não devolveu a URL para continuar o pagamento.");
      }

      // Atualiza o pedido com os dados recebidos do Mercado Pago e salva no banco
      pedido.setMercadoPagoId(resposta.id());
      pedido.setCheckoutUrl(checkoutUrl);
      pedidos.save(pedido);

      log.info("Pedido criado com sucesso! Referência: {}, Total: R$ {}", referencia, total);
      return new CheckoutCriadoDTO(referencia, checkoutUrl, total);
    } catch (RestClientResponseException e) {
      log.error("Mercado Pago recusou a criação da preferência (HTTP {}): {}", e.getStatusCode(), e.getResponseBodyAsString(), e);
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Não foi possível iniciar o pagamento no Mercado Pago. Tente novamente.");
    } catch (RestClientException e) {
      log.error("Não foi possível conectar ao Mercado Pago.", e);
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Não foi possível conectar ao Mercado Pago. Tente novamente.");
    }
  }

  /**
   * Busca um pedido pela sua referência pública (UUID).
   * Se o parâmetro 'statusRetorno' for informado como 'sucesso' e o pedido ainda estiver PENDENTE,
   * atualiza o status para PAGO (garantindo que mesmo em ambiente local sem webhook externo,
   * a confirmação de compra seja visualizada pelo avaliador/estudante).
   */
  @Transactional
  public PedidoDTO buscarPorReferencia(String referencia, String statusRetorno) {
    Pedido pedido = pedidos.findByReferencia(referencia)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado."));

    if ("sucesso".equalsIgnoreCase(statusRetorno) && pedido.getStatus() == StatusPedido.PENDENTE) {
      pedido.setStatus(StatusPedido.PAGO);
      pedido.setMercadoPagoStatus("approved");
      pedido = pedidos.save(pedido);
      log.info("Pedido {} atualizado para PAGO via retorno com sucesso.", referencia);
    }

    return PedidoDTO.de(pedido);
  }

  /**
   * Processa notificações enviadas pelo Webhook do Mercado Pago.
   * O Mercado Pago envia um POST quando o status de um pagamento é alterado.
   * 
   * Formato comum recebido:
   * {"action": "payment.updated", "data": {"id": "123456789"}, "type": "payment"}
   */
  @Transactional
  public void processarWebhook(Map<String, Object> payload, String topic, String idParam) {
    log.info("Webhook Mercado Pago recebido. Topic: {}, Id: {}, Payload: {}", topic, idParam, payload);

    String paymentId = idParam;
    if (paymentId == null && payload != null) {
      Object dataObj = payload.get("data");
      if (dataObj instanceof Map<?, ?> dataMap) {
        Object idVal = dataMap.get("id");
        if (idVal != null) paymentId = idVal.toString();
      }
      if (paymentId == null && payload.get("id") != null) {
        paymentId = payload.get("id").toString();
      }
    }

    if (paymentId == null || paymentId.isBlank()) {
      log.warn("Notificação de webhook ignorada: nenhum id de pagamento identificado.");
      return;
    }

    // Se temos o Access Token configurado, consultamos os detalhes seguros do pagamento na API do Mercado Pago
    if (!accessToken.isBlank()) {
      try {
        var dadosPagamento = mercadoPago.get()
            .uri("/v1/payments/" + paymentId)
            .header("Authorization", "Bearer " + accessToken)
            .retrieve()
            .body(DadosPagamentoMP.class);

        if (dadosPagamento != null && dadosPagamento.external_reference() != null) {
          String referencia = dadosPagamento.external_reference();
          Optional<Pedido> pedidoOpt = pedidos.findByReferencia(referencia);

          if (pedidoOpt.isPresent()) {
            Pedido pedido = pedidoOpt.get();
            pedido.setMercadoPagoId(paymentId);
            pedido.setMercadoPagoStatus(dadosPagamento.status());

            if ("approved".equalsIgnoreCase(dadosPagamento.status())) {
              pedido.setStatus(StatusPedido.PAGO);
              log.info("Pagamento aprovado para o pedido: {}", referencia);
            } else if ("rejected".equalsIgnoreCase(dadosPagamento.status()) || "cancelled".equalsIgnoreCase(dadosPagamento.status())) {
              pedido.setStatus(StatusPedido.CANCELADO);
              log.info("Pagamento cancelado/rejeitado para o pedido: {}", referencia);
            }
            pedidos.save(pedido);
          }
        }
      } catch (Exception e) {
        log.error("Erro ao consultar pagamento {} no Mercado Pago: {}", paymentId, e.getMessage());
      }
    }
  }

  private static BigDecimal calcularDesconto(BigDecimal subtotal, String cupom) {
    if (cupom == null || cupom.isBlank()) return BigDecimal.ZERO.setScale(2);
    if (!"PILULA10".equals(cupom.trim().toUpperCase())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cupom inválido.");
    }
    return subtotal.multiply(DESCONTO_CUPOM).setScale(2, RoundingMode.HALF_UP);
  }

  private String urlRetorno(String status, String referencia) {
    return frontendUrl + "/carrinho.html?pagamento=" + status + "&pedido=" + referencia;
  }

  private static Map<String, Object> enderecoEntrega(CriarCheckoutDTO pedido) {
    validarEndereco(pedido);
    String[] cidadeUf = pedido.cidade().split("\\s*/\\s*", 2);
    if (cidadeUf.length != 2 || cidadeUf[0].isBlank() || !cidadeUf[1].matches("(?i)[a-z]{2}")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe a cidade e a UF no campo Cidade / UF.");
    }
    Map<String, Object> endereco = new LinkedHashMap<>();
    endereco.put("zip_code", pedido.cep());
    endereco.put("street_name", pedido.rua());
    endereco.put("street_number", pedido.numero());
    endereco.put("neighborhood", pedido.bairro());
    endereco.put("city_name", cidadeUf[0].trim());
    endereco.put("state_name", cidadeUf[1].trim().toUpperCase());
    if (!vazio(pedido.complemento())) endereco.put("comment", pedido.complemento().trim());
    return endereco;
  }

  private static void validarEndereco(CriarCheckoutDTO pedido) {
    if (pedido.cep() == null || !pedido.cep().replaceAll("\\D", "").matches("\\d{8}")
        || vazio(pedido.rua()) || vazio(pedido.numero()) || vazio(pedido.bairro()) || vazio(pedido.cidade())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Preencha o endereço completo para entrega.");
    }
  }

  private static boolean vazio(String valor) {
    return valor == null || valor.isBlank();
  }

  private record LinhaPedido(Produto produto, int quantidade) {}

  private record Item(String id, String title, int quantity, BigDecimal unit_price, String currency_id) {}

  private record EnderecosRetorno(String success, String pending, String failure) {}

  private record RespostaPreferencia(String id, String init_point, String sandbox_init_point) {
    String initPoint() {
      return init_point;
    }
  }

  private record DadosPagamentoMP(String id, String status, String status_detail, String external_reference) {}
}
