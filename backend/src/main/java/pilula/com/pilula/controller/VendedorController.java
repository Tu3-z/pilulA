package pilula.com.pilula.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import pilula.com.pilula.dto.ProdutoDTO;
import pilula.com.pilula.dto.SalvarProdutoDTO;
import pilula.com.pilula.service.VendedorService;

@RestController
@RequestMapping("/api/vendedor/produtos")
@Tag(name = "Vendedor", description = "Gerenciamento do catálogo por vendedores e administradores")
@SecurityRequirement(name = "bearer")
public class VendedorController {

  private final VendedorService service;

  public VendedorController(VendedorService service) {
    this.service = service;
  }

  @GetMapping
  @Operation(summary = "Lista produtos para gerenciamento")
  public List<ProdutoDTO> listar() {
    return service.listar();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @Operation(summary = "Cadastra produto")
  public ProdutoDTO criar(@Valid @RequestBody SalvarProdutoDTO dados) {
    return service.criar(dados);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Atualiza produto")
  public ProdutoDTO atualizar(@PathVariable Long id, @Valid @RequestBody SalvarProdutoDTO dados) {
    return service.atualizar(id, dados);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @Operation(summary = "Remove produto")
  public void remover(@PathVariable Long id) {
    service.remover(id);
  }
}
