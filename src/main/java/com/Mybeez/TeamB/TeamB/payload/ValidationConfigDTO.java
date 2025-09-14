package com.Mybeez.TeamB.TeamB.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidationConfigDTO {
    private List<String> bannedWords;
    private String emailRegex;
    private String phoneRegex;
}