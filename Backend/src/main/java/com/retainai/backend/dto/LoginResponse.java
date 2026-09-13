package com.retainai.backend.dto;

/** POST /api/auth/login response */
public record LoginResponse(String token, String role, String name) {}
