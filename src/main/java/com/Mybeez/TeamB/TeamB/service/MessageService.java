package com.Mybeez.TeamB.TeamB.service;

import com.Mybeez.TeamB.TeamB.exception.UnauthorizedException;
import com.Mybeez.TeamB.TeamB.model.Conversation;
import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ConversationDTO;
import com.Mybeez.TeamB.TeamB.payload.MessageRequest;
import com.Mybeez.TeamB.TeamB.repository.ConversationRepository;
import com.Mybeez.TeamB.TeamB.repository.MessageRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.Mybeez.TeamB.TeamB.exception.InvalidMessageContentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ContentValidationService contentValidationService;
    @Autowired
    private EncryptionService encryptionService;

    @Transactional
    public Message sendMessage(MessageRequest messageRequest, Long senderId) {
        // Validation check
        if (contentValidationService.isContentInvalid(messageRequest.getContent())) {
            throw new InvalidMessageContentException("Message contains inappropriate or unsafe content.");
        }
        // Find the sender and recipient users from DB
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("Sender not found with id: " + senderId));
        User recipient = userRepository.findById(messageRequest.getRecipientId())
                .orElseThrow(() -> new EntityNotFoundException("Recipient not found with id: " + messageRequest.getRecipientId()));

        // Look for an existing conversation between these 2 users
        Conversation conversation = conversationRepository.findConversationBetweenUsers(senderId, recipient.getId())
                .orElseGet(() -> {
                    Conversation newConversation = new Conversation();
                    newConversation.setParticipants(new HashSet<>(Set.of(sender, recipient)));
                    return conversationRepository.save(newConversation);
                });
        conversation.setUpdatedAt(LocalDateTime.now());

        // Encrypt the content before building the message
        String encryptedContent = encryptionService.encrypt(messageRequest.getContent());

        Message message = Message.builder()
                .conversation(conversation)
                .sender(sender)
                .content(encryptedContent)
                .isRead(false) // Set new messages as unread
                .build();

        return messageRepository.save(message);
    }

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversationsForUser(Long userId) {
        List<Conversation> conversations = conversationRepository.findByParticipantIdOrderByUpdatedAtDesc(userId);
        return conversations.stream()
                .map(conversation -> {
                    // For each conversation, check if it has unread messages
                    boolean hasUnread = messageRepository.existsByConversationIdAndSenderIdNotAndIsReadFalse(conversation.getId(), userId);
                    return new ConversationDTO(conversation, userId, hasUnread, encryptionService);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDTO getConversationById(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new EntityNotFoundException("Conversation not found"));

        // Security check: Make sure the current user is actually part of this conversation
        boolean isParticipant = conversation.getParticipants().stream().anyMatch(p -> p.getId().equals(userId));
        if (!isParticipant) {
            throw new UnauthorizedException("User is not authorized to view this conversation.");
        }

        // When a user views a conversation, mark all messages sent by others as "read"
        messageRepository.markMessagesAsReadInConversation(conversationId, userId);

        return new ConversationDTO(conversation, encryptionService);
    }

    /**
     * Gets the count of all unread messages for a specific user
     * @param userId The ID of the user.
     * @return The total number of unread messages.
     */
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadMessagesForUser(userId);
    }

    /**
     * Marks all messages in a conversation as read for the given user.
     * It iterates through messages and sets isRead to true if the message was
     * sent by someone else.
     * @param conversation The conversation object.
     * @param userId The ID of the user viewing the conversation.
     */
    private void markMessagesAsRead(Conversation conversation, Long userId) {
        List<Message> messagesToUpdate = conversation.getMessages().stream()
                .filter(message -> !message.isRead() && !message.getSender().getId().equals(userId))
                .collect(Collectors.toList());

        if (!messagesToUpdate.isEmpty()) {
            for (Message message : messagesToUpdate) {
                message.setRead(true);
            }
            messageRepository.saveAll(messagesToUpdate);
        }
    }
}
