package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.MediaType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/** Stores uploads on disk when ImageKit isn't configured, so local setups work without keys. */
@Service
@ConditionalOnExpression("'${imagekit.private-key:}'.isBlank()")
public class LocalMediaService implements ImageKitService {

    private static final Logger log = LoggerFactory.getLogger(LocalMediaService.class);

    private final Path directory;
    private final String publicBaseUrl;

    public LocalMediaService(@Value("${application.media.local-dir}") String directory,
                             @Value("${application.media.public-base-url}") String publicBaseUrl) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        this.publicBaseUrl = publicBaseUrl;
        log.info("ImageKit not configured; storing uploads in {}", this.directory);
    }

    @Override
    public UploadResult uploadMedia(MultipartFile file) {
        MediaType mediaType = MediaRules.validate(file);
        String fileName = UUID.randomUUID() + "." + MediaRules.extensionFor(file);
        try (InputStream in = file.getInputStream()) {
            Files.createDirectories(directory);
            Files.copy(in, directory.resolve(fileName));
        } catch (IOException e) {
            throw new IllegalStateException("Failed to store media", e);
        }
        return new UploadResult(publicBaseUrl + "/uploads/" + fileName, fileName, mediaType);
    }

    @Override
    public void deleteMedia(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return;
        }
        Path target = directory.resolve(fileId).normalize();
        if (!target.startsWith(directory)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException e) {
            log.warn("Could not delete {}: {}", target, e.getMessage());
        }
    }
}
