package com.retainai.backend.dto;

/** Consistent error response shape */
public record ErrorResponse(String error, String code) {}
