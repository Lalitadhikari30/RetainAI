package com.retainai.backend.dto;

import java.util.List;

/** POST /api/upload/csv response */
public record UploadResponse(
    String batchId,
    List<String> headers,
    List<SuggestedMapping> suggestedMapping,
    List<String> missingRequiredFields
) {
    public record SuggestedMapping(
        String sourceColumn,
        String mappedTo,
        String confidence,
        String sampleValue,
        Boolean required
    ) {}
}
