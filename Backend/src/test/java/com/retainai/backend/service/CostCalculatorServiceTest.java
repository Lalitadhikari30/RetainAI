package com.retainai.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class CostCalculatorServiceTest {

    private CostCalculatorService costCalculatorService;

    @BeforeEach
    void setUp() {
        costCalculatorService = new CostCalculatorService();
    }

    @Test
    void testEstimateReplacementCostStandard() {
        BigDecimal salary = new BigDecimal("100000.00");
        BigDecimal cost = costCalculatorService.estimateReplacementCost(salary);

        // Default multiplier is 1.5 -> 150,000.00
        assertEquals(0, new BigDecimal("150000.00").compareTo(cost));
    }

    @Test
    void testEstimateReplacementCostNull() {
        BigDecimal cost = costCalculatorService.estimateReplacementCost(null);
        assertEquals(BigDecimal.ZERO, cost);
    }
}
