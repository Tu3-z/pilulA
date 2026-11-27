package pilula.com.pilula.service;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * ==============================================================================
 * SERVIÇO CRIPTOGRÁFICO: JwtService (jjwt library)
 * ==============================================================================
 * Responsável pela emissão, assinatura digital e validação dos tokens JWT.
 * 
 * PONTOS-CHAVE PARA A APRESENTAÇÃO:
 * 1. Estrutura de um Token JWT:
 *    - Header: Algoritmo de assinatura (HMAC SHA-256).
 *    - Payload (Claims): Dados de identificação (e-mail do usuário como subject,
 *      data de emissão 'iat' e data de expiração 'exp').
 *    - Signature: Assinatura criptográfica calculada com a chave secreta privada do backend.
 * 
 * 2. Segurança da Chave Secreta (SecretKey):
 *    - A biblioteca JJWT exige uma chave com entropia mínima de 256 bits (32 caracteres UTF-8).
 *    - Sem a chave secreta do servidor, ninguém consegue falsificar ou adulterar o token.
 * 
 * 3. Validade / Expiração:
 *    - O token possui tempo de vida delimitado (padrão de 24 horas = 86.400.000 ms).
 *    - Quando expira, o parser rejeita automaticamente com ExpiredJwtException.
 */
@Service
public class JwtService {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiracao-ms:86400000}") long expiracaoMs) {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            // Garante conformidade de segurança criptográfica
            throw new IllegalStateException(
                "JWT_SECRET precisa ter pelo menos 32 caracteres (tem " + bytes.length
                + "). Coloque uma chave aleatória no backend/.env; veja o .env.example.");
        }
        // Gera chave HMAC segura a partir dos bytes da senha secreta
        this.chave = Keys.hmacShaKeyFor(bytes);
        this.expiracaoMs = expiracaoMs;
    }

    /**
     * Gera um token assinado digitalmente contendo o e-mail do usuário no subject.
     * Retorna a string compactada em Base64URL no padrão 'header.payload.signature'.
     */
    public String gerar(String email) {
        Date agora = new Date();
        Date expiracao = new Date(agora.getTime() + expiracaoMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(agora)
                .expiration(expiracao)
                .signWith(chave)
                .compact();
    }

    /**
     * Extrai o e-mail (subject) do token decodificado e verifica a assinatura.
     * Lança exceção caso a assinatura seja inválida ou o token tenha expirado.
     */
    public String extrairEmail(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Verifica rapidamente se um token é estruturalmente válido, autêntico e não expirado.
     * Retorna true em caso de sucesso e false se houver adulteração ou expiração.
     */
    public boolean valido(String token) {
        try {
            extrairEmail(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}