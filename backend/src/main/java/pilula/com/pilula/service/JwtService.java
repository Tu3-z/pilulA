package pilula.com.pilula.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Gera e valida tokens JWT. */
@Service
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiracao-ms:86400000}") long expiracaoMs) {
        this.chave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMs = expiracaoMs;
    }

    /** Gera um token com o e-mail do usuário como "subject". */
    public String gerar(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiracaoMs))
                .signWith(chave)
                .compact();
    }

    /** Extrai o e-mail de um token válido. Lança exceção se inválido ou expirado. */
    public String extrairEmail(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /** Retorna true se o token for válido e não estiver expirado. */
    public boolean valido(String token) {
        try {
            extrairEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}