package com.retainai.backend.repository;

import com.retainai.backend.entity.Prediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, String> {

    /** Get the latest prediction for an employee */
    @Query("SELECT p FROM Prediction p WHERE p.employeeId = :employeeId ORDER BY p.createdAt DESC LIMIT 1")
    Optional<Prediction> findLatestByEmployeeId(@Param("employeeId") String employeeId);

    /** Get all predictions for a batch */
    List<Prediction> findByBatchId(String batchId);

    /** Get all latest predictions (one per employee) — for dashboard analytics */
    @Query("""
        SELECT p FROM Prediction p
        WHERE p.createdAt = (
            SELECT MAX(p2.createdAt) FROM Prediction p2 WHERE p2.employeeId = p.employeeId
        )
        """)
    List<Prediction> findAllLatestPredictions();

    /** Count by risk band — for dashboard stats */
    @Query("SELECT p.riskBand, COUNT(p) FROM Prediction p WHERE p.createdAt = (SELECT MAX(p2.createdAt) FROM Prediction p2 WHERE p2.employeeId = p.employeeId) GROUP BY p.riskBand")
    List<Object[]> countByRiskBand();
}
