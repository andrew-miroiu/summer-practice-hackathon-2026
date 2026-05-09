package com.andrei.springboot.security;

import com.andrei.springboot.service.JwtService;
import com.andrei.springboot.repository.ProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ProfileRepository profileRepository;

    public JwtAuthenticationFilter(JwtService jwtService, ProfileRepository profileRepository) {
        this.jwtService = jwtService;
        this.profileRepository = profileRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            System.out.println("JWT Secret: " + jwtService); // vezi secretul în consolă
            System.out.println("JWT Token: " + token);

            if (jwtService.isTokenValid(token)) {
                String userId = jwtService.extractUserId(token);

                var profile = profileRepository.findById(UUID.fromString(userId))
                        .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                CustomUserDetails userDetails = new CustomUserDetails(profile.getId(), profile.getUsername());
                System.out.println(userDetails.getId() + userDetails.getUsername());
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }
}