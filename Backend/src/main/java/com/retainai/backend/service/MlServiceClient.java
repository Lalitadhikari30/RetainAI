package com.retainai.backend.service;

import com.retainai.backend.exception.MlServiceException;
import io.netty.resolver.DefaultAddressResolverGroup;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Client for the Python FastAPI ML prediction microservice.
 * Calls POST /predict with employee features, receives risk score + feature importances.
 */
@Service
public class MlServiceClient {

    private static final Logger log = LoggerFactory.getLogger(MlServiceClient.class);

    private final WebClient webClient;
    private final int timeoutSeconds;

    public MlServiceClient(
            @Value("${retainai.ml-service.url}") String baseUrl,
            @Value("${retainai.ml-service.timeout-seconds}") int timeoutSeconds) {
        // Windows DNS fix: use JVM system DNS resolver instead of Netty's async resolver
        HttpClient httpClient = HttpClient.create()
                .resolver(DefaultAddressResolverGroup.INSTANCE);
        this.webClient = WebClient.builder()
                .baseUrl(baseUrl)
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .build();
        this.timeoutSeconds = timeoutSeconds;
    }

    /**
     * Call the ML service to get a prediction.
     *
     * @param features  Map of canonical feature names to values
     * @param modelType "full" or "reduced"
     * @return Prediction result map with riskScore, riskBand, featureImportances, modelUsed
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> predict(Map<String, Object> features, String modelType) {
        try {
            Map<String, Object> request = Map.of(
                    "features", features,
                    "model_type", modelType
            );

            log.debug("Calling ML service with model_type={}, features={}", modelType, features.keySet());

            Map<String, Object> response = webClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .onErrorResume(e -> {
                        log.error("ML service error: {}", e.getMessage());
                        return Mono.error(new MlServiceException(
                                "ML prediction service unavailable: " + e.getMessage(), e));
                    })
                    .block();

            if (response == null) {
                throw new MlServiceException("ML service returned null response");
            }

            log.debug("ML service response: riskScore={}, modelUsed={}",
                    response.get("risk_score"), response.get("model_used"));

            return response;

        } catch (MlServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new MlServiceException("Failed to call ML prediction service: " + e.getMessage(), e);
        }
    }

    /**
     * Health check for the ML service.
     */
    public boolean isHealthy() {
        try {
            Map<String, Object> response = webClient.get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(5))
                    .block();
            return response != null && "healthy".equals(response.get("status"));
        } catch (Exception e) {
            log.warn("ML service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Determine which model to use based on available fields.
     * Full model requires all ~20 features; reduced model needs only 5 core features.
     */
    public String determineModelType(Map<String, Object> features) {
        // Core fields required for ANY prediction
        List<String> coreFields = List.of("MonthlyIncome", "OverTime", "YearsAtCompany");
        boolean hasCore = coreFields.stream().allMatch(features::containsKey);

        if (!hasCore) {
            throw new IllegalArgumentException(
                    "Cannot predict: missing core fields " +
                    coreFields.stream().filter(f -> !features.containsKey(f)).toList());
        }

        // Extended fields needed for full model
        List<String> fullFields = List.of(
                "MonthlyIncome", "OverTime", "YearsAtCompany", "Department",
                "DistanceFromHome", "JobSatisfaction", "YearsSinceLastPromotion",
                "WorkLifeBalance", "PerformanceRating"
        );
        boolean hasAllFullFields = fullFields.stream().allMatch(features::containsKey);

        return hasAllFullFields ? "full" : "reduced";
    }
}
