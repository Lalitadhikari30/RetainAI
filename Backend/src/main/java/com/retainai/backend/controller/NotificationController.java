package com.retainai.backend.controller;

import com.retainai.backend.entity.Notification;
import com.retainai.backend.service.NotificationService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /**
     * Subscribe to real-time notifications via Server-Sent Events (SSE).
     */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        return notificationService.subscribe();
    }

    /**
     * Fetch recent notifications and unread count.
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications() {
        List<Notification> notifications = notificationService.getRecentNotifications();
        long unreadCount = notificationService.getUnreadCount();
        return ResponseEntity.ok(Map.of(
                "notifications", notifications,
                "unreadCount", unreadCount
        ));
    }

    /**
     * Mark a single notification as read.
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(Map.of("status", "success", "id", id));
    }

    /**
     * Mark all notifications as read.
     */
    @PostMapping("/mark-all-read")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    /**
     * Trigger a test notification for verification and interactive demo.
     */
    @PostMapping("/test")
    public ResponseEntity<Notification> triggerTestNotification(@RequestBody(required = false) Map<String, String> body) {
        String employeeName = (body != null && body.containsKey("employeeName"))
                ? body.get("employeeName")
                : "Marcus Thorne";
        String employeeId = (body != null && body.containsKey("employeeId"))
                ? body.get("employeeId")
                : "EMP-88421";
        int mockScore = 80 + new Random().nextInt(15);

        Notification testNotification = Notification.builder()
                .title("Critical Risk Surge Detected")
                .message(employeeName + "'s flight risk spiked to " + mockScore + "% due to workload and compensation delta.")
                .severity("critical")
                .employeeId(employeeId)
                .employeeName(employeeName)
                .link("/employees/" + employeeId)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification broadcasted = notificationService.broadcast(testNotification);
        return ResponseEntity.ok(broadcasted);
    }
}
