package com.retainai.backend.service;

import com.retainai.backend.entity.Employee;
import com.retainai.backend.entity.Prediction;
import com.retainai.backend.repository.EmployeeRepository;
import com.retainai.backend.repository.PredictionRepository;
import com.retainai.backend.security.CurrentUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.function.FunctionToolCallback;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Manager Copilot Service — uses Spring AI ChatClient with function calling.
 *
 * Functions are role-scoped: MANAGER can only query their own reports.
 * The LLM autonomously determines when to invoke getEmployeeRiskData and getTeamSummary.
 */
@Service
public class CopilotService {

    private static final Logger log = LoggerFactory.getLogger(CopilotService.class);

    private final ChatClient chatClient;
    private final EmployeeRepository employeeRepository;
    private final PredictionRepository predictionRepository;
    private final CurrentUser currentUser;

    public record EmployeeRiskRequest(String employeeIdentifier) {}
    public record TeamSummaryRequest() {}

    public CopilotService(ChatClient.Builder chatClientBuilder,
                          EmployeeRepository employeeRepository,
                          PredictionRepository predictionRepository,
                          CurrentUser currentUser) {
        this.chatClient = chatClientBuilder
                .defaultSystem("""
                    You are RetainAI Copilot — an enterprise HR analytics assistant that helps
                    managers understand and mitigate employee attrition risk. You have access to
                    real-time employee risk data and team analytics.

                    Guidelines:
                    - Be professional, data-driven, and actionable in your responses.
                    - Reference specific metrics (risk scores, feature importances, costs).
                    - Suggest concrete retention actions — never auto-execute, always recommend.
                    - Use markdown formatting for readability (bold, bullets, numbers).
                    - When discussing employees, include their risk score and key risk drivers.
                    - Use the provided functions to look up employee data when the user asks about specific
                      employees or their team.
                    - IMPORTANT: You already know who the current user is. NEVER ask the user for their
                      Manager ID, Employee ID, or any identifier. All tools are automatically scoped to
                      the authenticated user's team. Just call the tools directly.
                    """)
                .build();
        this.employeeRepository = employeeRepository;
        this.predictionRepository = predictionRepository;
        this.currentUser = currentUser;
    }

    /**
     * Process a copilot chat message. The LLM will autonomously invoke functions as needed.
     */
    public CopilotResponse chat(String userMessage) {
        try {
            log.debug("Copilot chat request: {}", userMessage);

            var employeeRiskTool = FunctionToolCallback.builder("getEmployeeRiskData",
                            (EmployeeRiskRequest req) -> getEmployeeRiskData(req != null ? req.employeeIdentifier() : null))
                    .description("Get detailed risk data for a specific employee by name or employee ID (e.g. 'EMP-001' or 'Marcus'). Automatically scoped to the authenticated user's accessible employees.")
                    .inputType(EmployeeRiskRequest.class)
                    .build();

            var teamSummaryTool = FunctionToolCallback.builder("getTeamSummary",
                            (TeamSummaryRequest req) -> getTeamSummary())
                    .description("Returns risk summary for the current manager's direct reports including headcount, high-risk employees, and total cost exposure. No parameters needed — automatically scoped to the authenticated user's team.")
                    .inputType(TeamSummaryRequest.class)
                    .build();

            String response = chatClient.prompt()
                    .user(userMessage)
                    .toolCallbacks(employeeRiskTool, teamSummaryTool)
                    .call()
                    .content();

            // Extract referenced employee IDs from the response
            List<String> referencedIds = extractEmployeeIds(response);

            log.debug("Copilot response generated, referenced employees: {}", referencedIds);

            return new CopilotResponse(response, referencedIds);

        } catch (Exception e) {
            log.error("Copilot chat error: {}", e.getMessage(), e);
            return new CopilotResponse(
                    "I apologize, but I'm unable to process your request at the moment. " +
                    "Please try again or consult the dashboard for the latest risk metrics.",
                    List.of()
            );
        }
    }

    public record CopilotResponse(String reply, List<String> referencedEmployeeIds) {}

