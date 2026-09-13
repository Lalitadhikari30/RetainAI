package com.retainai.backend.controller;

import com.retainai.backend.dto.InterventionRequest;
import com.retainai.backend.entity.InterventionLog;
import com.retainai.backend.repository.EmployeeRepository;
import com.retainai.backend.repository.InterventionLogRepository;
import com.retainai.backend.security.CurrentUser;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/employees", "/api/v1/employees"})
@CrossOrigin(origins = "*")
public class InterventionController {

    private final InterventionLogRepository interventionLogRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentUser currentUser;
    private final com.retainai.backend.service.NotificationService notificationService;

    public InterventionController(InterventionLogRepository interventionLogRepository,
                                  EmployeeRepository employeeRepository,
                                  CurrentUser currentUser,
                                  com.retainai.backend.service.NotificationService notificationService) {
        this.interventionLogRepository = interventionLogRepository;
        this.employeeRepository = employeeRepository;
        this.currentUser = currentUser;
        this.notificationService = notificationService;
    }

    @PostMapping("/{id}/interventions")
    public ResponseEntity<InterventionLog> logIntervention(
            @PathVariable String id,
            @RequestBody InterventionRequest request) {

        var empOpt = employeeRepository.findById(id);
        if (empOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        var employee = empOpt.get();

        LocalDate date = (request.dateTaken() != null && !request.dateTaken().isBlank())
                ? LocalDate.parse(request.dateTaken())
                : LocalDate.now();

        InterventionLog log = InterventionLog.builder()
                .id(UUID.randomUUID().toString())
                .employeeId(id)
                .loggedBy(currentUser.getUserId())
                .actionTaken(request.actionTaken())
                .dateTaken(date)
                .build();

        InterventionLog saved = interventionLogRepository.save(log);

        // Broadcast real-time intervention notification
        try {
            notificationService.broadcast(com.retainai.backend.entity.Notification.builder()
                    .title("Retention Action Logged")
                    .message("Action recorded for " + employee.getName() + ": \"" + request.actionTaken() + "\"")
                    .severity("info")
                    .employeeId(id)
                    .employeeName(employee.getName())
                    .link("/employees/" + id)
                    .read(false)
                    .build());
        } catch (Exception ignored) {}

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/interventions")
    public ResponseEntity<List<InterventionLog>> getInterventions(@PathVariable String id) {
        List<InterventionLog> logs;
        if (currentUser.isHrAdmin()) {
            logs = interventionLogRepository.findByEmployeeIdOrderByDateTakenDesc(id);
        } else {
            logs = interventionLogRepository.findByEmployeeIdAndLoggedByOrderByDateTakenDesc(
                    id, currentUser.getUserId());
        }
        return ResponseEntity.ok(logs);
    }
}
