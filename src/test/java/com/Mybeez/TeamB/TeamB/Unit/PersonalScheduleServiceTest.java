package com.Mybeez.TeamB.TeamB.Unit;

import com.Mybeez.TeamB.TeamB.model.PersonalScheduleEntry;
import com.Mybeez.TeamB.TeamB.payload.PersonalScheduleRequest;
import com.Mybeez.TeamB.TeamB.repository.PersonalScheduleEntryRepository;
import com.Mybeez.TeamB.TeamB.service.PersonalScheduleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.ZonedDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PersonalScheduleServiceTest {

    @Mock
    private PersonalScheduleEntryRepository repository;

    @InjectMocks
    private PersonalScheduleService personalScheduleService;

    private Long hostId;
    private PersonalScheduleRequest request;
    private PersonalScheduleEntry entry;

    @BeforeEach
    void setUp() {
        hostId = 1L;

        request = new PersonalScheduleRequest();
        request.setTitle("Team Meeting");
        request.setDescription("Weekly sync");
        request.setStartTime(ZonedDateTime.now().plusHours(1));
        request.setEndTime(ZonedDateTime.now().plusHours(2));

        entry = PersonalScheduleEntry.builder()
                .id(1L)
                .hostId(hostId)
                .title("Team Meeting")
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .build();
    }

    // --- Test Cases for createPersonalEntry ---

    @Test
    void whenCreateEntry_withValidData_shouldSucceed() {
        // Arrange
        when(repository.findOverlappingEntriesForNewEntry(any(), any(), any())).thenReturn(Collections.emptyList());
        when(repository.save(any(PersonalScheduleEntry.class))).thenReturn(entry);

        // Act
        PersonalScheduleEntry result = personalScheduleService.createPersonalEntry(hostId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Team Meeting", result.getTitle());
        verify(repository, times(1)).save(any(PersonalScheduleEntry.class));
    }

    @Test
    void whenCreateEntry_withOverlappingTime_shouldThrowException() {
        // Arrange
        when(repository.findOverlappingEntriesForNewEntry(any(), any(), any())).thenReturn(List.of(entry));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            personalScheduleService.createPersonalEntry(hostId, request);
        });

        verify(repository, never()).save(any(PersonalScheduleEntry.class));
    }

    @Test
    void whenCreateEntry_withInvalidTimeRange_shouldThrowException() {
        // Arrange
        request.setEndTime(request.getStartTime().minusHours(1)); // End time is before start time

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            personalScheduleService.createPersonalEntry(hostId, request);
        });
    }

    // --- Test Cases for updatePersonalEntry ---

    @Test
    void whenUpdateEntry_asOwner_shouldSucceed() {
        // Arrange
        when(repository.findByIdAndHostId(entry.getId(), hostId)).thenReturn(Optional.of(entry));
        when(repository.findOverlappingEntries(any(), any(), any(), any())).thenReturn(Collections.emptyList());
        when(repository.save(any(PersonalScheduleEntry.class))).thenReturn(entry);

        request.setTitle("Updated Meeting Title");

        // Act
        PersonalScheduleEntry result = personalScheduleService.updatePersonalEntry(entry.getId(), hostId, request);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Meeting Title", result.getTitle());
        verify(repository, times(1)).save(entry);
    }

    @Test
    void whenUpdateEntry_thatDoesNotExist_shouldThrowException() {
        // Arrange
        when(repository.findByIdAndHostId(99L, hostId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            personalScheduleService.updatePersonalEntry(99L, hostId, request);
        });
    }

    // --- Test Cases for deletePersonalEntry ---

    @Test
    void whenDeleteEntry_asOwner_shouldSucceed() {
        // Arrange
        when(repository.findByIdAndHostId(entry.getId(), hostId)).thenReturn(Optional.of(entry));
        doNothing().when(repository).delete(entry);

        // Act
        personalScheduleService.deletePersonalEntry(entry.getId(), hostId);

        // Assert
        verify(repository, times(1)).delete(entry);
    }

    @Test
    void whenDeleteEntry_asNonOwner_shouldThrowException() {
        // Arrange
        Long nonOwnerId = 2L;
        when(repository.findByIdAndHostId(entry.getId(), nonOwnerId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            personalScheduleService.deletePersonalEntry(entry.getId(), nonOwnerId);
        });
    }
}