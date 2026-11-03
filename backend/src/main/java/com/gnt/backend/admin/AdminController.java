package com.gnt.backend.admin;

import com.gnt.backend.admin.AdminDtos.*;
import com.gnt.backend.domain.entity.CreditHistory;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.ReportStatus;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.TransactionStatus;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Staff API. The whole path requires MODERATOR or ADMIN (see SecurityConfig); endpoints that move
 * credits, change access or expose the audit log are additionally limited to ADMIN.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String OWNER_ONLY = "hasRole('ADMIN')";

    private final AdminService adminService;
    private final SampleListings sampleListings;

    public AdminController(AdminService adminService, SampleListings sampleListings) {
        this.adminService = adminService;
        this.sampleListings = sampleListings;
    }

    @GetMapping("/overview")
    public Overview overview() {
        return adminService.overview();
    }

    // ── Members ──────────────────────────────────────────────────────────────

    @GetMapping("/users")
    public Page<UserRow> users(@RequestParam(required = false) String query,
                               @RequestParam(required = false) UserStatus status,
                               @RequestParam(required = false) Role role,
                               @PageableDefault(size = 25) Pageable pageable) {
        return adminService.users(query, status, role, pageable);
    }

    @GetMapping("/users/{id}")
    public UserRow user(@PathVariable Long id) {
        return adminService.user(id);
    }

    @GetMapping("/users/{id}/credits")
    public Page<CreditHistory> credits(@PathVariable Long id, @PageableDefault(size = 25) Pageable pageable) {
        return adminService.credits(id, pageable);
    }

    @PostMapping("/users/{id}/suspend")
    public UserRow suspend(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                           @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.suspend(staff.getId(), id, request.reason());
    }

    @PostMapping("/users/{id}/reactivate")
    public UserRow reactivate(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                              @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.reactivate(staff.getId(), id, request.reason());
    }

    @PreAuthorize(OWNER_ONLY)
    @PostMapping("/users/{id}/credits")
    public UserRow adjustCredits(@PathVariable Long id, @Valid @RequestBody CreditAdjustmentRequest request,
                                 @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.adjustCredits(staff.getId(), id, request.amount(), request.reason());
    }

    @PreAuthorize(OWNER_ONLY)
    @PutMapping("/users/{id}/role")
    public UserRow changeRole(@PathVariable Long id, @Valid @RequestBody RoleRequest request,
                              @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.changeRole(staff.getId(), id, request.role(), request.reason());
    }

    // ── Listings ─────────────────────────────────────────────────────────────

    @GetMapping("/listings")
    public Page<ListingRow> listings(@RequestParam(required = false) String query,
                                     @RequestParam(required = false) ProductStatus status,
                                     @RequestParam(required = false) Long ownerId,
                                     @PageableDefault(size = 25) Pageable pageable) {
        return adminService.listings(query, status, ownerId, pageable);
    }

    @PostMapping("/listings/{id}/take-down")
    public ListingRow takeDown(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                               @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.takeDown(staff.getId(), id, request.reason());
    }

    @PostMapping("/listings/{id}/restore")
    public ListingRow restore(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                              @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.restore(staff.getId(), id, request.reason());
    }

    // ── Reports ──────────────────────────────────────────────────────────────

    @GetMapping("/reports")
    public Page<ReportRow> reports(@RequestParam(required = false) ReportStatus status,
                                   @PageableDefault(size = 25) Pageable pageable) {
        return adminService.reports(status, pageable);
    }

    @PostMapping("/reports/{id}/resolve")
    public ReportRow resolve(@PathVariable Long id, @Valid @RequestBody ResolveReportRequest request,
                             @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.resolveReport(staff.getId(), id, request.outcome(), request.note());
    }

    // ── Exchanges ────────────────────────────────────────────────────────────

    @GetMapping("/exchanges")
    public Page<ExchangeRow> exchanges(@RequestParam(required = false) TransactionStatus status,
                                       @RequestParam(required = false) Long userId,
                                       @PageableDefault(size = 25) Pageable pageable) {
        return adminService.exchanges(status, userId, pageable);
    }

    @PreAuthorize(OWNER_ONLY)
    @PostMapping("/exchanges/{id}/cancel")
    public ExchangeRow cancelExchange(@PathVariable Long id, @Valid @RequestBody ReasonRequest request,
                                      @AuthenticationPrincipal UserPrincipal staff) {
        return adminService.cancelExchange(staff.getId(), id, request.reason());
    }

    /** Lists the starter items under the calling owner. Safe to call more than once. */
    @PreAuthorize(OWNER_ONLY)
    @PostMapping("/sample-listings")
    public java.util.Map<String, Integer> addSampleListings(@AuthenticationPrincipal UserPrincipal staff) {
        return java.util.Map.of("created", sampleListings.addFor(staff.getId()));
    }

    // ── Audit ────────────────────────────────────────────────────────────────

    @PreAuthorize(OWNER_ONLY)
    @GetMapping("/audit")
    public Page<AuditRow> audit(@RequestParam(required = false) Long actorId,
                                @RequestParam(required = false) String targetType,
                                @RequestParam(required = false) Long targetId,
                                @PageableDefault(size = 50) Pageable pageable) {
        return adminService.audit(actorId, targetType, targetId, pageable);
    }
}
