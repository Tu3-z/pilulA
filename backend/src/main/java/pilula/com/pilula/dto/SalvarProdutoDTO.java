package pilula.com.pilula.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record SalvarProdutoDTO(
    @NotBlank @Size(max = 80) @Pattern(regexp = "[a-z0-9]+(?:-[a-z0-9]+)*") String slug,
    @NotBlank @Size(max = 150) String nome,
    @NotBlank @Size(max = 100) String marca,
    @Size(max = 100) String sub,
    @NotBlank @Size(max = 50) String categoria,
    @Size(max = 50) String subcategoria,
    @NotNull @DecimalMin("0.01") BigDecimal preco,
    @DecimalMin("0.01") BigDecimal precoAntigo,
    @NotBlank @Pattern(regexp = "livre|prescricao|retencao") String receita,
    boolean destaque,
    @Size(max = 30) String selo,
    @Size(max = 500) String descricao,
    @Pattern(regexp = "^(|frasco|pump|bisnaga|capsula|blister|caixa|kit|escova|termometro|bastao|pacote|gotas|spray|pote|aparelho|fralda)$") String forma,
    @Size(max = 40) String rotulo,
    @Size(max = 255) @Pattern(regexp = "^(|https://[^\\s\"'<>]+|assets/img/produtos/[a-zA-Z0-9._/-]+)$") String foto,
    @PositiveOrZero Integer ordem) {}
