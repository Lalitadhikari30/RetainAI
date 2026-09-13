package com.retainai.backend.dto;

import java.util.List;

/** Copilot chat response */
public record CopilotChatResponse(String reply, List<String> referencedEmployeeIds) {}
