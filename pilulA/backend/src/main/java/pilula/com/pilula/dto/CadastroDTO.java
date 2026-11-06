package pilula.com.pilula.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados que o front manda no POST /api/auth/cadastrar */
public record CadastroDTO(
    @NotBlank String nome,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 8) String senha,
    String cpf,
    String celular
) {}