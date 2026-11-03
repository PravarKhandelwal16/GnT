package com.gnt.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

/** Serves files written by LocalMediaService. */
@Configuration
@ConditionalOnExpression("'${imagekit.private-key:}'.isBlank()")
public class LocalMediaConfig implements WebMvcConfigurer {

    @Value("${application.media.local-dir}")
    private String directory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // The trailing slash matters: without it, a folder that doesn't exist yet is treated as a file.
        String location = Path.of(directory).toAbsolutePath().normalize().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location.endsWith("/") ? location : location + "/");
    }
}
