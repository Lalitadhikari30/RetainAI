package com.retainai.backend.controller;

import com.retainai.backend.dto.CopilotChatRequest;
import com.retainai.backend.dto.CopilotChatResponse;
import com.retainai.backend.service.CopilotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping({"/api/copilot", "/api/v1/copilot"})
@CrossOrigin(origins = "*")
public class CopilotController {

    private final CopilotService copilotService;

    public CopilotController(CopilotService copilotService) {
        this.copilotService = copilotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<CopilotChatResponse> chat(@RequestBody CopilotChatRequest request) {
        CopilotService.CopilotResponse response = copilotService.chat(request.message());
        return ResponseEntity.ok(new CopilotChatResponse(response.reply(), response.referencedEmployeeIds()));
    }

    @GetMapping("/messages")
    public ResponseEntity<List<Map<String, Object>>> getInitialMessages() {
        return ResponseEntity.ok(List.of(
            Map.of(
                "id", "msg-1",
                "sender", "assistant",
                "timestamp", "Today • System",
                "text", "Welcome to RetainAI Copilot. How can I assist you with team attrition analysis, flight risk factors, or retention actions today?"
            )
        ));
    }
}
