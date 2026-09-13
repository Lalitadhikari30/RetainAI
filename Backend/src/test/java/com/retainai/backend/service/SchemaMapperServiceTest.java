package com.retainai.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.ai.chat.client.ChatClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SchemaMapperServiceTest {

    private SchemaMapperService schemaMapperService;

    @BeforeEach
    void setUp() {
        ChatClient.Builder mockBuilder = Mockito.mock(ChatClient.Builder.class);
        ChatClient mockChatClient = Mockito.mock(ChatClient.class);
        Mockito.when(mockBuilder.build()).thenReturn(mockChatClient);

        schemaMapperService = new SchemaMapperService(mockBuilder);
    }

    @Test
    void testFallbackFuzzyMatching() {
        List<String> headers = List.of("emp_id", "full_name", "department", "salary", "unknown_col");
        List<SchemaMapperService.ColumnMapping> mappings = schemaMapperService.fallbackFuzzyMatch(headers);

        assertEquals(5, mappings.size());

        var empIdMap = mappings.stream().filter(m -> m.sourceColumn().equals("emp_id")).findFirst().orElseThrow();
        assertEquals("EmployeeNumber", empIdMap.mappedTo());
        assertEquals("high", empIdMap.confidence());

        var nameMap = mappings.stream().filter(m -> m.sourceColumn().equals("full_name")).findFirst().orElseThrow();
        assertEquals("FullName", nameMap.mappedTo());

        var deptMap = mappings.stream().filter(m -> m.sourceColumn().equals("department")).findFirst().orElseThrow();
        assertEquals("Department", deptMap.mappedTo());

        var salaryMap = mappings.stream().filter(m -> m.sourceColumn().equals("salary")).findFirst().orElseThrow();
        assertEquals("MonthlyIncome", salaryMap.mappedTo());

        var unknownMap = mappings.stream().filter(m -> m.sourceColumn().equals("unknown_col")).findFirst().orElseThrow();
        assertNull(unknownMap.mappedTo());
        assertEquals("low", unknownMap.confidence());
    }

    @Test
    void testFindMissingRequiredFields() {
        List<SchemaMapperService.ColumnMapping> partialMappings = List.of(
                new SchemaMapperService.ColumnMapping("emp_id", "EmployeeNumber", "high"),
                new SchemaMapperService.ColumnMapping("name", "FullName", "high")
        );

        List<String> missing = schemaMapperService.findMissingRequiredFields(partialMappings);
        assertTrue(missing.contains("Department"));
        assertTrue(missing.contains("MonthlyIncome"));
        assertFalse(missing.contains("EmployeeNumber"));
        assertFalse(missing.contains("FullName"));
    }

    @Test
    void testUploadMissingSatisfactionColumns() {
        // Columns matching the user's uploaded file: test-upload-missing-satisfaction.csv
        List<String> headers = List.of("emp_id", "team", "pay", "extra_hours", "tenure", "commute_distance");
        List<SchemaMapperService.ColumnMapping> mappings = schemaMapperService.fallbackFuzzyMatch(headers);

        assertEquals(6, mappings.size());

        var empMap = mappings.stream().filter(m -> m.sourceColumn().equals("emp_id")).findFirst().orElseThrow();
        assertEquals("EmployeeNumber", empMap.mappedTo());

        var teamMap = mappings.stream().filter(m -> m.sourceColumn().equals("team")).findFirst().orElseThrow();
        assertEquals("Department", teamMap.mappedTo());

        var payMap = mappings.stream().filter(m -> m.sourceColumn().equals("pay")).findFirst().orElseThrow();
        assertEquals("MonthlyIncome", payMap.mappedTo());

        var otMap = mappings.stream().filter(m -> m.sourceColumn().equals("extra_hours")).findFirst().orElseThrow();
        assertEquals("OverTime", otMap.mappedTo());

        var tenureMap = mappings.stream().filter(m -> m.sourceColumn().equals("tenure")).findFirst().orElseThrow();
        assertEquals("YearsAtCompany", tenureMap.mappedTo());

        var commuteMap = mappings.stream().filter(m -> m.sourceColumn().equals("commute_distance")).findFirst().orElseThrow();
        assertEquals("DistanceFromHome", commuteMap.mappedTo());

        // Satisfaction is missing
        List<String> missing = schemaMapperService.findMissingRequiredFields(mappings);
        // Note: FullName is also missing from this CSV, so findMissingRequiredFields should detect FullName
        assertTrue(missing.contains("FullName"));
    }
}
