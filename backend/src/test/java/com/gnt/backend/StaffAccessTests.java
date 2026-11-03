package com.gnt.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnt.backend.admin.StaffAuditLogRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.Category;
import com.gnt.backend.domain.enums.Condition;
import com.gnt.backend.domain.enums.ProductStatus;
import com.gnt.backend.domain.enums.Role;
import com.gnt.backend.domain.enums.UserStatus;
import com.gnt.backend.product.dto.ProductRequest;
import com.gnt.backend.product.dto.ProductResponse;
import com.gnt.backend.product.repository.ProductRepository;
import com.gnt.backend.product.service.ProductService;
import com.gnt.backend.report.dto.ReportRequest;
import com.gnt.backend.report.service.ReportService;
import com.gnt.backend.security.JwtService;
import com.gnt.backend.security.UserPrincipal;
import com.gnt.backend.transaction.dto.TransactionInitiateRequest;
import com.gnt.backend.transaction.dto.TransactionResponse;
import com.gnt.backend.transaction.repository.TransactionRepository;
import com.gnt.backend.transaction.service.TransactionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class StaffAccessTests {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ProductService productService;
    @Autowired private ReportService reportService;
    @Autowired private TransactionService transactionService;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private StaffAuditLogRepository auditRepository;

    private User owner;
    private User team;
    private User member;
    private User other;

    @BeforeEach
    void users() {
        owner = newUser(Role.ADMIN, 0);
        team = newUser(Role.MODERATOR, 0);
        member = newUser(Role.USER, 1000);
        other = newUser(Role.USER, 1000);
    }

    @Test
    void membersCannotReachTheStaffArea() throws Exception {
        mvc.perform(as(member, get("/api/admin/overview"))).andExpect(status().isForbidden());
        mvc.perform(get("/api/admin/overview")).andExpect(status().isUnauthorized());
        mvc.perform(as(team, get("/api/admin/overview"))).andExpect(status().isOk());
    }

    @Test
    void theTeamCannotMoveCreditsChangeRolesCancelExchangesOrReadTheAuditLog() throws Exception {
        mvc.perform(as(team, post("/api/admin/users/" + member.getId() + "/credits"), Map.of("amount", 50, "reason", "x")))
                .andExpect(status().isForbidden());
        mvc.perform(as(team, put("/api/admin/users/" + member.getId() + "/role"), Map.of("role", "MODERATOR", "reason", "x")))
                .andExpect(status().isForbidden());
        mvc.perform(as(team, post("/api/admin/exchanges/1/cancel"), Map.of("reason", "x")))
                .andExpect(status().isForbidden());
        mvc.perform(as(team, get("/api/admin/audit"))).andExpect(status().isForbidden());
        assertThat(balance(member)).isEqualTo(1000);
    }

    @Test
    void theOwnerCanAdjustCreditsAndItIsLedgeredAndAudited() throws Exception {
        long auditBefore = auditRepository.count();

        mvc.perform(as(owner, post("/api/admin/users/" + member.getId() + "/credits"), Map.of("amount", -200, "reason", "Duplicate signup bonus")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.creditBalance").value(800));
        mvc.perform(as(owner, post("/api/admin/users/" + member.getId() + "/credits"), Map.of("amount", -5000, "reason", "Too much")))
                .andExpect(status().isConflict());

        assertThat(balance(member)).isEqualTo(800);
        assertThat(auditRepository.count()).isEqualTo(auditBefore + 1);
        mvc.perform(as(owner, get("/api/admin/users/" + member.getId() + "/credits")))
                .andExpect(jsonPath("$.content[0].transactionType").value("MANUAL_ADJUSTMENT"));
    }

    @Test
    void suspendingAMemberHidesTheirListingsAndBlocksTheirLogin() throws Exception {
        ProductResponse listing = list(member, 100);
        String memberToken = token(member);

        mvc.perform(as(team, post("/api/admin/users/" + member.getId() + "/suspend"), Map.of("reason", "Spam")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        mvc.perform(get("/api/products/" + listing.id())).andExpect(status().isNotFound());
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + memberToken)).andExpect(status().isUnauthorized());

        mvc.perform(as(team, post("/api/admin/users/" + member.getId() + "/reactivate"), Map.of("reason", "Appeal accepted")))
                .andExpect(status().isOk());
        mvc.perform(get("/api/products/" + listing.id())).andExpect(status().isOk());
    }

    @Test
    void theTeamCannotSuspendStaff() throws Exception {
        mvc.perform(as(team, post("/api/admin/users/" + owner.getId() + "/suspend"), Map.of("reason", "x")))
                .andExpect(status().isForbidden());
    }

    @Test
    void resolvingAReportByRemovalTakesTheListingDownAndReversesItsReward() throws Exception {
        ProductResponse listing = list(member, 100);
        reportService.submitReport(new ReportRequest(listing.id(), "Prohibited item", ""), other.getId());
        long reportId = json.readTree(mvc.perform(as(team, get("/api/admin/reports").param("status", "OPEN")))
                .andReturn().getResponse().getContentAsString()).get("content").get(0).get("id").asLong();

        mvc.perform(as(team, post("/api/admin/reports/" + reportId + "/resolve"), Map.of("outcome", "TAKE_DOWN", "note", "Not allowed")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.resolvedByName").value(team.getName()));

        assertThat(productRepository.findById(listing.id()).orElseThrow().getStatus()).isEqualTo(ProductStatus.REJECTED);
        assertThat(balance(member)).isEqualTo(1000);

        mvc.perform(as(team, post("/api/admin/listings/" + listing.id() + "/restore"), Map.of("reason", "Reviewed again")))
                .andExpect(status().isOk());
        assertThat(balance(member)).isEqualTo(1040);
    }

    @Test
    void aReservedListingMustHaveItsExchangeCancelledBeforeRemoval() throws Exception {
        ProductResponse listing = list(member, 100);
        TransactionResponse tx = transactionService.initiateTransaction(new TransactionInitiateRequest(listing.id()), other.getId());

        mvc.perform(as(team, post("/api/admin/listings/" + listing.id() + "/take-down"), Map.of("reason", "x")))
                .andExpect(status().isConflict());

        String code = transactionRepository.findById(tx.id()).orElseThrow().getQrToken();
        transactionService.sellerConfirm(code, member.getId());
        mvc.perform(as(owner, post("/api/admin/exchanges/" + tx.id() + "/cancel"), Map.of("reason", "Item was not as described")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
        assertThat(balance(other)).isEqualTo(1000);

        mvc.perform(as(team, post("/api/admin/listings/" + listing.id() + "/take-down"), Map.of("reason", "x")))
                .andExpect(status().isOk());
    }

    @Test
    void theLastOwnerCannotBeDemotedButCanPromoteTheTeam() throws Exception {
        userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ADMIN && !u.getId().equals(owner.getId()))
                .forEach(u -> { u.setRole(Role.USER); userRepository.save(u); });

        mvc.perform(as(owner, put("/api/admin/users/" + owner.getId() + "/role"), Map.of("role", "USER", "reason", "x")))
                .andExpect(status().isConflict());
        mvc.perform(as(owner, put("/api/admin/users/" + member.getId() + "/role"), Map.of("role", "MODERATOR", "reason", "Joined support")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("MODERATOR"));
        mvc.perform(as(member, get("/api/admin/overview"))).andExpect(status().isOk());
        mvc.perform(as(owner, get("/api/admin/audit").param("targetType", "USER").param("targetId", member.getId().toString())))
                .andExpect(jsonPath("$.content[0].action").value("ROLE_CHANGED"));
    }

    @Test
    void theProfileTellsTheAppWhoIsStaff() throws Exception {
        mvc.perform(as(team, get("/api/users/me"))).andExpect(jsonPath("$.role").value("MODERATOR"));
        mvc.perform(as(member, get("/api/users/me"))).andExpect(jsonPath("$.role").value("USER"));
    }

    private MockHttpServletRequestBuilder as(User user, MockHttpServletRequestBuilder request) {
        return request.header("Authorization", "Bearer " + token(user));
    }

    private MockHttpServletRequestBuilder as(User user, MockHttpServletRequestBuilder request, Map<String, Object> body) throws Exception {
        return as(user, request).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body));
    }

    private String token(User user) {
        return jwtService.generateToken(new UserPrincipal(user));
    }

    private int balance(User user) {
        return userRepository.findById(user.getId()).orElseThrow().getCreditBalance();
    }

    private ProductResponse list(User owner, int value) {
        return productService.createProduct(
                new ProductRequest("Staff test item", "Description", Category.BOOKS, Condition.GOOD, value,
                        "1 Street", "Pune", "MH", "411001", "India"),
                List.of(new MockMultipartFile("files", "a.png", "image/png", new byte[]{1, 2, 3})),
                owner.getId());
    }

    private User newUser(Role role, int balance) {
        String unique = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        User user = new User();
        user.setName(role + " " + unique);
        user.setEmail(unique + "@example.test");
        user.setPhone(unique);
        user.setPassword("not-a-real-hash");
        user.setDateOfBirth(LocalDate.of(1990, 1, 1));
        user.setCreditBalance(balance);
        user.setStatus(UserStatus.ACTIVE);
        user.setRole(role);
        return userRepository.save(user);
    }
}
