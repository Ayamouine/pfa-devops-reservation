package com.example.notificationservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.repository.NotificationRepository;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
        // Skip the built-in seed data so tests only see what they set up themselves.
        when(notificationRepository.count()).thenReturn(1L);
        notificationService = new NotificationService(notificationRepository);
    }

    @Test
    void createNotification_savesNotificationWithGivenFields() {
        when(notificationRepository.save(any(Notification.class)))
                .thenAnswer(invocation -> {
                    Notification n = invocation.getArgument(0);
                    n.setId(10L);
                    return n;
                });

        Notification result = notificationService.createNotification("aya", "Reservation confirmee", "sent");

        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);
        verify(notificationRepository).save(captor.capture());

        assertThat(captor.getValue().getUsername()).isEqualTo("aya");
        assertThat(captor.getValue().getMessage()).isEqualTo("Reservation confirmee");
        assertThat(captor.getValue().getStatus()).isEqualTo("sent");
        assertThat(result.getId()).isEqualTo(10L);
    }

    @Test
    void getNotificationsForUser_returnsOnlyThatUsersNotifications() {
        Notification n1 = new Notification(1L, "aya", "Msg 1", "sent");
        Notification n2 = new Notification(2L, "aya", "Msg 2", "pending");
        when(notificationRepository.findByUsername("aya")).thenReturn(List.of(n1, n2));

        List<Notification> result = notificationService.getNotificationsForUser("aya");

        assertThat(result).hasSize(2);
        assertThat(result).extracting(Notification::getUsername).containsOnly("aya");
    }

    @Test
    void getNotificationsForUser_returnsEmptyList_whenUserHasNone() {
        when(notificationRepository.findByUsername("ghost")).thenReturn(List.of());

        List<Notification> result = notificationService.getNotificationsForUser("ghost");

        assertThat(result).isEmpty();
    }

    @Test
    void getAllNotifications_returnsEverythingInRepository() {
        Notification n1 = new Notification(1L, "aya", "Msg 1", "sent");
        Notification n2 = new Notification(2L, "mouine", "Msg 2", "pending");
        when(notificationRepository.findAll()).thenReturn(List.of(n1, n2));

        List<Notification> result = notificationService.getAllNotifications();

        assertThat(result).hasSize(2);
    }
}