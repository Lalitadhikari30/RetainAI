package com.retainai.backend.service;

import com.retainai.backend.entity.Notification;
import com.retainai.backend.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Registers a new client SSE stream.
     */
    public SseEmitter subscribe() {
        // 30 minute timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> {
            log.debug("SSE emitter completed");
            emitters.remove(emitter);
        });
        emitter.onTimeout(() -> {
            log.debug("SSE emitter timed out");
            emitters.remove(emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        });
        emitter.onError((e) -> {
            log.debug("SSE emitter error: {}", e != null ? e.getMessage() : "closed");
            emitters.remove(emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        });

        // Send initial connection handshake event
        try {
            emitter.send(SseEmitter.event()
                    .name("INIT")
                    .data(Map.of(
                            "status", "CONNECTED",
                            "timestamp", LocalDateTime.now().toString(),
                            "unreadCount", notificationRepository.countByReadFalse()
                    )));
        } catch (Exception e) {
            emitters.remove(emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        }

        return emitter;
    }

    /**
     * Broadcasts a notification to all active SSE subscribers and persists to database.
     */
    public Notification broadcast(Notification notification) {
        if (notification.getId() == null) {
            notification.setId(UUID.randomUUID().toString());
        }
        if (notification.getCreatedAt() == null) {
            notification.setCreatedAt(LocalDateTime.now());
        }
        if (notification.getRead() == null) {
            notification.setRead(false);
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Broadcasting real-time notification: '{}' - '{}'", saved.getTitle(), saved.getMessage());

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("NOTIFICATION")
                        .data(saved));
            } catch (Exception e) {
                deadEmitters.add(emitter);
                try {
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        }
        emitters.removeAll(deadEmitters);

        return saved;
    }

    /**
     * Periodic ping heartbeat to prevent client / reverse proxy timeouts.
     */
    @Scheduled(fixedRate = 25000)
    public void sendHeartbeat() {
        if (emitters.isEmpty()) return;

        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().comment("ping"));
            } catch (Exception e) {
                deadEmitters.add(emitter);
                try {
                    emitter.complete();
                } catch (Exception ignored) {}
            }
        }
        emitters.removeAll(deadEmitters);
    }

    public List<Notification> getRecentNotifications() {
        return notificationRepository.findTop30ByOrderByCreatedAtDesc();
    }

    public long getUnreadCount() {
        return notificationRepository.countByReadFalse();
    }

    public void markAsRead(String id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    public void markAllAsRead() {
        notificationRepository.markAllAsRead();
    }
}
