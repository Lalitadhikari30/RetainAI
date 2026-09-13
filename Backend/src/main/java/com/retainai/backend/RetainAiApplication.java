package com.retainai.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class RetainAiApplication {

    public static void main(String[] args) {
        SpringApplication.run(RetainAiApplication.class, args);
    }
}
