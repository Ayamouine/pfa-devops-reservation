package com.example.bookingservice.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Component
public class ServiceTokenProvider {

    private static final long TTL_MILLIS = 300_000L;

    private final byte[] key;

    public ServiceTokenProvider(@Value("${jwt.secret}") String secret) {
        this.key = secret.getBytes(StandardCharsets.UTF_8);
    }

    public String token() {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject("booking-service")
                .claim("role", "SERVICE")
                .claim("filiere", "")
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + TTL_MILLIS))
                .signWith(Keys.hmacShaKeyFor(key), SignatureAlgorithm.HS256)
                .compact();
    }
}
