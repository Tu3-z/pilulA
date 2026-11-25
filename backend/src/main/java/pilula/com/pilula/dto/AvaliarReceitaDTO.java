package pilula.com.pilula.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * DTO para a ação de aprovar ou rejeitar uma receita médica.
 */
public record AvaliarReceitaDTO(
    @NotBlank(message = "O status da receita é obrigatório.")
    @Pattern(regexp = "APROVADA|REJEITADA", message = "Status deve ser APROVADA ou REJEITADA.")
    String status,

    String obs
) {}
