package com.retainai.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI Schema Mapper Service — uses Spring AI ChatClient with structured output
 * to intelligently map CSV column headers to the canonical RetainAI schema.
 *
 * Uses Spring AI's `.entity()` for automatic deserialization — the LLM returns
 * a typed SchemaMappingResult directly, not raw JSON text to parse manually.
 */
@Service
public class SchemaMapperService {

    private static final Logger log = LoggerFactory.getLogger(SchemaMapperService.class);

    private final ChatClient chatClient;

    /** The canonical field names that RetainAI expects */
    public static final List<String> CANONICAL_FIELDS = List.of(
            "EmployeeNumber", "FullName", "Department", "MonthlyIncome",
            "OverTime", "JobSatisfaction", "YearsAtCompany",
            "YearsSinceLastPromotion", "DistanceFromHome",
            "WorkLifeBalance", "PerformanceRating"
    );

    /** Required fields that MUST be mapped for a valid upload */
    public static final List<String> REQUIRED_FIELDS = List.of(
            "EmployeeNumber", "FullName", "Department", "MonthlyIncome"
    );

    public SchemaMapperService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    // Structured output records — Spring AI auto-deserializes LLM response
    public record SchemaMappingResult(List<ColumnMapping> mappings) {}

    public record ColumnMapping(
        String sourceColumn,
        String mappedTo,
        String confidence
    ) {}

    /**
     * Use Spring AI to suggest column mappings from CSV headers to canonical schema.
     *
     * @param csvHeaders   Raw column headers from the uploaded CSV
     * @param sampleRows   First few rows of data for context
     * @return List of suggested mappings with confidence levels
     */
    public List<ColumnMapping> suggestMappings(List<String> csvHeaders, List<List<String>> sampleRows) {
        String sampleData = sampleRows.stream()
                .limit(3)
                .map(row -> String.join(", ", row))
                .collect(Collectors.joining("\n"));

        String prompt = """
            IMPORTANT: Respond with valid JSON only. Do NOT wrap the response in markdown
            code blocks or backticks. Return raw JSON directly.

            You are a data schema mapping assistant. Map the following CSV column headers
            to the RetainAI canonical schema fields.

            CSV Headers: %s

            Sample data (first 3 rows):
            %s

            Canonical schema fields to map to:
            %s

            For each CSV header, determine:
            1. "sourceColumn": the original CSV header name
            2. "mappedTo": the canonical field name it maps to, or null if no match
            3. "confidence": "high" if exact/near-exact match, "medium" if semantically similar,
               "low" if uncertain

            Return ALL CSV headers, even those with no match (set mappedTo to null for those).
            """.formatted(
                String.join(", ", csvHeaders),
                sampleData,
                String.join(", ", CANONICAL_FIELDS)
        );

        try {
            log.debug("Requesting AI schema mapping for headers: {}", csvHeaders);

            SchemaMappingResult result = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .entity(SchemaMappingResult.class);

            if (result != null && result.mappings() != null) {
                log.debug("AI schema mapping returned {} mappings", result.mappings().size());
                return result.mappings();
            }
        } catch (Throwable e) {
            log.warn("AI schema mapping failed or unavailable, falling back to heuristic matching: {}", e.getMessage());
        }

        // Fallback: intelligent heuristic string matching
        return fallbackFuzzyMatch(csvHeaders);
    }

    /**
     * Fallback heuristic string matching when AI is unavailable.
     * Uses substring and token-based matching.
     */
    public List<ColumnMapping> fallbackFuzzyMatch(List<String> csvHeaders) {
        log.info("Using fallback heuristic matching for {} headers", csvHeaders.size());

        Map<String, String> knownPatterns = new LinkedHashMap<>();
        knownPatterns.put("employee_number", "EmployeeNumber");
        knownPatterns.put("employeenumber", "EmployeeNumber");
        knownPatterns.put("emp_id", "EmployeeNumber");
        knownPatterns.put("employee_id", "EmployeeNumber");
        knownPatterns.put("id_num", "EmployeeNumber");
        knownPatterns.put("full_name", "FullName");
        knownPatterns.put("fullname", "FullName");
        knownPatterns.put("name", "FullName");
        knownPatterns.put("team", "Department");
        knownPatterns.put("dept", "Department");
        knownPatterns.put("department", "Department");
        knownPatterns.put("monthly_income", "MonthlyIncome");
        knownPatterns.put("monthlyincome", "MonthlyIncome");
        knownPatterns.put("base_salary", "MonthlyIncome");
        knownPatterns.put("salary", "MonthlyIncome");
        knownPatterns.put("income", "MonthlyIncome");
        knownPatterns.put("pay", "MonthlyIncome");
        knownPatterns.put("extra_hours", "OverTime");
        knownPatterns.put("over_time", "OverTime");
        knownPatterns.put("overtime", "OverTime");
        knownPatterns.put("ot_hrs", "OverTime");
        knownPatterns.put("job_satisfaction", "JobSatisfaction");
        knownPatterns.put("jobsatisfaction", "JobSatisfaction");
        knownPatterns.put("satisfaction", "JobSatisfaction");
        knownPatterns.put("years_at_company", "YearsAtCompany");
        knownPatterns.put("yearsatcompany", "YearsAtCompany");
        knownPatterns.put("years_at", "YearsAtCompany");
        knownPatterns.put("tenure", "YearsAtCompany");
        knownPatterns.put("last_promotion", "YearsSinceLastPromotion");
        knownPatterns.put("promo", "YearsSinceLastPromotion");
        knownPatterns.put("distance_from_home", "DistanceFromHome");
        knownPatterns.put("distancefromhome", "DistanceFromHome");
        knownPatterns.put("commute_distance", "DistanceFromHome");
        knownPatterns.put("commute", "DistanceFromHome");
        knownPatterns.put("distance", "DistanceFromHome");
        knownPatterns.put("work_life", "WorkLifeBalance");
        knownPatterns.put("worklife", "WorkLifeBalance");
        knownPatterns.put("performance", "PerformanceRating");

        return csvHeaders.stream().map(header -> {
            String lower = header.toLowerCase().replace(" ", "_").replace("-", "_").trim();
            for (var entry : knownPatterns.entrySet()) {
                if (lower.contains(entry.getKey())) {
                    return new ColumnMapping(header, entry.getValue(), "high");
                }
            }
            return new ColumnMapping(header, null, "low");
        }).toList();
    }

    /**
     * Determine which required fields are missing from the mapping.
     */
    public List<String> findMissingRequiredFields(List<ColumnMapping> mappings) {
        Set<String> mappedFields = mappings.stream()
                .filter(m -> m.mappedTo() != null)
                .map(ColumnMapping::mappedTo)
                .collect(Collectors.toSet());

        return REQUIRED_FIELDS.stream()
                .filter(f -> !mappedFields.contains(f))
                .toList();
    }
}
