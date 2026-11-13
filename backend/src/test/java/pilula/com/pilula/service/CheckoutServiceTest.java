package pilula.com.pilula.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import pilula.com.pilula.dto.CriarCheckoutDTO;
import pilula.com.pilula.model.Produto;
import pilula.com.pilula.model.TipoReceita;
import pilula.com.pilula.repository.ProdutoRepository;

class CheckoutServiceTest {

  @Test
  void checkoutExigeTokenDoMercadoPago() {
    var service = new CheckoutService(mock(ProdutoRepository.class), RestClient.builder(), "", "http://localhost:5500");

    var erro = assertThrows(ResponseStatusException.class, () -> service.criarPreferencia(pedido("produto-livre")));

    assertEquals(HttpStatus.SERVICE_UNAVAILABLE, erro.getStatusCode());
  }

  @Test
  void naoIniciaCheckoutDeMedicamentoQueExigeReceita() {
    ProdutoRepository produtos = mock(ProdutoRepository.class);
    Produto produto = new Produto();
    produto.setSlug("medicamento-controlado");
    produto.setReceita(TipoReceita.PRESCRICAO);
    when(produtos.findBySlug("medicamento-controlado")).thenReturn(Optional.of(produto));
    var service = new CheckoutService(
        produtos, RestClient.builder(), "TEST-token", "http://localhost:5500");

    var erro = assertThrows(
        ResponseStatusException.class,
        () -> service.criarPreferencia(pedido("medicamento-controlado")));

    assertEquals(HttpStatus.CONFLICT, erro.getStatusCode());
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
