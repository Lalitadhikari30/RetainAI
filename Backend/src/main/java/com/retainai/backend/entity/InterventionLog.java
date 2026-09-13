package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "intervention_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InterventionLog {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 20)
    private String employeeId;

    @Column(name = "logged_by", length = 36)
    private String loggedBy;

    @Column(name = "action_taken", nullable = false, columnDefinition = "TEXT")
    private String actionTaken;

    @Column(name = "date_taken", nullable = false)
    private LocalDate dateTaken;

    @Column(length = 20)
    private String outcome; // stayed, left, null

    @Column(name = "outcome_checked_at")
    private LocalDateTime outcomeCheckedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
    }
}
