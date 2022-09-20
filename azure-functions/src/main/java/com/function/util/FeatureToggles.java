package com.function.util;

import java.io.IOException;
import java.io.InputStream;
import java.util.Optional;
import java.util.Properties;
import java.util.logging.Logger;

public enum FeatureToggles {
    INSTANCE;

    final private Properties features = new Properties();
    final private Logger logger = Logger.getLogger(FeatureToggles.class.getName());

    FeatureToggles() {
        String environment = Optional.ofNullable(System.getenv("ENVIRONMENT_NAME")).orElse("production");
        try (InputStream input = FeatureToggles.class.getResourceAsStream("/feature-toggles/feature-toggles." + environment + ".properties")) {
            features.load(input);
        } catch (IOException ex) {
            logger.warning("Could not load the feature toggles for " + environment);
        }

    }

    public boolean isFeatureActive(String feature) {
        return Boolean.parseBoolean(features.getProperty(feature, "false"));
    }
}
