package com.retainai.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class MlServiceClientTest {

    private MlServiceClient mlServiceClient;

    @BeforeEach
    void setUp() {
        mlServiceClient = new MlServiceClient("http://localhost:8000", 5);
    }

    @Test
    void testDetermineModelTypeReduced() {
        Map<String, Object> features = new HashMap<>();
        features.put("MonthlyIncome", 6000);
        features.put("OverTime", "Yes");
        features.put("YearsAtCompany", 3);

        String modelType = mlServiceClient.determineModelType(features);
        assertEquals("reduced", modelType);
    }

    @Test
    void testDetermineModelTypeFull() {
        Map<String, Object> features = new HashMap<>();
        features.put("MonthlyIncome", 6000);
        features.put("OverTime", "Yes");
        features.put("YearsAtCompany", 3);
        features.put("Department", "Engineering");
        features.put("DistanceFromHome", 12);
        features.put("JobSatisfaction", 4);
        features.put("YearsSinceLastPromotion", 2);
        features.put("WorkLifeBalance", 3);
        features.put("PerformanceRating", 3);

        String modelType = mlServiceClient.determineModelType(features);
        assertEquals("full", modelType);
    }

    @Test
    void testDetermineModelTypeMissingCoreThrows() {
        Map<String, Object> features = new HashMap<>();
        features.put("Department", "Engineering");

        assertThrows(IllegalArgumentException.class, () -> {
            mlServiceClient.determineModelType(features);
        });
    }
}
