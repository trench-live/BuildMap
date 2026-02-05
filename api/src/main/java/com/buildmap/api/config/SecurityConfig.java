package com.buildmap.api.config;

import com.buildmap.api.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtService jwtService;

    @Value("${cors.allowed-origins:}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtService);

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/fulcrum/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/floor/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/navigation/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/navigation/path").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .csrf(csrf -> csrf.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        String originSource = allowedOrigins == null ? "" : allowedOrigins.trim();
        if (originSource.isEmpty()) {
            originSource = String.join(",",
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                    "https://buildmap.ru",
                    "https://www.buildmap.ru",
                    "https://admin.buildmap.ru",
                    "https://api.buildmap.ru",
                    "https://*.loca.lt",
                    "http://*.loca.lt"
            );
        }
        List<String> originPatterns = Arrays.stream(originSource.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .collect(Collectors.toList());
        configuration.setAllowedOriginPatterns(originPatterns);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
