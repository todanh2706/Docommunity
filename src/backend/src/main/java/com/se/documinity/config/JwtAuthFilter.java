package com.se.documinity.config;

import com.se.documinity.service.JwtService; // Assuming you named it JwtService
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor; // Add Lombok annotation for cleaner constructor
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component; // Mark as a Spring bean
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor // Automatically creates constructor for final fields
public class JwtAuthFilter extends OncePerRequestFilter {

    // NOTE: Renamed JwtUtil to JwtService for consistency with previous guidance
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        String username = null;

        // 1. Check if the request has a valid token format
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            // 2. Extract the username from the token
            username = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            // Log the error but continue the filter chain
            logger.warn("JWT processing error: " + e.getMessage());
        }

        // 3. If username is found and the user is not already authenticated
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            try {
                // 4. Load the user details (username, hashed password, authorities)
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

                // 5. Validate the token against the loaded user details
                if (jwtService.validateToken(jwt, userDetails)) {

                    // 6. Create an authentication token
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

                    // Add details about the request (optional but good practice)
                    authToken.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // 7. Store the user in the Security Context: This tells Spring "This user is
                    // logged in!"
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                // If user not found or other errors, we just ignore this token
                // and let the request proceed as unauthenticated.
                logger.warn("Cannot set user authentication: " + e.getMessage());
            }
        }

        // 8. Continue the filter chain
        filterChain.doFilter(request, response);
    }
};