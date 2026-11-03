package com.gnt.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Stops startup with one plain sentence when a required setting is missing, instead of a long
 * database or security stack trace further down. Runs after all configuration (including
 * backend/.env and platform environment variables) has been loaded.
 */
public class RequiredSettingsCheck implements EnvironmentPostProcessor {

    private static final Map<String, String> REQUIRED = Map.of(
            "spring.datasource.url", "DB_URL",
            "spring.datasource.username", "DB_USERNAME",
            "application.jwt.secret", "JWT_SECRET");

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        List<String> missing = new ArrayList<>();
        REQUIRED.forEach((property, variable) -> {
            String value;
            try {
                value = environment.getProperty(property);
            } catch (IllegalArgumentException unresolved) {
                value = null;
            }
            if (value == null || value.isBlank()) {
                missing.add(variable);
            }
        });

        if (!missing.isEmpty()) {
            missing.sort(String::compareTo);
            throw new IllegalStateException("Missing required setting(s): " + String.join(", ", missing)
                    + ". Set them as environment variables (on Render: service → Environment), "
                    + "or in backend/.env for local development. See README → Configuration.");
        }
    }
}
