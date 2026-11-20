package pilula.com.pilula.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.dto.PedidoDTO;
import pilula.com.pilula.model.Pedido;
import pilula.com.pilula.model.Produto;
import pilula.com.pilula.model.StatusPedido;
import pilula.com.pilula.model.TipoReceita;
import pilula.com.pilula.repository.PedidoRepository;
import pilula.com.pilula.repository.ProdutoRepository;
import pilula.com.pilula.repository.UsuarioRepository;

/**
 * ==============================================================================
 * TESTES UNITÁRIOS: CheckoutServiceTest
 * ==============================================================================
 * Testa as regras de negócio de checkout, validações sanitárias de receita,
 * persistência de pedidos e atualização de status.
 */
class CheckoutServiceTest {

  private ProdutoRepository produtos;
  private PedidoRepository pedidos;
  private UsuarioRepository usuarios;

  @BeforeEach
  void setUp() {
    produtos = mock(ProdutoRepository.class);
    pedidos = mock(PedidoRepository.class);
    usuarios = mock(UsuarioRepository.class);
  }

  @Test
  void checkoutExigeTokenDoMercadoPago() {
    var service = new CheckoutService(produtos, pedidos, usuarios, RestClient.builder(), "", "http://localhost:5500");

    var erro = assertThrows(ResponseStatusException.class, () -> service.criarPreferencia(pedido("produto-livre")));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, erro.getStatusCode());
  }

  @Test
  void naoIniciaCheckoutDeMedicamentoQueExigeReceita() {
    Produto produto = new Produto();
    produto.setSlug("medicamento-controlado");
    produto.setReceita(TipoReceita.PRESCRICAO);
    when(produtos.findBySlug("medicamento-controlado")).thenReturn(Optional.of(produto));

    var service = new CheckoutService(produtos, pedidos, usuarios, RestClient.builder(), "TEST-token", "http://localhost:5500");

    var erro = assertThrows(
        ResponseStatusException.class,
        () -> service.criarPreferencia(pedido("medicamento-controlado")));

    assertEquals(HttpStatus.CONFLICT, erro.getStatusCode());
  }

  @Test
  void buscaPedidoPorReferenciaEAtualizaSeRetornouComSucesso() {
    Pedido pedidoExistente = new Pedido();
    pedidoExistente.setReferencia("ref-teste-123");
    pedidoExistente.setStatus(StatusPedido.PENDENTE);
    pedidoExistente.setNomeComprador("Ana Silva");
    pedidoExistente.setEmailComprador("ana@exemplo.com");
    pedidoExistente.setCpfComprador("52998224725");
    pedidoExistente.setCelularComprador("11987654321");
    pedidoExistente.setModoEntrega("retirada");
    pedidoExistente.setSubtotal(new BigDecimal("30.00"));
    pedidoExistente.setDesconto(BigDecimal.ZERO);
    pedidoExistente.setFrete(BigDecimal.ZERO);
    pedidoExistente.setTotal(new BigDecimal("30.00"));

    when(pedidos.findByReferencia("ref-teste-123")).thenReturn(Optional.of(pedidoExistente));
    when(pedidos.save(any(Pedido.class))).thenAnswer(invocation -> invocation.getArgument(0));

    var service = new CheckoutService(produtos, pedidos, usuarios, RestClient.builder(), "TEST-token", "http://localhost:5500");

    PedidoDTO dto = service.buscarPorReferencia("ref-teste-123", "sucesso");

    assertNotNull(dto);
    assertEquals("ref-teste-123", dto.referencia());
    assertEquals("PAGO", dto.status());
  }

  private static CriarCheckoutDTO pedido(String slug) {
    return new CriarCheckoutDTO(
        "Pessoa Teste",
        "teste@example.com",
        "52998224725",
        "11987654321",
        "retirada",
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        List.of(new CriarCheckoutDTO.ItemDTO(slug, 1)));
  }
}
