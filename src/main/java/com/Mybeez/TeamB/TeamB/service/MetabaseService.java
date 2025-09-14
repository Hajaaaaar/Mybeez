package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.model.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
public class MetabaseService {

    @Value("${metabase.site.url}")
    private String metabaseSiteUrl;

    @Value("${metabase.secret.key}")
    private String metabaseSecretKey;

    public String getDashboardUrl(long dashboardId, User user) {
        SecretKey key = Keys.hmacShaKeyFor(metabaseSecretKey.getBytes(StandardCharsets.UTF_8));

        Map<String, Object> payload = new HashMap<>();

        Map<String, Long> resource = new HashMap<>();
        resource.put("dashboard", dashboardId);
        payload.put("resource", resource);

        // For the demo, pass an empty 'params' map to avoid the token error.
        Map<String, Object> params = new HashMap<>();
        // No need to add the host_id parameter for this demo.
        payload.put("params", params);

        long expirationTime = System.currentTimeMillis() + (10 * 60 * 1000);
        payload.put("exp", expirationTime / 1000);

        String token = Jwts.builder()
                .setClaims(payload)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        return metabaseSiteUrl + "/embed/dashboard/" + token + "#bordered=false&titled=false";
    }
}