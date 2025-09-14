package com.Mybeez.TeamB.TeamB.payload;

import com.Mybeez.TeamB.TeamB.model.Conversation;
import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import com.Mybeez.TeamB.TeamB.model.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// Represents both a summary (for the list) and the full detail (for the chat view)
@Data
public class ConversationDTO {
    private Long id;
    private UserSummaryDTO otherParticipant;
    private String lastMessage;
    private LocalDateTime updatedAt;
    private boolean hasUnreadMessages;
    private List<MessageDTO> messages; // This will be null for the summary view

    // Constructor for the conversation list (summary view)
    public ConversationDTO(Conversation conversation, Long currentUserId, boolean hasUnreadMessages, EncryptionService encryptionService) {
        this.id = conversation.getId();
        this.updatedAt = conversation.getUpdatedAt();
        this.hasUnreadMessages = hasUnreadMessages;

        // Find the other person in the chat
        Optional<User> participant = conversation.getParticipants().stream()
                .filter(p -> !p.getId().equals(currentUserId))
                .findFirst();
        participant.ifPresent(user -> this.otherParticipant = new UserSummaryDTO(user));

        // Get a snippet of the last message
        if (conversation.getMessages() != null && !conversation.getMessages().isEmpty()) {
            Message lastMessageEntity = conversation.getMessages().get(conversation.getMessages().size() - 1);
            this.lastMessage = encryptionService.decrypt(lastMessageEntity.getContent());
        }
    }
    // Modify this constructor to accept and use the EncryptionService
    public ConversationDTO(Conversation conversation, EncryptionService encryptionService) {
        this.id = conversation.getId();
        // Pass the service to the MessageDTO constructor
        this.messages = conversation.getMessages().stream()
                .map(message -> new MessageDTO(message, encryptionService))
                .collect(Collectors.toList());
    }
}
