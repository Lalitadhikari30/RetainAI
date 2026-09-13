package com.retainai.backend.controller;

import com.retainai.backend.entity.Prediction;
import com.retainai.backend.exception.ResourceNotFoundException;
import com.retainai.backend.repository.PredictionRepository;
import com.retainai.backend.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/employees", "/api/v1/employees"})
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final PredictionRepository predictionRepository;

    public EmployeeController(EmployeeService employeeService,
                              PredictionRepository predictionRepository) {
        this.employeeService = employeeService;
        this.predictionRepository = predictionRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getEmployees(
            @RequestParam(required = false) String department,
            @RequestParam(name = "dept", required = false) String dept,
            @RequestParam(required = false) String riskBand,
            @RequestParam(name = "risk", required = false) String risk,
            @RequestParam(required = false) String sortBy,
            @RequestParam(name = "sort", required = false) String sort,
            @RequestParam(required = false) String search) {

        String effectiveDept = department != null ? department : dept;
        String effectiveRisk = riskBand != null ? riskBand : risk;
        String effectiveSort = sortBy != null ? sortBy : sort;

        List<Map<String, Object>> employees = employeeService.getEmployeeList(
                effectiveDept, effectiveRisk, effectiveSort, search);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getEmployeeDetail(@PathVariable String id) {
        Map<String, Object> detail = employeeService.getEmployeeDetail(id);
        return ResponseEntity.ok(detail);
    }

    @GetMapping("/{id}/prediction")
    public ResponseEntity<Prediction> getEmployeePrediction(@PathVariable String id) {
        Prediction prediction = predictionRepository.findLatestByEmployeeId(id)
                .orElseThrow(() -> new ResourceNotFoundException("No prediction found for employee: " + id));
        return ResponseEntity.ok(prediction);
    }
}
