package com.retainai.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Simple cost-of-attrition calculator.
 * Formula: annual salary × configurable multiplier (default 1.5).
 */
@Service
public class CostCalculatorService {

    private final double multiplier;

    public CostCalculatorService() {
        this(1.5);
    }

    public CostCalculatorService(@Value("${retainai.cost.replacement-multiplier:1.5}") double multiplier) {
        this.multiplier = multiplier;
    }

    public BigDecimal estimateReplacementCost(BigDecimal annualSalary) {
        if (annualSalary == null) return BigDecimal.ZERO;
        return annualSalary.multiply(BigDecimal.valueOf(multiplier))
                .setScale(0, RoundingMode.HALF_UP);
    }
}
