package com.example.notificationservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.example.notificationservice.model.Notification;
import com.example.notificationservice.model.NotificationRequest;
import com.example.notificationservice.repository.NotificationRepository;

class NotificationServiceTest {

    private NotificationRepository notificationRepository;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() {
        notificationRepository = mock(NotificationRepository.class);
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

    @Test
    void createNotification_fromRequest_setsTypeAndLink() {
        NotificationRequest req = new NotificationRequest();
        req.setUsername("aya");
        req.setMessage("Demande approuvée");
        req.setType("BOOKING_APPROVED");
        req.setLink("/reservations");
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.createNotification(req);

        assertThat(result.getUsername()).isEqualTo("aya");
        assertThat(result.getType()).isEqualTo("BOOKING_APPROVED");
        assertThat(result.getLink()).isEqualTo("/reservations");
        assertThat(result.isRead()).isFalse();
    }

    @Test
    void getMyNotifications_combinesDirectAndRoleTargeted() {
        Notification direct = new Notification("aya", "Direct", "BOOKING_CONFIRMED", null, false, null);
        Notification roleTarget = new Notification(null, "Aux doyens", "BOOKING_APPROVAL_PENDING", "ROLE:DOYEN", false, null);
        Notification filiereTarget = new Notification(null, "Chef GI", "BOOKING_PENDING_APPROVAL",
                "ROLE:CHEF_FILIERE:GI", false, null);

        when(notificationRepository.findByUsername("doyen")).thenReturn(List.of());
        when(notificationRepository.findByTarget("ROLE:DOYEN")).thenReturn(List.of(roleTarget));
        when(notificationRepository.findByUsername("chefGI")).thenReturn(List.of(direct));
        when(notificationRepository.findByTarget("ROLE:CHEF_FILIERE")).thenReturn(List.of());
        when(notificationRepository.findByTarget("ROLE:CHEF_FILIERE:GI")).thenReturn(List.of(filiereTarget));

        List<Notification> forDoyen = notificationService.getMyNotifications("doyen", "DOYEN", "");
        List<Notification> forChef = notificationService.getMyNotifications("chefGI", "CHEF_FILIERE", "GI");

        assertThat(forDoyen).extracting(Notification::getTarget).containsExactly("ROLE:DOYEN");
        assertThat(forChef).hasSize(2);
    }

    @Test
    void markRead_setsReadFlag() {
        Notification n = new Notification("aya", "Msg", "SYSTEM", null, false, null);
        when(notificationRepository.findById(3L)).thenReturn(java.util.Optional.of(n));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(inv -> inv.getArgument(0));

        Notification result = notificationService.markRead(3L, "aya");

        assertThat(result.isRead()).isTrue();
    }

    @Test
    void markRead_forbidsOtherUser() {
        Notification n = new Notification("aya", "Msg", "SYSTEM", null, false, null);
        when(notificationRepository.findById(3L)).thenReturn(java.util.Optional.of(n));

        assertThatThrownBy(() -> notificationService.markRead(3L, "bob"))
                .isInstanceOf(org.springframework.web.server.ResponseStatusException.class)
                .hasMessageContaining("ne vous appartient pas");
    }

    @Test
    void countUnread_ignoresAlreadyRead() {
        Notification read = new Notification("aya", "Lue", "SYSTEM", null, true, null);
        Notification unread = new Notification("aya", "Non lue", "SYSTEM", null, false, null);
        when(notificationRepository.findByUsername("aya")).thenReturn(List.of(read, unread));

        long count = notificationService.countUnread("aya", "", "");

        assertThat(count).isEqualTo(1L);
    }
}