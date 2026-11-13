package pilula.com.pilula.dto;

import java.math.BigDecimal;

public record CheckoutCriadoDTO(String pedido, String checkoutUrl, BigDecimal total) {}
