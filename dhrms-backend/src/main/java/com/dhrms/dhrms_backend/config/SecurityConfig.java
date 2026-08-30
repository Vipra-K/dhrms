package com.dhrms.dhrms_backend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.dhrms.dhrms_backend.security.CustomUserDetailsService;
import com.dhrms.dhrms_backend.security.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        private final CustomUserDetailsService userDetailsService;

        private final PasswordEncoder passwordEncoder;

        @Bean
        public SecurityFilterChain securityFilterChain(
                        HttpSecurity http) throws Exception {

                http
                                .csrf(csrf -> csrf.disable())

                                .cors(cors -> cors.configurationSource(
                                                corsConfigurationSource()))

                                .sessionManagement(session -> session.sessionCreationPolicy(
                                                SessionCreationPolicy.STATELESS))

                                .authenticationProvider(
                                                authenticationProvider())

                                .authorizeHttpRequests(auth -> auth

                                                // ==========================================
                                                // PUBLIC ENDPOINTS
                                                // ==========================================

                                                .requestMatchers(
                                                                "/api/auth/**",
                                                                "/swagger-ui/**",
                                                                "/swagger-ui.html",
                                                                "/v3/api-docs/**",
                                                                "/actuator/health")
                                                .permitAll()

                                                // Hospital registration
                                                .requestMatchers(
                                                                HttpMethod.POST,
                                                                "/api/hospitals/register")
                                                .permitAll()

                                                // ==========================================
                                                // HOSPITAL
                                                // ==========================================

                                                .requestMatchers(
                                                                "/api/hospitals/**")
                                                .hasRole("HOSPITAL")

                                                // ==========================================
                                                // DOCTOR
                                                // ==========================================

                                                .requestMatchers(
                                                                "/api/doctors/**")
                                                .hasRole("DOCTOR")

                                                // ==========================================
                                                // WORKER
                                                // ==========================================

                                                .requestMatchers(
                                                                "/api/workers/me/**")
                                                .hasRole("WORKER")

                                                // ==========================================
                                                // EVERYTHING ELSE
                                                // ==========================================

                                                .anyRequest()
                                                .authenticated())

                                .addFilterBefore(
                                                jwtAuthenticationFilter,
                                                UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        // ==========================================================
        // AUTHENTICATION PROVIDER
        // ==========================================================

        @Bean
        public DaoAuthenticationProvider authenticationProvider() {

                DaoAuthenticationProvider provider = new DaoAuthenticationProvider();

                provider.setUserDetailsService(
                                userDetailsService);

                provider.setPasswordEncoder(
                                passwordEncoder);

                return provider;
        }

        // ==========================================================
        // AUTHENTICATION MANAGER
        // ==========================================================

        @Bean
        public AuthenticationManager authenticationManager(
                        AuthenticationConfiguration configuration)
                        throws Exception {

                return configuration.getAuthenticationManager();
        }

        // ==========================================================
        // CORS
        // ==========================================================

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {

                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(
                                List.of(
                                                "http://localhost:5173",
                                                "http://localhost:3000"));

                configuration.setAllowedMethods(
                                List.of(
                                                "GET",
                                                "POST",
                                                "PUT",
                                                "PATCH",
                                                "DELETE",
                                                "OPTIONS"));

                configuration.setAllowedHeaders(
                                List.of("*"));

                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

                source.registerCorsConfiguration(
                                "/**",
                                configuration);

                return source;
        }
}