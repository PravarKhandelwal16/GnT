package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.MediaType;
import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@ConditionalOnExpression("!'${imagekit.private-key:}'.isBlank()")
public class ImageKitServiceImpl implements ImageKitService {

    private static final Logger log = LoggerFactory.getLogger(ImageKitServiceImpl.class);

    private final ImageKit imageKit;

    public ImageKitServiceImpl(ImageKit imageKit) {
        this.imageKit = imageKit;
    }

    @Override
    public UploadResult uploadMedia(MultipartFile file) {
        MediaType mediaType = MediaRules.validate(file);
        try {
            String fileName = UUID.randomUUID() + "." + MediaRules.extensionFor(file);
            FileCreateRequest request = new FileCreateRequest(file.getBytes(), fileName);
            request.setFolder("/gnt/products");

            Result result = imageKit.upload(request);
            if (result == null || result.getUrl() == null) {
                throw new IllegalStateException("ImageKit returned no URL");
            }
            return new UploadResult(result.getUrl(), result.getFileId(), mediaType);
        } catch (Exception e) {
            log.error("ImageKit upload failed", e);
            throw new IllegalStateException("Failed to upload media", e);
        }
    }

    @Override
    public void deleteMedia(String fileId) {
        if (fileId == null || fileId.isBlank()) {
            return;
        }
        try {
            imageKit.deleteFile(fileId);
        } catch (Exception e) {
            // An orphaned remote file must not undo the user's change.
            log.warn("Could not delete ImageKit file {}: {}", fileId, e.getMessage());
        }
    }
}
