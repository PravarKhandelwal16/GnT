package com.gnt.backend.config;

import java.util.Arrays;
import java.util.List;

/** Hosting platforms often supply a bare host name; browsers need a full https:// origin. */
public final class PublicUrls {

    private PublicUrls() {
    }

    public static String withScheme(String value) {
        String trimmed = value.trim();
        if (trimmed.isEmpty() || trimmed.contains("://")) {
            return stripTrailingSlash(trimmed);
        }
        return "https://" + stripTrailingSlash(trimmed);
    }

    public static List<String> origins(String commaSeparated) {
        return Arrays.stream(commaSeparated.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .map(PublicUrls::withScheme)
                .toList();
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
