package com.Mybeez.TeamB.TeamB.Integration;

import com.Mybeez.TeamB.TeamB.controller.MessageController;
import com.Mybeez.TeamB.TeamB.exception.EncryptionException;
import com.Mybeez.TeamB.TeamB.exception.InvalidMessageContentException;
import com.Mybeez.TeamB.TeamB.model.Conversation;
import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ConversationDTO;
import com.Mybeez.TeamB.TeamB.payload.MessageRequest;
import com.Mybeez.TeamB.TeamB.payload.UserSummaryDTO;
import com.Mybeez.TeamB.TeamB.security.JwtTokenProvider;
import com.Mybeez.TeamB.TeamB.service.MessageService;
import com.Mybeez.TeamB.TeamB.service.EncryptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@WebMvcTest(controllers = MessageController.class,
        excludeAutoConfiguration = {UserDetailsServiceAutoConfiguration.class})
class MessageControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageService messageService;

    @MockBean
    private EncryptionService encryptionService;

    // Needed by the security filter, so we mock them to avoid errors
    @MockBean private JwtTokenProvider jwtTokenProvider;
    @MockBean private com.Mybeez.TeamB.TeamB.security.UserDetailsServiceImpl userDetailsService;

    @Test
    void sendMessage_whenAuthenticatedAndValid_shouldSucceed() throws Exception {
        // Arrange
        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setEmail("testuser@example.com");

        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent("This is a valid test message.");

        // Act & Assert
        mockMvc.perform(post("/api/messages/send")
                        .with(user(mockUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Verify that the controller called the service correctly
        verify(messageService).sendMessage(any(MessageRequest.class), any(Long.class));
    }

    @Test
    void sendMessage_whenNotAuthenticated_shouldReturnUnauthorized() throws Exception {
        // Arrange
        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent("This message should not be sent.");

        // Act & Assert
        mockMvc.perform(post("/api/messages/send")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    // --- TESTS FOR GETTING CONVERSATIONS AND MESSAGES ---

    @Test
    @WithMockUser
    void getConversations_whenAuthenticated_shouldReturnConversationList() throws Exception {
        // Arrange
        User currentUser = new User();
        currentUser.setId(1L);
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setFirstName("OtherUser");

        // Create a mock Conversation object that the DTO will be built from
        Conversation mockConversation = new Conversation();
        mockConversation.setId(101L);
        mockConversation.setParticipants(new HashSet<>(Set.of(currentUser, otherUser)));
        // The content in the DB would be encrypted, so we use a placeholder
        mockConversation.setMessages(List.of(Message.builder().content("encrypted_string").build()));
        mockConversation.setUpdatedAt(LocalDateTime.now());

        // Mock the decrypt method to return the expected plain text
        when(encryptionService.decrypt("encrypted_string")).thenReturn("Hello there!");
        ConversationDTO convoDTO = new ConversationDTO(mockConversation, currentUser.getId(), false, encryptionService);

        when(messageService.getConversationsForUser(any(Long.class))).thenReturn(List.of(convoDTO));

        // Act, Assert
        mockMvc.perform(get("/api/messages/conversations")
                        .with(user(currentUser))) // Provide the principal object
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(101)))
                .andExpect(jsonPath("$[0].lastMessage", is("Hello there!")))
                .andExpect(jsonPath("$[0].otherParticipant.firstName", is("OtherUser")));
    }

    @Test
    void getConversations_whenNotAuthenticated_shouldReturnUnauthorized() throws Exception {
        // Act, Assert
        mockMvc.perform(get("/api/messages/conversations"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void getConversationMessages_whenAuthenticated_shouldReturnConversation() throws Exception {
        // Arrange
        User currentUser = new User();
        currentUser.setId(1L);

        // Create a mock Conversation object
        Conversation mockConversation = new Conversation();
        mockConversation.setId(202L);
        mockConversation.setParticipants(new HashSet<>(Set.of(currentUser)));
        mockConversation.setMessages(Collections.emptyList());

        // Create the DTO using its actual constructor
        ConversationDTO convoDTO = new ConversationDTO(mockConversation, encryptionService);

        when(messageService.getConversationById(eq(202L), any(Long.class))).thenReturn(convoDTO);

        // Act, Assert
        mockMvc.perform(get("/api/messages/conversations/{id}", 202L)
                        .with(user(currentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(202)));
    }

    @Test
    void getConversationMessages_whenNotAuthenticated_shouldReturnUnauthorized() throws Exception {
        // Act, Assert
        mockMvc.perform(get("/api/messages/conversations/{id}", 202L))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    void getUnreadCount_whenAuthenticated_shouldReturnCount() throws Exception {
        // Arrange
        User currentUser = new User();
        currentUser.setId(1L);
        long unreadCount = 5L;

        when(messageService.getUnreadMessageCount(currentUser.getId())).thenReturn(unreadCount);

        // Act, Assert
        mockMvc.perform(get("/api/messages/unread-count")
                        .with(user(currentUser)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unreadCount", is(5)));
    }

    @Test
    void getUnreadCount_whenNotAuthenticated_shouldReturnUnauthorized() throws Exception {
        // Act, Assert
        mockMvc.perform(get("/api/messages/unread-count"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void sendMessage_whenInvalidRequestBody_shouldReturnBadRequest() throws Exception {
        // Arrange
        User mockUser = new User();
        mockUser.setId(1L);

        // Create an invalid request (content is blank)
        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent(""); // This violates @NotBlank

        // Act, Assert
        mockMvc.perform(post("/api/messages/send")
                        .with(user(mockUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // Simulates a client sending a message with invalid content directly to the API
    // This tests the server-side validation and exception handling
    @Test
    void sendMessage_whenContentIsInvalid_shouldReturnBadRequest() throws Exception {
        // Arrange
        User mockUser = new User();
        mockUser.setId(1L);

        MessageRequest request = new MessageRequest();
        request.setRecipientId(2L);
        request.setContent("This message has my email: test@example.com");

        // Mock the service layer to throw the exception our controller should handle
        when(messageService.sendMessage(any(MessageRequest.class), any(Long.class)))
                .thenThrow(new InvalidMessageContentException("Message contains inappropriate or unsafe content."));

        // Act, Assert
        mockMvc.perform(post("/api/messages/send")
                        .with(user(mockUser))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Message contains inappropriate or unsafe content.")));
    }
    /**
     * Verifies that if decryption fails, the controller returns a 500 Internal Server Error.
     * This tests the RestExceptionHandler's handling of EncryptionException.
     */
    @Test
    void getConversations_whenDecryptionFails_shouldReturnInternalServerError() throws Exception {
        // Arrange
        User currentUser = new User();
        currentUser.setId(1L);

        // Mock the service layer to throw the exception our controller should handle
        when(messageService.getConversationsForUser(any(Long.class)))
                .thenThrow(new EncryptionException("Decryption failed due to corrupted data."));

        // Act, Assert
        mockMvc.perform(get("/api/messages/conversations")
                        .with(user(currentUser)))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error", is("A server error occurred while processing your request.")));
    }
}

