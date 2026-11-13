package pilula.com.pilula.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CriarCheckoutDTO(
    @NotBlank @Size(max = 150) String nome,
    @NotBlank @Email @Size(max = 254) String email,
    @NotBlank @Pattern(regexp = "\\d{11}") String cpf,
    @NotBlank @Pattern(regexp = "\\d{11}") String celular,
    @NotBlank @Pattern(regexp = "entrega|retirada") String modo,
    @Size(max = 8) String cep,
    @Size(max = 150) String rua,
    @Size(max = 20) String numero,
    @Size(max = 100) String complemento,
    @Size(max = 100) String bairro,
    @Size(max = 150) String cidade,
    @Size(max = 32) String cupom,
    @NotEmpty @Size(max = 50) List<@Valid ItemDTO> itens) {

  public record ItemDTO(
      @NotBlank @Size(max = 80) String slug,
      @Min(1) @Max(99) int quantidade) {}
}
