package com.Mybeez.TeamB.TeamB.controller;

import com.Mybeez.TeamB.TeamB.model.Message;
import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.payload.ConversationDTO;
import com.Mybeez.TeamB.TeamB.payload.MessageRequest;
import com.Mybeez.TeamB.TeamB.service.MessageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@Valid @RequestBody MessageRequest messageRequest,
                                         @AuthenticationPrincipal User currentUser) {
        // Get the sender's ID from the currently logged-in user object
        Long senderId = currentUser.getId();
        Message sentMessage = messageService.sendMessage(messageRequest, senderId);
        return ResponseEntity.ok(sentMessage);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@AuthenticationPrincipal User currentUser) {
        List<ConversationDTO> conversations = messageService.getConversationsForUser(currentUser.getId());
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ConversationDTO> getConversationMessages(@PathVariable Long id, @AuthenticationPrincipal User currentUser) {
        ConversationDTO conversation = messageService.getConversationById(id, currentUser.getId());
        return ResponseEntity.ok(conversation);
    }

    /**
     * Endpoint to get the count of unread messages for the currently authenticated user.
     * @param currentUser The currently logged-in user.
     * @return A JSON object with the unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadMessageCount(@AuthenticationPrincipal User currentUser) {
        long count = messageService.getUnreadMessageCount(currentUser.getId());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
