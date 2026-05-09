package com.andrei.springboot.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtSecret;  // Legacy JWT secret Supabase

    private Key getSignKey() {
        // Folosim direct secretul ca bytes UTF-8
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // Extrage toate claims
    public Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Extrage userId (sub)
    public String extractUserId(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Verifică tokenul (expirația + semnătura)
    public boolean isTokenValid(String token) {
        try {
            Claims claims = extractAllClaims(token);
            return claims.getExpiration().after(new Date());
        } catch (Exception e) {
            e.printStackTrace(); // vezi exact eroarea
            return false;
        }
    }

    // DEBUG
    public void printSecret() {
        System.out.println("JWT Secret: " + jwtSecret);
    }
}