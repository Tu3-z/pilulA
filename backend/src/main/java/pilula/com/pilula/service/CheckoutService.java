package pilula.com.pilula.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CheckoutCriadoDTO;
import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.model.Produto;
import pilula.com.pilula.model.TipoReceita;
import pilula.com.pilula.repository.ProdutoRepository;

@Service
public class CheckoutService {

  private static final Logger log = LoggerFactory.getLogger(CheckoutService.class);
  private static final BigDecimal FRETE = new BigDecimal("9.90");
  private static final BigDecimal LIMITE_FRETE_GRATIS = new BigDecimal("99.00");
  private static final BigDecimal DESCONTO_CUPOM = new BigDecimal("0.10");

  private final ProdutoRepository produtos;
  private final RestClient mercadoPago;
  private final String accessToken;
  private final String frontendUrl;

  public CheckoutService(
      ProdutoRepository produtos,
      @org.springframework.beans.factory.annotation.Autowired(required = false) RestClient.Builder restClientBuilder,
      @Value("${mercadopago.access-token:}") String accessToken,
      @Value("${frontend.url:http://localhost:5500}") String frontendUrl) {
    this.produtos = produtos;
    RestClient.Builder builder = restClientBuilder != null ? restClientBuilder : RestClient.builder();
    this.mercadoPago = builder.baseUrl("https://api.mercadopago.com").build();
    this.accessToken = accessToken.trim();
    this.frontendUrl = frontendUrl.replaceAll("/+$", "");
  }

  public CheckoutCriadoDTO criarPreferencia(CriarCheckoutDTO pedido) {
    if (accessToken.isBlank()) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE, "Checkout indisponível: configure MERCADOPAGO_ACCESS_TOKEN no backend.");
    }

    var linhas = pedido.itens().stream()
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

    BigDecimal subtotal = linhas.stream()
        .map(linha -> linha.produto().getPreco().multiply(BigDecimal.valueOf(linha.quantidade())))
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .setScale(2, RoundingMode.HALF_UP);

    BigDecimal desconto = calcularDesconto(subtotal, pedido.cupom());
    BigDecimal base = subtotal.subtract(desconto);
    boolean retirada = "retirada".equals(pedido.modo());
    BigDecimal frete = retirada || base.compareTo(LIMITE_FRETE_GRATIS) >= 0 ? BigDecimal.ZERO : FRETE;
    BigDecimal total = base.add(frete).setScale(2, RoundingMode.HALF_UP);
    String referencia = UUID.randomUUID().toString();
    int quantidadeTotal = linhas.stream().mapToInt(LinhaPedido::quantidade).sum();

    Map<String, Object> pagador = new LinkedHashMap<>();
    pagador.put("name", pedido.nome().trim());
    pagador.put("email", pedido.email().trim());
    pagador.put("identification", Map.of("type", "CPF", "number", pedido.cpf()));
    pagador.put("phone", Map.of(
        "area_code", pedido.celular().substring(0, 2),
        "number", pedido.celular().substring(2)));
    if (!retirada) {
      pagador.put("address", Map.of(
          "zip_code", pedido.cep(),
          "street_name", pedido.rua(),
          "street_number", pedido.numero()));
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
    preferencia.put("metadata", Map.of(
        "itens", linhas.stream()
            .map(linha -> Map.of(
                "slug", linha.produto().getSlug(),
                "quantidade", linha.quantidade(),
                "preco_unitario", linha.produto().getPreco()))
            .toList(),
        "modo_entrega", pedido.modo(),
        "frete", frete,
        "desconto", desconto,
        "cupom", pedido.cupom() == null ? "" : pedido.cupom().trim().toUpperCase()));
    if (!retirada) {
      preferencia.put("shipments", Map.of("receiver_address", enderecoEntrega(pedido)));
    }

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

      return new CheckoutCriadoDTO(referencia, checkoutUrl, total);
    } catch (RestClientResponseException e) {
      log.error("Mercado Pago recusou a criação da preferência (HTTP {}).", e.getStatusCode(), e);
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Não foi possível iniciar o pagamento no Mercado Pago. Tente novamente.");
    } catch (RestClientException e) {
      log.error("Não foi possível conectar ao Mercado Pago.", e);
      throw new ResponseStatusException(
          HttpStatus.BAD_GATEWAY, "Não foi possível conectar ao Mercado Pago. Tente novamente.");
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
}
