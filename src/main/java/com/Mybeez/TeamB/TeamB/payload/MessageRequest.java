package com.Mybeez.TeamB.TeamB.payload;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MessageRequest {

    @NotNull
    private Long recipientId;

    @NotBlank
    private String content;
}
