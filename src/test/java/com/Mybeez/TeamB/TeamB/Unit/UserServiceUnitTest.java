package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.model.User;
import com.Mybeez.TeamB.TeamB.service.UserService;
import com.Mybeez.TeamB.TeamB.model.UserRole;
import com.Mybeez.TeamB.TeamB.payload.UserStatsDTO;
import com.Mybeez.TeamB.TeamB.repository.UserRepository;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.domain.Specification;
import static org.mockito.Mockito.*;
import static org.mockito.BDDMockito.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;


@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {

    @Mock
    UserRepository userRepository;

    @InjectMocks
    UserService userService;

    // ---------- Helpers ----------
    private static User user(Long id, boolean active, boolean banned, boolean deleted) {
        return User.builder()
                .id(id)
                .firstName("Test")
                .lastName("User")
                .email("test"+id+"@example.com")
                .role(UserRole.USER)
                .active(active)
                .banned(banned)
                .deleted(deleted)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    // ---------- State transition methods ----------

    @Test
    void activateUser_setsActiveTrue_unsetsBannedDeleted_andSaves() {
        var u = user(1L, false, true, true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(u));

        userService.activateUser(1L);

        assertThat(u.isActive()).isTrue();
        assertThat(u.isBanned()).isFalse();
        assertThat(u.isDeleted()).isFalse();
        verify(userRepository).save(u);
    }

    @Test
    void deactivateUser_setsActiveFalse_andSaves() {
        var u = user(2L, true, false, false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(u));

        userService.deactivateUser(2L);

        assertThat(u.isActive()).isFalse();
        verify(userRepository).save(u);
    }

    @Test
    void banUser_setsBannedTrue_andActiveFalse_andSaves() {
        var u = user(3L, true, false, false);
        when(userRepository.findById(3L)).thenReturn(Optional.of(u));

        userService.banUser(3L);

        assertThat(u.isBanned()).isTrue();
        assertThat(u.isActive()).isFalse();
        verify(userRepository).save(u);
    }

    @Test
    void unbanUser_setsBannedFalse_andActiveTrue_andSaves() {
        var u = user(4L, false, true, false);
        when(userRepository.findById(4L)).thenReturn(Optional.of(u));

        userService.unbanUser(4L);

        assertThat(u.isBanned()).isFalse();
        assertThat(u.isActive()).isTrue();
        verify(userRepository).save(u);
    }

    @Test
    void softDeleteUser_setsDeletedTrue_andActiveFalse_andSaves() {
        var u = user(5L, true, false, false);
        when(userRepository.findById(5L)).thenReturn(Optional.of(u));

        userService.softDeleteUser(5L);

        assertThat(u.isDeleted()).isTrue();
        assertThat(u.isActive()).isFalse();
        verify(userRepository).save(u);
    }

    @Test
    void operations_doNothing_whenUserMissing() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        userService.activateUser(999L);
        userService.deactivateUser(999L);
        userService.banUser(999L);
        userService.unbanUser(999L);
        userService.softDeleteUser(999L);

        // no saves if user not found
        verify(userRepository, never()).save(any());
    }

    @Test
    void countActiveUsers_returnsRepositoryCount() {
        when(userRepository.countByActive(true)).thenReturn(42L);

        long count = userService.countActiveUsers();

        assertThat(count).isEqualTo(42L);
        verify(userRepository).countByActive(true);
    }

    @Test
    void getUserStats_aggregatesCountsCorrectly() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByActive(true)).thenReturn(6L);
        when(userRepository.countByBanned(true)).thenReturn(2L);
        when(userRepository.countByDeleted(true)).thenReturn(1L);

        UserStatsDTO stats = userService.getUserStats();

        assertThat(stats.getTotalUsers()).isEqualTo(10L);
        assertThat(stats.getActiveUsers()).isEqualTo(6L);
        assertThat(stats.getBannedUsers()).isEqualTo(2L);
        assertThat(stats.getDeletedUsers()).isEqualTo(1L);
        assertThat(stats.getInactiveUsers()).isEqualTo(10L - 6L); // derived
    }
}