    public String getEmployeeRiskData(String employeeIdentifier) {
        if (employeeIdentifier == null || employeeIdentifier.isBlank()) {
            return "No employee identifier specified.";
        }

        log.debug("Function call: getEmployeeRiskData({})", employeeIdentifier);

        // Find employee by ID or name
        Optional<Employee> empOpt;
        if (employeeIdentifier.startsWith("EMP-")) {
            empOpt = findEmployeeScoped(employeeIdentifier);
        } else {
            // Search by name
            List<Employee> employees = getAccessibleEmployees();
            empOpt = employees.stream()
                    .filter(e -> e.getName().toLowerCase().contains(employeeIdentifier.toLowerCase()))
                    .findFirst();
        }

        if (empOpt.isEmpty()) {
            return "Employee not found or not in your accessible scope: " + employeeIdentifier;
        }

        Employee emp = empOpt.get();
        Optional<Prediction> predOpt = predictionRepository.findLatestByEmployeeId(emp.getId());

        StringBuilder sb = new StringBuilder();
        sb.append("Employee: ").append(emp.getName()).append(" (").append(emp.getId()).append(")\n");
        sb.append("Role: ").append(emp.getRole()).append("\n");
        sb.append("Department: ").append(emp.getDepartment()).append("\n");
        sb.append("Tenure: ").append(emp.getTenureFormatted()).append("\n");
        sb.append("Annual Salary: $").append(emp.getAnnualSalary()).append("\n");

        if (predOpt.isPresent()) {
            Prediction pred = predOpt.get();
            sb.append("Risk Score: ").append(pred.getRiskScore()).append("% (").append(pred.getRiskBand()).append(")\n");
            sb.append("Risk Velocity: ").append(pred.getRiskVelocity()).append("\n");
            sb.append("Risk Delta: ").append(pred.getRiskDelta()).append("\n");
            sb.append("Primary Driver: ").append(pred.getPrimaryDriver()).append("\n");
            sb.append("Replacement Cost: $").append(pred.getReplacementCost()).append("\n");
            sb.append("Knowledge Loss Risk: ").append(pred.getKnowledgeLossRisk()).append("\n");
            sb.append("Feature Importances: ").append(pred.getFeatureImportancesJson()).append("\n");
            sb.append("AI Analysis: ").append(pred.getAiExplanation()).append("\n");
        } else {
            sb.append("No prediction data available yet.\n");
        }

        return sb.toString();
    }

    public String getTeamSummary() {
        log.debug("Function call: getTeamSummary() for user: {}", currentUser.getUserId());

        List<Employee> teamEmployees;
        String managerLabel;

        if (currentUser.isHrAdmin()) {
            teamEmployees = employeeRepository.findByActiveTrue();
            managerLabel = "All Employees (HR Admin view)";
        } else {
            String managerId = currentUser.getUserId();
            teamEmployees = employeeRepository.findByManagerIdAndActiveTrue(managerId);
            managerLabel = "Manager: " + managerId;
        }

        int totalCount = teamEmployees.size();
        long highRiskCount = 0;
        double totalExposure = 0;
        List<String> highRiskNames = new ArrayList<>();

        for (Employee emp : teamEmployees) {
            Optional<Prediction> predOpt = predictionRepository.findLatestByEmployeeId(emp.getId());
            if (predOpt.isPresent()) {
                Prediction pred = predOpt.get();
                if ("high".equalsIgnoreCase(pred.getRiskBand())) {
                    highRiskCount++;
                    highRiskNames.add(emp.getName() + " (" + pred.getRiskScore() + "%)");
                    if (pred.getReplacementCost() != null) {
                        totalExposure += pred.getReplacementCost().doubleValue();
                    }
                }
            }
        }

        StringBuilder sb = new StringBuilder();
        sb.append("Team Summary — ").append(managerLabel).append("\n");
        sb.append("Total Employees: ").append(totalCount).append("\n");
        sb.append("High Risk Count: ").append(highRiskCount).append("\n");
        sb.append("Total Attrition Cost Exposure: $").append(String.format("%,.0f", totalExposure)).append("\n");
        if (!highRiskNames.isEmpty()) {
            sb.append("High Risk Employees: ").append(String.join(", ", highRiskNames)).append("\n");
        }

        return sb.toString();
    }

    /** Get employees accessible to the current user based on role */
    private List<Employee> getAccessibleEmployees() {
        if (currentUser.isHrAdmin()) {
            return employeeRepository.findByActiveTrue();
        }
        return employeeRepository.findByManagerIdAndActiveTrue(currentUser.getUserId());
    }

    /** Find employee with role-scoped access */
    private Optional<Employee> findEmployeeScoped(String employeeId) {
        if (currentUser.isHrAdmin()) {
            return employeeRepository.findById(employeeId);
        }
        return employeeRepository.findByIdAndManagerId(employeeId, currentUser.getUserId());
    }

    /**
     * Extract employee IDs (EMP-XXXXX pattern) from the response text.
     */
    private List<String> extractEmployeeIds(String text) {
        if (text == null) return List.of();
        List<String> ids = new ArrayList<>();
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("EMP-\\d+").matcher(text);
        while (matcher.find()) {
            ids.add(matcher.group());
        }
        return ids.stream().distinct().toList();
    }
}
