package com.retainai.backend.dto;

/** POST /api/upload/{batchId}/confirm response */
public record ConfirmMappingResponse(String status, int employeesProcessed) {}
