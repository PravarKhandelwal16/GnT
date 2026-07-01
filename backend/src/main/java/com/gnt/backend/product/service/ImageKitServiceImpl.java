package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.MediaType;
import io.imagekit.sdk.ImageKit;
import io.imagekit.sdk.models.FileCreateRequest;
import io.imagekit.sdk.models.results.Result;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ImageKitServiceImpl implements ImageKitService {

    private final ImageKit imageKit;

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/quicktime", "video/webm"
    );

    public ImageKitServiceImpl(ImageKit imageKit) {
        this.imageKit = imageKit;
    }

    @Override
    public UploadResult uploadMedia(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot upload an empty file");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("File content type is unknown");
        }

        MediaType mediaType;
        if (ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            mediaType = MediaType.IMAGE;
            if (file.getSize() > MAX_IMAGE_SIZE) {
                throw new IllegalArgumentException("Image size exceeds the maximum limit of 5MB");
            }
        } else if (ALLOWED_VIDEO_TYPES.contains(contentType.toLowerCase())) {
            mediaType = MediaType.VIDEO;
            if (file.getSize() > MAX_VIDEO_SIZE) {
                throw new IllegalArgumentException("Video size exceeds the maximum limit of 50MB");
            }
        } else {
            throw new IllegalArgumentException("Unsupported media type: " + contentType);
        }

        try {
            byte[] bytes = file.getBytes();
            FileCreateRequest request = new FileCreateRequest(bytes, UUID.randomUUID().toString() + "_" + file.getOriginalFilename());
            request.setFolder("/gnt/products");
            
            Result result = imageKit.upload(request);
            if (result == null || result.getUrl() == null) {
                throw new RuntimeException("ImageKit upload failed");
            }
            
            return new UploadResult(result.getUrl(), result.getFileId(), mediaType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload media to ImageKit: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteMedia(String fileId) {
        if (fileId == null || fileId.trim().isEmpty()) {
            return;
        }
        try {
            imageKit.deleteFile(fileId);
        } catch (Exception e) {
            throw new RuntimeException("Failed to delete media from ImageKit: " + e.getMessage(), e);
        }
    }
}
