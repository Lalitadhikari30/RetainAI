package com.retainai.backend.dto;

/** POST /api/auth/login request */
public record LoginRequest(String email, String password) {}
