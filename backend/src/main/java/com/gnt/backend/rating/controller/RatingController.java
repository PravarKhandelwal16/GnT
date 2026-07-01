package com.gnt.backend.rating.controller;

import com.gnt.backend.rating.dto.RatingRequest;
import com.gnt.backend.rating.dto.RatingResponse;
import com.gnt.backend.rating.service.RatingService;
import com.gnt.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ratings")
public class RatingController {

    private final RatingService ratingService;

    public RatingController(RatingService ratingService) {
        this.ratingService = ratingService;
    }

    @PostMapping
    public ResponseEntity<RatingResponse> submitRating(
            @Valid @RequestBody RatingRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        RatingResponse response = ratingService.submitRating(request, userPrincipal.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<RatingResponse>> getUserRatings(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(ratingService.getUserRatings(userId, pageable));
    }
}
