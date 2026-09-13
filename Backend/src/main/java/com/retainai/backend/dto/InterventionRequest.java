package com.retainai.backend.dto;

/** POST /api/employees/{id}/interventions request */
public record InterventionRequest(String actionTaken, String dateTaken) {}
