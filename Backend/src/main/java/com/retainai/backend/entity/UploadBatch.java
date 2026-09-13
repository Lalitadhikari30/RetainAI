package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "upload_batches")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UploadBatch {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "batch_number", length = 20)
    private String batchNumber;

    @Column(name = "uploaded_by", length = 36)
    private String uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    private String filename;

    @Column(length = 50)
    private String status;

    @Column(name = "employees_processed")
    private Integer employeesProcessed;

    @Column(name = "compute_duration", length = 20)
    private String computeDuration;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = LocalDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (status == null) status = "processing";
    }
}
