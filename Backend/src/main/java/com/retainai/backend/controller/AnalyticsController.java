package com.retainai.backend.controller;

import com.retainai.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/analytics", "/api/v1/analytics"})
@CrossOrigin(origins = "*")
public class AnalyticsController {

    private final EmployeeService employeeService;

    public AnalyticsController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        Map<String, Object> stats = employeeService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }
}
