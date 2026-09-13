package com.retainai.backend.repository;

import com.retainai.backend.entity.InterventionLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface InterventionLogRepository extends JpaRepository<InterventionLog, String> {

    /** Get all interventions for an employee */
    List<InterventionLog> findByEmployeeIdOrderByDateTakenDesc(String employeeId);

    /** Role-scoped: only interventions logged by a specific user */
    List<InterventionLog> findByEmployeeIdAndLoggedByOrderByDateTakenDesc(String employeeId, String loggedBy);

    /** Find interventions that need outcome checking (older than N days, outcome still null) */
    @Query("SELECT i FROM InterventionLog i WHERE i.outcome IS NULL AND i.dateTaken < :cutoffDate")
    List<InterventionLog> findPendingOutcomeChecks(@Param("cutoffDate") LocalDate cutoffDate);
}
