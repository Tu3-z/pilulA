package pilula.com.pilula.dto;

import jakarta.validation.constraints.NotNull;
import pilula.com.pilula.model.Perfil;

public record PerfilDTO(@NotNull Perfil perfil) {}
