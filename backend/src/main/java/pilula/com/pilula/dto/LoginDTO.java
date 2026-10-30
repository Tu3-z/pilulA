package pilula.com.pilula.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Dados que o front manda no POST /api/auth/entrar */
public record LoginDTO(
    @NotBlank @Email String email,
    @NotBlank String senha
) {}