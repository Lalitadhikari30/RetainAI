package com.retainai.backend.dto;

import java.util.List;

/** POST /api/upload/{batchId}/confirm request */
public record ConfirmMappingRequest(
    List<MappingEntry> confirmedMapping
) {
    public record MappingEntry(String sourceColumn, String mappedTo) {}
}
