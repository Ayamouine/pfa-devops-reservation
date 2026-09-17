package com.example.bookingservice.security;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;

import org.junit.jupiter.api.Test;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

class ServiceTokenProviderTest {

    private static final String SECRET = "my-super-secret-key-for-pfa-application-2026";

    @Test
    void token_isSignedWithSharedSecretAndCarriesServiceRole() {
        ServiceTokenProvider provider = new ServiceTokenProvider(SECRET);

        String token = provider.token();

        Claims claims = Jwts.parserBuilder()
                .setSigningKey(Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8)))
                .build()
                .parseClaimsJws(token)
                .getBody();

        assertThat(claims.getSubject()).isEqualTo("booking-service");
        assertThat(claims.get("role")).isEqualTo("SERVICE");
        assertThat(claims.getExpiration()).isAfter(new java.util.Date());
    }
}
