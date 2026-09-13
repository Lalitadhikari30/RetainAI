package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String severity; // critical, warning, info

    @Column(name = "employee_id", length = 20)
    private String employeeId;

    @Column(name = "employee_name")
    private String employeeName;

    @Column(length = 255)
    private String link;

    @Column(nullable = false)
    @Builder.Default
    private Boolean read = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (read == null) read = false;
        if (severity == null) severity = "info";
    }
}
