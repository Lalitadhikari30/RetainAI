package com.retainai.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Employee {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "employee_number", unique = true, nullable = false)
    private Integer employeeNumber;

    @Column(nullable = false)
    private String name;

    @Column(length = 5)
    private String initials;

    @Column(length = 500)
    private String avatar;

    private String role;

    @Column(nullable = false, length = 100)
    private String department;

    @Column(length = 50)
    private String band;

    @Column(name = "tenure_years")
    private Integer tenureYears;

    @Column(name = "tenure_months")
    private Integer tenureMonths;

    private String location;

    @Column(name = "manager_id", length = 36)
    private String managerId;

    @Column(name = "manager_name")
    private String managerName;

    @Column(name = "monthly_income")
    private BigDecimal monthlyIncome;

    @Column(name = "annual_salary")
    private BigDecimal annualSalary;

    @Column(name = "overtime_hours_per_week")
    private BigDecimal overtimeHoursPerWeek;

    @Column(name = "job_satisfaction")
    private Integer jobSatisfaction;

    @Column(name = "years_since_last_promotion")
    private BigDecimal yearsSinceLastPromotion;

    @Column(name = "commute_distance_miles")
    private BigDecimal commuteDistanceMiles;

    @Column(name = "distance_from_home")
    private Integer distanceFromHome;

    @Column(name = "work_life_balance")
    private Integer workLifeBalance;

    @Column(name = "performance_rating")
    private Integer performanceRating;

    @Column(name = "peer_departures")
    private Integer peerDepartures;

    @Column(name = "comp_vs_market_delta_percent")
    private BigDecimal compVsMarketDeltaPercent;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Compute formatted tenure string matching frontend display */
    public String getTenureFormatted() {
        int y = tenureYears != null ? tenureYears : 1;
        int m = tenureMonths != null ? tenureMonths : 0;
        return y + " Yrs " + m + " Mos";
    }
}
