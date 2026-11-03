package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.Locale;
import java.util.Map;

/** Upload rules shared by every media backend. */
final class MediaRules {

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024;

    private static final Map<String, String> IMAGE_EXTENSIONS = Map.of(
            "image/jpeg", "jpg", "image/jpg", "jpg", "image/png", "png", "image/webp", "webp");
    private static final Map<String, String> VIDEO_EXTENSIONS = Map.of(
            "video/mp4", "mp4", "video/quicktime", "mov", "video/webm", "webm");

    private MediaRules() {
    }

    /** Validates a file and returns its type. Throws IllegalArgumentException with a user-facing message. */
    static MediaType validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }
        String contentType = normalizedType(file);
        if (IMAGE_EXTENSIONS.containsKey(contentType)) {
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Images can be up to 5 MB");
            }
            return MediaType.IMAGE;
        }
        if (VIDEO_EXTENSIONS.containsKey(contentType)) {
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new IllegalArgumentException("Videos can be up to 50 MB");
            }
            return MediaType.VIDEO;
        }
        throw new IllegalArgumentException("Use JPG, PNG or WebP images, or MP4, MOV or WebM video");
    }

    static String extensionFor(MultipartFile file) {
        String contentType = normalizedType(file);
        return IMAGE_EXTENSIONS.getOrDefault(contentType, VIDEO_EXTENSIONS.get(contentType));
    }

    private static String normalizedType(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
    }
}
