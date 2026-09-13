package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Prediction {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "employee_id", nullable = false, length = 20)
    private String employeeId;

    @Column(name = "batch_id", length = 36)
    private String batchId;

    @Column(name = "risk_score")
    private Integer riskScore;

    @Column(name = "risk_band", length = 10)
    private String riskBand; // high, medium, low

    @Column(name = "risk_velocity", length = 10)
    private String riskVelocity; // rising, stable, falling

    @Column(name = "risk_delta", length = 100)
    private String riskDelta;

    @Column(name = "primary_driver", columnDefinition = "TEXT")
    private String primaryDriver;

    @Column(name = "feature_importances_json", columnDefinition = "TEXT")
    private String featureImportancesJson;

    @Column(name = "risk_factors_json", columnDefinition = "TEXT")
    private String riskFactorsJson;

    @Column(name = "historical_trajectory_json", columnDefinition = "TEXT")
    private String historicalTrajectoryJson;

    @Column(name = "ai_explanation", columnDefinition = "TEXT")
    private String aiExplanation;

    @Column(name = "recommended_actions_json", columnDefinition = "TEXT")
    private String recommendedActionsJson;

    @Column(name = "replacement_cost")
    private BigDecimal replacementCost;

    @Column(name = "knowledge_loss_risk", columnDefinition = "TEXT")
    private String knowledgeLossRisk;

    @Column(name = "team_headcount", length = 20)
    private String teamHeadcount;

    @Column(name = "team_turnover_90d", length = 20)
    private String teamTurnover90d;

    @Column(name = "model_used", length = 10)
    private String modelUsed; // full, reduced

    @Column(name = "confidence_note", columnDefinition = "TEXT")
    private String confidenceNote;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (id == null) id = java.util.UUID.randomUUID().toString();
    }
}
