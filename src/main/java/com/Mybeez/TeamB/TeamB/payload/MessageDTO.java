package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import lombok.Data;
import java.time.LocalDateTime;

// Represents a single message within a conversation thread
@Data
public class MessageDTO {
    private Long id;
    private Long senderId;
    private String content;
    private LocalDateTime timestamp;

    // Constructor that accepts the EncryptionService
    public MessageDTO(Message message, EncryptionService encryptionService) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.content = encryptionService.decrypt(message.getContent()); // Decrypt here
        this.timestamp = message.getTimestamp();
    }
    public MessageDTO(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.content = message.getContent();
        this.timestamp = message.getTimestamp();
    }
}