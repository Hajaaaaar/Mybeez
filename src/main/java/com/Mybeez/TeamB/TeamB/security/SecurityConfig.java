package com.Mybeez.TeamB.TeamB.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@Profile("!test")
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // We keep this annotation for production builds
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // 1. Allow all OPTIONS requests for CORS pre-flight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 2. Permit access to static resources
                        .requestMatchers(
                                "/", "/index.html", "/favicon.ico", "/static/**",
                                "/*.js", "/*.css", "/*.png", "/error", "/images/**"
                        ).permitAll()

                        // 3. Permit access to all combined public API endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/experiences/**",
                                "/api/coupons/**",
                                "/api/search/**",
                                "/api/availability/**",
                                "/api/host-onboarding/**",
                                "/api/stripe-webhook",
                                "/api/metabase/**",
                                "/api/config/validation",
                                "/api/test/**" // Added from your first snippet
                        ).permitAll()

                        // 4. Specific rules for Reviews endpoint
                        .requestMatchers(HttpMethod.GET,  "/api/reviews/**").permitAll()
                        // As requested, POST is public. Consider changing to .authenticated() for security.
                        .requestMatchers(HttpMethod.POST, "/api/reviews", "/api/reviews/**").permitAll()

                        // 5. Role-based security for ADMIN and HOST
                        .requestMatchers("/api/admin/**", "/api/check/**").hasRole("ADMIN")
                        .requestMatchers("/api/calendar/**").hasRole("HOST") // Using more specific path from snippet
                        .requestMatchers("/api/wishlist/**", "/api/messages/**").authenticated()

                        // 6. Any other request requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // --- TEMPORARY: Allow localhost origins for local development
        configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:3030"));
        // --- For production, uncomment the line below instead
        // configuration.setAllowedOrigins(List.of(allowedOrigins));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}