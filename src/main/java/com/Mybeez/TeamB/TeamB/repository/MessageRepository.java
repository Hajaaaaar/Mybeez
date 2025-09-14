package com.Mybeez.TeamB.TeamB.repository;

import com.Mybeez.TeamB.TeamB.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Counts all unread messages for a given user
     * A message is considered unread for a user if they are the recipient, not the sender,
     * and the isRead flag is false.
     *
     * @param userId The ID of the user (recipient)
     * @return The total count of unread messages
     */
    @Query("SELECT count(m) FROM Message m " +
            "JOIN m.conversation c " +
            "JOIN c.participants p " +
            "WHERE p.id = :userId AND m.sender.id <> :userId AND m.isRead = false")
    long countUnreadMessagesForUser(@Param("userId") Long userId);

    /**
     * Directly updates the isRead flag for all relevant messages in a conversation.
     * This is more efficient than fetching, modifying, and saving entities one by one
     *
     * @param conversationId The ID of the conversation being viewed
     * @param userId The ID of the user who is viewing the conversation (to avoid marking their own messages as read)
     */
    @Modifying
    @Query("UPDATE Message m SET m.isRead = true WHERE m.conversation.id = :conversationId AND m.sender.id <> :userId AND m.isRead = false")
    void markMessagesAsReadInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId);


     //Efficiently checks if unread messages exist for a user in a specific conversation.
    boolean existsByConversationIdAndSenderIdNotAndIsReadFalse(Long conversationId, Long userId);
}