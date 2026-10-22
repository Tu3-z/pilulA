package pilula.com.pilula.dto;

import java.math.BigDecimal;

import pilula.com.pilula.model.Produto;

/**
 * Produto no mesmo formato do catalogo.json do front-end:
 * categoria e subcategoria viram só o id, e os enums vão em minúsculas ("livre", "caixa"…).
 */
public record ProdutoDTO(
    String id,
    String categoria,
    String subcategoria,
    String nome,
    String marca,
    String sub,
    BigDecimal preco,
    BigDecimal precoAntigo,
    String receita,
    boolean destaque,
    String selo,
    String descricao,
    ArteDTO arte,
    String foto) {

  public record ArteDTO(String forma, String rotulo) {}

  public static ProdutoDTO de(Produto p) {
    ArteDTO arte = p.getArte() == null || p.getArte().getForma() == null
        ? null
        : new ArteDTO(p.getArte().getForma().name().toLowerCase(), p.getArte().getRotulo());
    return new ProdutoDTO(
        p.getId(),
        p.getCategoria() == null ? null : p.getCategoria().getId(),
        p.getSubcategoria() == null ? null : p.getSubcategoria().getId(),
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
