package com.gnt.backend.product.controller;

import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import com.gnt.backend.product.service.ProductService;
import com.gnt.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @io.swagger.v3.oas.annotations.media.Content(encoding = @io.swagger.v3.oas.annotations.media.Encoding(name = "data", contentType = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)))
    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(
            @io.swagger.v3.oas.annotations.Parameter(content = @io.swagger.v3.oas.annotations.media.Content(mediaType = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)) @RequestPart("data") @Valid ProductRequest request,
            @RequestPart("files") java.util.List<org.springframework.web.multipart.MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        ProductResponse response = productService.createProduct(request, files, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProductListResponse>> getActiveProducts(
            @RequestParam(required = false) Category category,
            @RequestParam(required = false) Condition condition,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getActiveProducts(category, condition, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        Long userId = userPrincipal != null ? userPrincipal.getId() : null;
        return ResponseEntity.ok(productService.getProductById(id, userId));
    }

    @GetMapping("/me")
    public ResponseEntity<Page<ProductListResponse>> getMyProducts(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            Pageable pageable) {
        return ResponseEntity.ok(productService.getUserProducts(userPrincipal.getId(), pageable));
    }

    @io.swagger.v3.oas.annotations.parameters.RequestBody(content = @io.swagger.v3.oas.annotations.media.Content(encoding = @io.swagger.v3.oas.annotations.media.Encoding(name = "data", contentType = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)))
    @PutMapping(value = "/{id}", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.Parameter(content = @io.swagger.v3.oas.annotations.media.Content(mediaType = org.springframework.http.MediaType.APPLICATION_JSON_VALUE)) @RequestPart("data") @Valid ProductRequest request,
            @RequestPart(value = "files", required = false) java.util.List<org.springframework.web.multipart.MultipartFile> files,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        return ResponseEntity.ok(productService.updateProduct(id, request, files, userPrincipal.getId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        productService.deleteProduct(id, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }
}
