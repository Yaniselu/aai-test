package ro.academiaionandrei.api.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import ro.academiaionandrei.api.entity.User;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/** Emiterea si validarea token-urilor JWT. */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final String issuer;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.jwt.issuer:academia-ion-andrei}") String issuer) {

        // HS256 cere minimum 256 de biti. Oprim pornirea daca secretul e prea slab,
        // ca sa nu ajunga in productie o configuratie nesigura.
        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret trebuie sa aiba cel putin 32 de caractere (256 de biti).");
        }

        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationMs = expirationMs;
        this.issuer = issuer;
    }

    public String generateToken(User user) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        // Claim-urile se adauga individual: `.claims(Map)` inlocuieste intreaga
        // harta si ar sterge subject/issuer setate mai sus.
        return Jwts.builder()
                .subject(user.getEmail())
                .issuer(issuer)
                .issuedAt(now)
                .expiration(expiry)
                .claim("uid", user.getId())
                .claim("role", user.getRole().name())
                .claim("approved", user.isApproved())
                .signWith(key)
                .compact();
    }

    public String extractEmail(String token) {
        return parse(token).getSubject();
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer(issuer)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
