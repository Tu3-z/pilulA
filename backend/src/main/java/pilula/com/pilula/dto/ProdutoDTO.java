package pilula.com.pilula.dto;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;

import pilula.com.pilula.model.Produto;

/**
 * Produto como a API devolve:
 * - "id" é o número gerado pelo banco e "slug" o código público (vai nos links do site);
 * - categoria e subcategoria vão pelo slug (ex.: "medicamentos"), como no catalogo.json do front;
 * - os enums vão em minúsculas ("livre", "caixa"…).
 */
@Schema(name = "Produto")
public record ProdutoDTO(
    @Schema(description = "id gerado pelo banco", example = "5") Long id,
    @Schema(description = "código público do produto, usado nos links do site", example = "dipirona-gotas-medley") String slug,
    @Schema(description = "slug da categoria", example = "medicamentos") String categoria,
    @Schema(description = "slug da subcategoria", example = "dor-febre") String subcategoria,
    @Schema(example = "Dipirona Gotas 500 mg/mL") String nome,
    @Schema(example = "Medley") String marca,
    @Schema(description = "apresentação", example = "frasco 20 ml") String sub,
    @Schema(example = "8.49") BigDecimal preco,
    @Schema(description = "preço \"de\" (só quando está em oferta)", example = "10.90") BigDecimal precoAntigo,
    @Schema(description = "tipo de receita", allowableValues = {"livre", "prescricao", "retencao"}, example = "livre") String receita,
    @Schema(description = "aparece em \"Em destaque\" na home") boolean destaque,
    @Schema(description = "selo no cartão do produto", example = "-22%") String selo,
    String descricao,
    @Schema(description = "ilustração usada quando não há foto") ArteDTO arte,
    @Schema(description = "caminho ou URL da foto (opcional)", example = "assets/img/produtos/dipirona-gotas-medley.webp") String foto) {

  @Schema(name = "Arte")
  public record ArteDTO(
      @Schema(example = "gotas") String forma,
      @Schema(example = "500") String rotulo) {}

  public static ProdutoDTO de(Produto p) {
    ArteDTO arte = p.getArte() == null || p.getArte().getForma() == null
        ? null
        : new ArteDTO(p.getArte().getForma().name().toLowerCase(), p.getArte().getRotulo());
    return new ProdutoDTO(
        p.getId(),
        p.getSlug(),
        p.getCategoria() == null ? null : p.getCategoria().getSlug(),
        p.getSubcategoria() == null ? null : p.getSubcategoria().getSlug(),
        p.getNome(),
        p.getMarca(),
        p.getSub(),
        p.getPreco(),
        p.getPrecoAntigo(),
        p.getReceita() == null ? null : p.getReceita().name().toLowerCase(),
        p.isDestaque(),
        p.getSelo(),
        p.getDescricao(),
        arte,
        p.getFoto());
  }
}
