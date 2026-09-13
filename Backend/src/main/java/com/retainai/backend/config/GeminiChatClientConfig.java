package com.retainai.backend.config;

import io.netty.resolver.DefaultAddressResolverGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

/**
 * Configuration for the HTTP client used by Spring AI's Google GenAI integration.
 *
 * Fixes:
 * - Windows DNS resolution: Reactor Netty's async DNS resolver fails on Windows.
 *   Using DefaultAddressResolverGroup forces Netty to use JVM's system DNS resolver.
 * - Large response buffer: Gemini responses (especially structured output) can exceed
 *   the default 256KB in-memory buffer.
 */
@Configuration
public class GeminiChatClientConfig {

    private static final Logger log = LoggerFactory.getLogger(GeminiChatClientConfig.class);

    /**
     * Provide a custom WebClient.Builder that Spring AI will pick up for its
     * Google GenAI HTTP calls. The key fix is the DNS resolver for Windows.
     */
    @Bean
    public WebClient.Builder webClientBuilder() {
        log.info("Configuring WebClient with Windows DNS fix (DefaultAddressResolverGroup)");

        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE);

        return WebClient.builder()
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(16 * 1024 * 1024)); // 16MB buffer for large AI responses
    }
}
