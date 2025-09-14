package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.exception.InvalidMessageContentException;
import com.Mybeez.TeamB.TeamB.exception.UnauthorizedException;
import com.Mybeez.TeamB.TeamB.model.Conversation;
import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ConversationDTO;
import com.Mybeez.TeamB.TeamB.payload.MessageRequest;
import com.Mybeez.TeamB.TeamB.repository.ConversationRepository;
import com.Mybeez.TeamB.TeamB.repository.MessageRepository;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import com.Mybeez.TeamB.TeamB.service.ContentValidationService;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import com.Mybeez.TeamB.TeamB.service.MessageService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;
import static org.mockito.Mockito.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;
    @Mock
    private ConversationRepository conversationRepository;
    @Mock
    private UserRepository userRepository;

    @Mock
    private ContentValidationService contentValidationService;

    @Mock private EncryptionService encryptionService;

    @InjectMocks
    private MessageService messageService;

    @Test
    void sendMessage_shouldCreateNewConversation_ifOneDoesNotExist() {
        // Arrange
        Long senderId = 1L;
        Long recipientId = 2L;
        User sender = User.builder().id(senderId).build();
        User recipient = User.builder().id(recipientId).build();
        MessageRequest request = new MessageRequest();
        request.setRecipientId(recipientId);
        request.setContent("This is a test message");

        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findById(recipientId)).thenReturn(Optional.of(recipient));
        // Simulate that no conversation exists between them
        when(conversationRepository.findConversationBetweenUsers(senderId, recipientId)).thenReturn(Optional.empty());
        // When a new conversation is saved, return it
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        messageService.sendMessage(request, senderId);

        // Assert
        // Verify that we tried to save a NEW conversation
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    void sendMessage_shouldUpdateTimestamp_onExistingConversation() {
        // Arrange
        Long senderId = 1L;
        Long recipientId = 2L;
        User sender = User.builder().id(senderId).build();
        User recipient = User.builder().id(recipientId).build();
        MessageRequest request = new MessageRequest();
        request.setRecipientId(recipientId);
        request.setContent("Another test message");

        Conversation existingConversation = Conversation.builder()
                .id(100L)
                .updatedAt(LocalDateTime.now().minusDays(1)) // Old timestamp
                .build();

        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findById(recipientId)).thenReturn(Optional.of(recipient));
        // Simulate that a conversation ALREADY exists
        when(conversationRepository.findConversationBetweenUsers(senderId, recipientId)).thenReturn(Optional.of(existingConversation));

        // Act
        messageService.sendMessage(request, senderId);

        // Assert
        ArgumentCaptor<Conversation> conversationCaptor = ArgumentCaptor.forClass(Conversation.class);
        // Now check that the timestamp was actually updated
        assertEquals(true, existingConversation.getUpdatedAt().isAfter(LocalDateTime.now().minusMinutes(1)));
    }

    // --- TESTS FOR VIEWING CONVERSATIONS AND MESSAGES ---

    private User user1;
    private User user2;
    private User user3;

    @BeforeEach
    void setUp() {
        user1 = User.builder().id(1L).firstName("Alex").build();
        user2 = User.builder().id(2L).firstName("Beth").build();
        user3 = User.builder().id(3L).firstName("Charlie").build();
    }

    @Test
    void getConversationsForUser_shouldReturnCorrectDTOs() {
        // ARRANGE
        // The Message entities should contain the placeholder ENCRYPTED strings
        Message lastMessage1 = Message.builder().content("encrypted_hello_beth").build();
        Conversation convo1 = Conversation.builder()
                .id(101L)
                .participants(new HashSet<>(Set.of(user1, user2)))
                .messages(List.of(lastMessage1))
                .build();

        Message lastMessage2 = Message.builder().content("encrypted_hi_charlie").build();
        Conversation convo2 = Conversation.builder()
                .id(102L)
                .participants(new HashSet<>(Set.of(user1, user3)))
                .messages(List.of(lastMessage2))
                .build();

        List<Conversation> user1Conversations = Arrays.asList(convo1, convo2);
        when(conversationRepository.findByParticipantIdOrderByUpdatedAtDesc(user1.getId())).thenReturn(user1Conversations);

        // Mock the decryption call for each message
        when(encryptionService.decrypt("encrypted_hello_beth")).thenReturn("Hello Beth");
        when(encryptionService.decrypt("encrypted_hi_charlie")).thenReturn("Hi Charlie");

        // ACT
        List<ConversationDTO> resultDTOs = messageService.getConversationsForUser(user1.getId());

        // ASSERT
        assertEquals(2, resultDTOs.size());
        ConversationDTO dto1 = resultDTOs.stream().filter(d -> d.getId().equals(101L)).findFirst().get();
        assertEquals("Hello Beth", dto1.getLastMessage()); // Assert against decrypted text
        assertEquals(user2.getId(), dto1.getOtherParticipant().getId());
        assertEquals(user2.getFirstName(), dto1.getOtherParticipant().getFirstName());
    }

    @Test
    void getConversationById_shouldReturnConversation_whenUserIsParticipant() {
        // ARRANGE
        Conversation conversation = Conversation.builder()
                .id(200L)
                .participants(new HashSet<>(Set.of(user1, user2)))
                .messages(List.of(
                        Message.builder().sender(user1).content("encrypted_msg_1").timestamp(LocalDateTime.now()).build(),
                        Message.builder().sender(user2).content("encrypted_msg_2").timestamp(LocalDateTime.now()).build()
                ))
                .build();
        when(conversationRepository.findById(200L)).thenReturn(Optional.of(conversation));

        // Mock the decryption call for each message
        when(encryptionService.decrypt("encrypted_msg_1")).thenReturn("Test message 1");
        when(encryptionService.decrypt("encrypted_msg_2")).thenReturn("Test message 2");

        // ACT
        ConversationDTO result = messageService.getConversationById(200L, user1.getId());

        // ASSERT
        assertNotNull(result);
        assertEquals(2, result.getMessages().size());
        assertEquals("Test message 1", result.getMessages().get(0).getContent()); // Assert against decrypted text
    }

    @Test
    void getConversationById_shouldThrowUnauthorizedException_whenUserIsNotParticipant() {
        // ARRANGE
        // Setup a conversation that does NOT include user3
        Conversation conversation = Conversation.builder()
                .id(201L)
                .participants(new HashSet<>(Set.of(user1, user2)))
                .build();

        when(conversationRepository.findById(201L)).thenReturn(Optional.of(conversation));

        // ACT , ASSERT
        // Verify that a exception is thrown when user3 (a non-participant) tries to access it
        assertThrows(UnauthorizedException.class, () -> {
            messageService.getConversationById(201L, user3.getId());
        }, "Should throw UnauthorizedException for non-participant access");
    }

    @Test
    void getConversationById_shouldThrowEntityNotFoundException_forInvalidId() {
        // ARRANGE
        // Mock the repository to return nothing for a specific ID
        Long nonExistentId = 999L;
        when(conversationRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        // ACT, ASSERT
        // Verify an exception is thrown for a non-existent conversation
        assertThrows(EntityNotFoundException.class, () -> {
            messageService.getConversationById(nonExistentId, user1.getId());
        }, "Should throw EntityNotFoundException when conversation does not exist");
    }

    // Verifies that the `hasUnreadMessages` flag is correctly set on the DTOs
    @Test
    void getConversationsForUser_shouldCorrectlySetHasUnreadMessagesFlag() {
        // ARRANGE
        // Convo 1 has unread messages, Convo 2 does not
        Conversation convoWithUnread = Conversation.builder().id(101L).participants(new HashSet<>(Set.of(user1, user2))).messages(List.of(Message.builder().content("unread").build())).build();
        Conversation convoWithoutUnread = Conversation.builder().id(102L).participants(new HashSet<>(Set.of(user1, user3))).messages(List.of(Message.builder().content("read").build())).build();
        List<Conversation> conversations = Arrays.asList(convoWithUnread, convoWithoutUnread);

        when(conversationRepository.findByParticipantIdOrderByUpdatedAtDesc(user1.getId())).thenReturn(conversations);

        // Mock the repository check for each conversation
        when(messageRepository.existsByConversationIdAndSenderIdNotAndIsReadFalse(101L, user1.getId())).thenReturn(true);
        when(messageRepository.existsByConversationIdAndSenderIdNotAndIsReadFalse(102L, user1.getId())).thenReturn(false);
        // Mock decrypt even for this test, as the DTO constructor requires it
        when(encryptionService.decrypt(anyString())).thenReturn("some decrypted message");

        // ACT
        List<ConversationDTO> resultDTOs = messageService.getConversationsForUser(user1.getId());

        // ASSERT
        assertEquals(2, resultDTOs.size(), "Should return two DTOs");

        ConversationDTO unreadDto = resultDTOs.stream().filter(dto -> dto.getId().equals(101L)).findFirst().orElseThrow();
        assertTrue(unreadDto.isHasUnreadMessages(), "Conversation 101 should be marked as unread");

        ConversationDTO readDto = resultDTOs.stream().filter(dto -> dto.getId().equals(102L)).findFirst().orElseThrow();
        assertFalse(readDto.isHasUnreadMessages(), "Conversation 102 should be marked as read");
    }


    // Verifies the important side-effect that when a user gets messages for a
    // conversation, the messages are marked as read in the database
    @Test
    void getConversationById_shouldMarkMessagesAsRead() {
        // ARRANGE
        Long conversationId = 200L;
        Long currentUserId = user1.getId();
        Conversation conversation = Conversation.builder().id(conversationId).participants(new HashSet<>(Set.of(user1, user2))).messages(new ArrayList<>()).build();

        when(conversationRepository.findById(conversationId)).thenReturn(Optional.of(conversation));

        // ACT
        messageService.getConversationById(conversationId, currentUserId);

        // ASSERT
        // Verify that the repository method to mark messages as read was called exactly once with the correct parameters
        verify(messageRepository, times(1)).markMessagesAsReadInConversation(conversationId, currentUserId);
    }


    // A test to ensure the unread count method is wired correctly to the repository
    @Test
    void getUnreadMessageCount_shouldReturnCountFromRepository() {
        // ARRANGE
        Long currentUserId = user1.getId();
        long expectedCount = 5L;
        when(messageRepository.countUnreadMessagesForUser(currentUserId)).thenReturn(expectedCount);

        // ACT
        long actualCount = messageService.getUnreadMessageCount(currentUserId);

        // ASSERT
        assertEquals(expectedCount, actualCount, "The count from the service should match the count from the repository");
    }


    // Verifies that the sendMessage method blocks messages with invalid content
    @Test
    void sendMessage_shouldThrowException_whenContentIsInvalid() {
        // ARRANGE
        Long senderId = 1L;
        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent("This message contains profanity1 and is invalid.");

        // Mock the validation service to return true (invalid) for any string
        when(contentValidationService.isContentInvalid(anyString())).thenReturn(true);

        // ACT, ASSERT
        // Verify that calling sendMessage throws our custom exception
        assertThrows(InvalidMessageContentException.class, () -> {
            messageService.sendMessage(request, senderId);
        }, "Should throw InvalidMessageContentException for invalid content");

        // Verify that the repository save method was NEVER called, ensuring no invalid data is saved
        verify(messageRepository, never()).save(any(Message.class));
    }

    // Verifies that the message content is encrypted before it's saved
    @Test
    void sendMessage_shouldEncryptContent_beforeSaving() {
        // ARRANGE
        Long senderId = 1L;
        String plainTextMessage = "This is a secret message.";
        String encryptedMessage = "v1:encrypted:text"; // A fake encrypted string

        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent(plainTextMessage);

        User sender = User.builder().id(senderId).build();
        User recipient = User.builder().id(2L).build();

        when(userRepository.findById(senderId)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(conversationRepository.findConversationBetweenUsers(anyLong(), anyLong())).thenReturn(Optional.empty());
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(inv -> inv.getArgument(0));
        when(contentValidationService.isContentInvalid(anyString())).thenReturn(false);
        when(encryptionService.encrypt(plainTextMessage)).thenReturn(encryptedMessage);

        ArgumentCaptor<Message> messageCaptor = ArgumentCaptor.forClass(Message.class);

        // ACT
        messageService.sendMessage(request, senderId);

        // ASSERT
        verify(messageRepository).save(messageCaptor.capture());
        Message savedMessage = messageCaptor.getValue();

        assertEquals(encryptedMessage, savedMessage.getContent());
        assertNotEquals(plainTextMessage, savedMessage.getContent());
    }
}
