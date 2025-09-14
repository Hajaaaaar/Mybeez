package com.Mybeez.TeamB.TeamB.payload;

import lombok.Data;

@Data
public class JwtAuthenticationResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String role;

    public JwtAuthenticationResponse(String accessToken, Long id, String email, String firstName, String role) {
        this.accessToken = accessToken;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.role = role;
    }
}
