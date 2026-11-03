package com.gnt.backend.saved;

import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.Product;
import com.gnt.backend.domain.entity.SavedProduct;
import com.gnt.backend.exception.ApiException;
import com.gnt.backend.product.dto.ProductListResponse;
import com.gnt.backend.product.mapper.ProductMapper;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/saved")
public class SavedProductController {

    private final SavedProductRepository savedProductRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    public SavedProductController(SavedProductRepository savedProductRepository,
                                  ProductRepository productRepository,
                                  UserRepository userRepository,
                                  ProductMapper productMapper) {
        this.savedProductRepository = savedProductRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.productMapper = productMapper;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public Page<ProductListResponse> list(@AuthenticationPrincipal UserPrincipal principal, Pageable pageable) {
        return savedProductRepository.findSavedProducts(principal.getId(), pageable)
                .map(productMapper::toListResponse);
    }

    @GetMapping("/ids")
    public List<Long> ids(@AuthenticationPrincipal UserPrincipal principal) {
        return savedProductRepository.findProductIds(principal.getId());
    }

    @PutMapping("/{productId}")
    @Transactional
    public ResponseEntity<Void> save(@PathVariable Long productId, @AuthenticationPrincipal UserPrincipal principal) {
        if (!savedProductRepository.existsByUserIdAndProductId(principal.getId(), productId)) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> ApiException.notFound("Product not found"));
            SavedProduct saved = new SavedProduct();
            saved.setUser(userRepository.getReferenceById(principal.getId()));
            saved.setProduct(product);
            savedProductRepository.save(saved);
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{productId}")
    @Transactional
    public ResponseEntity<Void> remove(@PathVariable Long productId, @AuthenticationPrincipal UserPrincipal principal) {
        savedProductRepository.deleteByUserIdAndProductId(principal.getId(), productId);
        return ResponseEntity.noContent().build();
    }
}
