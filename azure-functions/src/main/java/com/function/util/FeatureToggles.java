package com.function.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.Properties;

public enum FeatureToggles {
    INSTANCE;

    final Properties features = new Properties();

    FeatureToggles() {
        String environment = Optional.ofNullable(System.getenv("ENVIRONMENT_NAME")).orElse("production");
        try (InputStream input = FeatureToggles.class.getResourceAsStream("/feature-toggles." + environment + ".properties")) {
            features.load(input);
        } catch (IOException ex) {
            // Ignore the exception, no way to log unless the executionContext is passed on every reference to FeatureToggles
        }

    }

    public boolean isFeatureActive(String feature) {
        return Boolean.parseBoolean(features.getProperty(feature, "false"));
    }
}
