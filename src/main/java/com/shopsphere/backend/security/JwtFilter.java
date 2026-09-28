package com.shopsphere.backend.security;

import com.shopsphere.backend.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.util.Collections;
import java.io.IOException;

@Component
public class JwtFilter
        extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader =
                request.getHeader(
                        "Authorization");

        if (authHeader != null &&
                authHeader.startsWith(
                        "Bearer ")) {

            String token =
                    authHeader.substring(7);

            try {

    String email =
            jwtService.extractEmail(token);

    UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.emptyList()
            );

    SecurityContextHolder.getContext()
            .setAuthentication(authToken);

} catch (Exception e) {

    response.setStatus(401);

    return;
}
                        }
                        }
                        }