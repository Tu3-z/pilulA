package pilula.com.pilula.config;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Respostas de erro amigáveis para o front.
 * Ex.: cadastro com e-mail inválido →
 *   400 { "mensagem": "Dados inválidos", "erros": { "email": "deve ser um endereço de e-mail bem formado" } }
 */
@RestControllerAdvice
public class TratadorDeErros {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> validacao(MethodArgumentNotValidException ex) {
    Map<String, String> erros = new LinkedHashMap<>();
    ex.getBindingResult().getFieldErrors()
        .forEach(e -> erros.putIfAbsent(e.getField(), e.getDefaultMessage()));
    return ResponseEntity.badRequest().body(Map.of("mensagem", "Dados inválidos", "erros", erros));
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<Map<String, Object>> corpoInvalido(HttpMessageNotReadableException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("mensagem", "JSON inválido ou ausente no corpo da requisição"));
  }
}
