package com.retainai.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * AI Explanation Service — uses Spring AI ChatClient with structured output
 * to generate natural language explanations and retention recommendations.
 *
 * This uses Spring AI's `.entity()` for automatic deserialization of the LLM's
 * response into typed Java records — no manual JSON parsing.
 */
@Service
public class ExplanationService {

    private static final Logger log = LoggerFactory.getLogger(ExplanationService.class);

    private final ChatClient chatClient;

    public ExplanationService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    // Structured output records — Spring AI auto-deserializes LLM response into these
    public record ExplanationResult(
        String copilotSummary,
        List<RecommendedAction> recommendedActions
    ) {}

    public record RecommendedAction(
        String id,
        String title,
        String impact,
        String note,
        String targetDays
    ) {}

    /**
     * Fast deterministic explanation generator for batch processing.
     * Uses ML model's feature importances and risk score to build an instant,
     * grounded explanation without calling external LLM APIs in a loop.
     */
    public ExplanationResult generateFastExplanation(String employeeName, String role,
                                                      String department, int riskScore,
                                                      String featureImportancesJson) {
        List<String> topDrivers = new ArrayList<>();
        try {
            if (featureImportancesJson != null && !featureImportancesJson.isBlank()) {
                com.fasterxml.jackson.databind.JsonNode root = objectMapper.readTree(featureImportancesJson);
                if (root.isArray()) {
                    for (var node : root) {
                        String feat = node.path("feature").asText("");
                        if (!feat.isBlank()) {
                            topDrivers.add(feat);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Failed parsing feature importances for fast explanation: {}", e.getMessage());
        }

        String primaryDriver = topDrivers.isEmpty() ? "overall engagement metrics" : topDrivers.get(0);
        String secondaryDriver = topDrivers.size() > 1 ? topDrivers.get(1) : null;

        String riskLevel = riskScore >= 70 ? "high flight risk" : riskScore >= 40 ? "moderate attrition risk" : "low retention risk";

        StringBuilder summary = new StringBuilder();
        summary.append(String.format("%s, currently serving as %s in %s, demonstrates a %s profile with a risk score of %d%%. ",
                employeeName, (role != null && !role.isBlank() ? role : "team member"), department, riskLevel, riskScore));

        if (secondaryDriver != null) {
            summary.append(String.format("The predictive model identifies %s and %s as the primary contributing drivers. ",
                    formatFeatureName(primaryDriver), formatFeatureName(secondaryDriver)));
        } else {
            summary.append(String.format("The primary contributing factor highlighted by the model is %s. ",
                    formatFeatureName(primaryDriver)));
        }

        if (riskScore >= 50) {
            summary.append("Immediate proactive outreach and workload/compensation review are recommended to mitigate turnover.");
        } else {
            summary.append("Standard quarterly milestone reviews and regular 1:1 touchpoints are advised to maintain retention.");
        }

        List<RecommendedAction> actions = new ArrayList<>();
        actions.add(createActionForDriver(primaryDriver, "rec-1", riskScore));
        if (secondaryDriver != null) {
            actions.add(createActionForDriver(secondaryDriver, "rec-2", riskScore));
        } else {
            actions.add(new RecommendedAction(
                    "rec-2",
                    "Conduct Quarterly Retention Sync",
                    riskScore >= 50 ? "High" : "Medium",
                    "Review long-term career aspirations and team dynamics.",
                    "Next 14 days"
            ));
        }

        return new ExplanationResult(summary.toString(), actions);
    }

    private String formatFeatureName(String raw) {
        if (raw == null) return "Engagement";
        return switch (raw.toLowerCase()) {
            case "overtime", "extra_hours", "over_time" -> "Overtime Hours & Workload Pressure";
            case "monthlyincome", "salary", "base_salary", "pay" -> "Compensation & Market Parity";
            case "distancefromhome", "commute", "commute_distance" -> "Daily Commute Distance";
            case "yearssincelastpromotion", "promo", "last_promotion" -> "Time Since Last Promotion (Career Stagnation)";
            case "jobsatisfaction", "satisfaction" -> "Job Satisfaction Rating";
            case "worklifebalance", "work_life" -> "Work-Life Balance Index";
            case "yearsatcompany", "tenure" -> "Company Tenure / Retention Horizon";
            default -> raw;
        };
    }

    private RecommendedAction createActionForDriver(String driver, String id, int riskScore) {
        String d = driver != null ? driver.toLowerCase() : "";
        if (d.contains("overtime") || d.contains("hour") || d.contains("work_life") || d.contains("worklife")) {
            return new RecommendedAction(
                    id,
                    "Workload Balancing & Overtime Audit",
                    riskScore >= 50 ? "Very High" : "High",
                    "Review project load, adjust sprint allocations, and evaluate compensatory time off.",
                    "Within 5 days"
            );
        } else if (d.contains("income") || d.contains("salary") || d.contains("pay")) {
            return new RecommendedAction(
                    id,
                    "Compensation & Equity Review",
                    "Very High",
                    "Benchmark current compensation against 75th percentile market rates for this band.",
                    "Next pay cycle"
            );
        } else if (d.contains("promotion") || d.contains("stagnat") || d.contains("role")) {
            return new RecommendedAction(
                    id,
                    "Career Milestone & Advancement Pathing",
                    riskScore >= 50 ? "High" : "Medium",
                    "Define concrete pathway and measurable criteria for next tier promotion.",
                    "Within 7 days"
            );
        } else if (d.contains("distance") || d.contains("commute")) {
            return new RecommendedAction(
                    id,
                    "Hybrid & Flexible Work Arrangement",
                    "Medium",
                    "Provide flexible remote-work days to alleviate commute fatigue.",
                    "Immediate"
            );
        } else {
            return new RecommendedAction(
                    id,
                    "Strategic 1:1 Retention Sync",
                    riskScore >= 50 ? "High" : "Medium",
                    "Schedule dedicated manager check-in to discuss role engagement and team support.",
                    "Within 3 days"
            );
        }
    }

    /**
     * Generate an AI explanation and recommended actions for an employee's risk profile.
     * Uses Spring AI structured output — the LLM returns typed ExplanationResult directly.
     */
    public ExplanationResult generateExplanation(String employeeName, String role,
                                                  String department, int riskScore,
                                                  String featureImportancesJson) {
        String prompt = """
            IMPORTANT: Respond with valid JSON only. Do NOT wrap the response in markdown
            code blocks or backticks. Return raw JSON directly.

            You are RetainAI, an HR analytics copilot. Generate a retention risk analysis
            for the following employee:

            Employee: %s
            Role: %s
            Department: %s
            Current Risk Score: %d%%

            Feature Importances (from ML model):
            %s

            Provide:
            1. A "copilotSummary" — a 3-4 sentence natural language explanation of why this
               employee is at risk, grounded in the feature importances. Write in third person,
               professional tone suitable for an HR dashboard.
            2. A list of 2-4 "recommendedActions" — concrete, specific retention interventions.
               Each action should have:
               - "id": a unique identifier like "rec-1"
               - "title": the action description (1-2 sentences)
               - "impact": one of "Very High", "High", or "Medium"
               - "note": brief supporting context
               - "targetDays": suggested timeline (e.g., "3 days", "1 week", "Next pay cycle")
            """.formatted(employeeName, role, department, riskScore, featureImportancesJson);

        try {
            log.debug("Generating AI explanation for employee: {}", employeeName);

            ExplanationResult result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .entity(ExplanationResult.class);

            log.debug("AI explanation generated successfully for: {}", employeeName);
            return result;

        } catch (Exception e) {
            log.error("AI explanation generation failed for {}: {}", employeeName, e.getMessage());
            // Fallback: return a generic explanation
            return new ExplanationResult(
                    String.format("%s in %s has a risk score of %d%%. Analysis is based on ML model feature importances.",
                            employeeName, department, riskScore),
                    List.of(new RecommendedAction(
                            "rec-fallback",
                            "Schedule a 1:1 retention conversation to discuss career growth and concerns.",
                            "High",
                            "AI explanation service temporarily unavailable — manual review recommended.",
                            "This week"
                    ))
            );
        }
    }
}
