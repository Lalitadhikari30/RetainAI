package com.retainai.backend.scheduler;

import com.retainai.backend.entity.Employee;
import com.retainai.backend.entity.InterventionLog;
import com.retainai.backend.repository.EmployeeRepository;
import com.retainai.backend.repository.InterventionLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Scheduled job to evaluate intervention outcomes after a 30-day monitoring window.
 * Runs daily at 2:00 AM server time.
 */
@Component
public class InterventionOutcomeChecker {

    private static final Logger log = LoggerFactory.getLogger(InterventionOutcomeChecker.class);

    private final InterventionLogRepository interventionLogRepository;
    private final EmployeeRepository employeeRepository;

    public InterventionOutcomeChecker(InterventionLogRepository interventionLogRepository,
                                      EmployeeRepository employeeRepository) {
        this.interventionLogRepository = interventionLogRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Daily job at 2:00 AM.
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void evaluatePendingInterventions() {
        log.info("Starting scheduled intervention outcome evaluation...");
        int processed = processOutcomes(30);
        log.info("Completed intervention outcome evaluation. Processed {} interventions.", processed);
    }

    /**
     * Process interventions older than daysThreshold days where outcome is null.
     */
    @Transactional
    public int processOutcomes(int daysThreshold) {
        LocalDate cutoffDate = LocalDate.now().minusDays(daysThreshold);
        List<InterventionLog> pending = interventionLogRepository.findPendingOutcomeChecks(cutoffDate);

        int count = 0;
        for (InterventionLog item : pending) {
            Optional<Employee> empOpt = employeeRepository.findById(item.getEmployeeId());

            if (empOpt.isPresent() && Boolean.TRUE.equals(empOpt.get().getActive())) {
                item.setOutcome("stayed");
            } else {
                item.setOutcome("left");
            }
            item.setOutcomeCheckedAt(LocalDateTime.now());
            interventionLogRepository.save(item);
            count++;
        }

        return count;
    }
}
