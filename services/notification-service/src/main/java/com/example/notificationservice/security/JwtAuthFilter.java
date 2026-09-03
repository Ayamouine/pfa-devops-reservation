package com.example.notificationservice.security;

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

    public JwtAuthFilter(@Value("${jwt.secret}") String secret) {
        this.secret = secret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String method = request.getMethod();
        String path = request.getRequestURI();

        boolean isPreflight = "OPTIONS".equalsIgnoreCase(method);
        boolean isHealth = path.endsWith("/health");

        if (isPreflight || isHealth) {
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

        String tokenUsername = claims.getSubject();
        String tokenRole = String.valueOf(claims.get("role"));

        boolean isFullNotificationList = "GET".equalsIgnoreCase(method) && path.endsWith("/notifications");
        if (isFullNotificationList && !"ADMIN".equalsIgnoreCase(tokenRole)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Admin role required to list all notifications");
            return;
        }

        if (path.contains("/notifications/user/")) {
            String pathUsername = path.substring(path.lastIndexOf('/') + 1);
            if (!pathUsername.equals(tokenUsername) && !"ADMIN".equalsIgnoreCase(tokenRole)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Token does not match the requested username");
                return;
            }
        }

        request.setAttribute("jwtUsername", tokenUsername);
        request.setAttribute("jwtRole", tokenRole);

        filterChain.doFilter(request, response);
    }
}