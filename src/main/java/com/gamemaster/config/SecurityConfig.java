package com.gamemaster.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/", "/index.html", "/css/**", "/js/**", "/h2-console/**", "/favicon.ico").permitAll()
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/presenca").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/jogos").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/eventos/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/fotos").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/notas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/fotos").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/notas").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/dashboard/stats").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/usuarios").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/jogos").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/jogos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/ludopedia/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/ludopedia/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/eventos/**").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/v1/eventos/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/v1/eventos/**").permitAll()
                .anyRequest().permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .defaultSuccessUrl("/#acervo?auth=google_sucesso", true)
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public org.springframework.web.filter.ForwardedHeaderFilter forwardedHeaderFilter() {
        return new org.springframework.web.filter.ForwardedHeaderFilter();
    }
}
