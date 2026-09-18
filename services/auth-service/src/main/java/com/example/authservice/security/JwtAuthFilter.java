package com.example.authservice.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final String secret;

    public JwtAuthFilter(@Value("${jwt.secret:my-super-secret-key-for-pfa-application-2026}") String secret) {
        this.secret = secret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();

        boolean isPreflight = "OPTIONS".equalsIgnoreCase(method);
        boolean isPublic = path.endsWith("/health") || path.endsWith("/login") || path.endsWith("/register")
        || path.endsWith("/forgot") || path.endsWith("/reset") || path.endsWith("/verify") || path.endsWith("/refresh")
        || path.contains("/actuator");

        if (isPreflight || isPublic) {
            filterChain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Missing or invalid Authorization header");
            return;
        }

        Claims claims;
        try {
            claims = Jwts.parserBuilder()
                    .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                    .build()
                    .parseClaimsJws(header.substring(7))
                    .getBody();
        } catch (JwtException | IllegalArgumentException e) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid or expired token");
            return;
        }

        String tokenRole = String.valueOf(claims.get("role"));
        boolean isUserManagement = path.startsWith("/auth/users");
        if (isUserManagement && !"ADMIN".equalsIgnoreCase(tokenRole)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin role required");
            return;
        }

        request.setAttribute("jwtUsername", claims.getSubject());
        request.setAttribute("jwtRole", tokenRole);

        filterChain.doFilter(request, response);
    }
}