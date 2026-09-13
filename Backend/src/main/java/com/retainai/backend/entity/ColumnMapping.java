package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "column_mappings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ColumnMapping {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "batch_id", nullable = false, length = 36)
    private String batchId;

    @Column(name = "source_column")
    private String sourceColumn;

    @Column(name = "mapped_to")
    private String mappedTo;

    @Column(length = 10)
    private String confidence;

    @Column(name = "confidence_percent")
    private Integer confidencePercent;

    @Column(name = "match_type", length = 50)
    private String matchType;

    @Column(name = "sample_value", length = 500)
    private String sampleValue;

    private Boolean required;

    private Boolean confirmed;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = java.util.UUID.randomUUID().toString();
        if (confirmed == null) confirmed = false;
    }
}
