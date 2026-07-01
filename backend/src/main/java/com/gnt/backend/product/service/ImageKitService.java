package com.gnt.backend.product.service;

import com.gnt.backend.domain.enums.MediaType;
import org.springframework.web.multipart.MultipartFile;

public interface ImageKitService {
    
    record UploadResult(String url, String fileId, MediaType type) {}

    /**
     * Validates and uploads a media file to ImageKit.
     * @param file The multipart file from the user
     * @return UploadResult containing URL, fileId, and MediaType
     */
    UploadResult uploadMedia(MultipartFile file);

    /**
     * Deletes a media file from ImageKit.
     * @param fileId The unique fileId returned by ImageKit during upload
     */
    void deleteMedia(String fileId);
}
