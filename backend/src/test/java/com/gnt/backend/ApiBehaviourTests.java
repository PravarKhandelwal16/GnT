package com.gnt.backend;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gnt.backend.auth.repository.PasswordResetTokenRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.PasswordResetToken;
import com.gnt.backend.domain.entity.User;
import com.gnt.backend.domain.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ApiBehaviourTests {

    @Autowired private MockMvc mvc;
    @Autowired private ObjectMapper json;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository resetTokenRepository;

    @Test
    void anOwnerEmailBecomesAnOwnerOnSignUpAndOthersDoNot() throws Exception {
        String ownerToken = register("First-Owner@example.test");
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + ownerToken))
                .andExpect(jsonPath("$.role").value("ADMIN"));
        mvc.perform(get("/api/admin/overview").header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isOk());

        String memberToken = register();
        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + memberToken))
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void apiDocsAreOffByDefault() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isNotFound());
    }

    @Test
    void myListingsRequireLoginInsteadOfCrashing() throws Exception {
        mvc.perform(get("/api/products/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void anInvalidCategoryIsABadRequest() throws Exception {
        mvc.perform(get("/api/products").param("category", "HOME_AND_GARDEN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void marketSearchFindsTitlesAndTreatsWildcardsLiterally() throws Exception {
        String token = register();
        createListing(token, "Vintage turntable");

        mvc.perform(get("/api/products").param("query", "TURNTABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].title").value("Vintage turntable"))
                .andExpect(jsonPath("$.content[0].city").value("Pune"));
        mvc.perform(get("/api/products").param("query", "%"))
                .andExpect(jsonPath("$.totalElements").value(0));
    }

    @Test
    void marketCanSortByCreditValue() throws Exception {
        String token = register();
        createListing(token, "First listing");

        mvc.perform(get("/api/products").param("sort", "creditValue,desc")).andExpect(status().isOk());
        mvc.perform(get("/api/products").param("sort", "password,desc")).andExpect(status().isBadRequest());
    }

    @Test
    void timestampsAreMarkedAsUtc() throws Exception {
        String token = register();

        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.createdAt").value(containsString("Z")));
    }

    @Test
    void profileCanBeSavedWithoutResendingDateOfBirth() throws Exception {
        String token = register();

        mvc.perform(put("/api/users/me").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("name", "New Name", "phone", uniquePhone(), "city", "Pune"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New Name"))
                .andExpect(jsonPath("$.dateOfBirth").value("1998-06-15"))
                .andExpect(jsonPath("$.creditBalance").value(350));
    }

    @Test
    void passwordChangeRequiresTheCurrentPassword() throws Exception {
        String email = uniqueEmail();
        String token = register(email);

        mvc.perform(post("/api/users/me/change-password").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("currentPassword", "wrong-password", "newPassword", "new-password-1"))))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/users/me/change-password").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("currentPassword", "password-123", "newPassword", "new-password-1"))))
                .andExpect(status().isNoContent());

        mvc.perform(login(email, "new-password-1")).andExpect(status().isOk());
    }

    @Test
    void passwordResetWorksOnceAndDoesNotRevealAccounts() throws Exception {
        String email = uniqueEmail();
        register(email);

        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"nobody-here@example.test\"}"))
                .andExpect(status().isNoContent());
        mvc.perform(post("/api/auth/forgot-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", email))))
                .andExpect(status().isNoContent());

        User user = userRepository.findByEmail(email).orElseThrow();
        PasswordResetToken stored = resetTokenRepository.findAll().stream()
                .filter(t -> t.getUser().getId().equals(user.getId())).findFirst().orElseThrow();
        assertThat(stored.getTokenHash()).hasSize(64);

        mvc.perform(post("/api/auth/reset-password").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("token", "not-the-token", "password", "new-password-1"))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void deletingAnAccountRequiresThePasswordAndFreesTheEmail() throws Exception {
        String email = uniqueEmail();
        String token = register(email);

        mvc.perform(post("/api/users/me/delete").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"wrong-password\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(post("/api/users/me/delete").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"password\":\"password-123\"}"))
                .andExpect(status().isNoContent());

        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
        mvc.perform(login(email, "password-123")).andExpect(status().isUnauthorized());
        register(email);
    }

    @Test
    void aSuspendedUsersExistingTokenStopsWorking() throws Exception {
        String email = uniqueEmail();
        String token = register(email);

        User user = userRepository.findByEmail(email).orElseThrow();
        user.setStatus(UserStatus.SUSPENDED);
        userRepository.save(user);

        mvc.perform(get("/api/users/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void reportsWorkWithoutADescriptionAndDuplicatesConflict() throws Exception {
        String sellerToken = register();
        long productId = createListing(sellerToken, "Reported item");
        String reporterToken = register();
        String body = json.writeValueAsString(Map.of("productId", productId, "reason", "Misleading description"));

        mvc.perform(post("/api/reports").header("Authorization", "Bearer " + reporterToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mvc.perform(post("/api/reports").header("Authorization", "Bearer " + reporterToken)
                        .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void savedItemsRoundTrip() throws Exception {
        String sellerToken = register();
        long productId = createListing(sellerToken, "Saved item");
        String token = register();

        mvc.perform(put("/api/saved/" + productId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(put("/api/saved/" + productId).header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/saved").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Saved item"));
    }

    private long createListing(String token, String title) throws Exception {
        MockMultipartFile data = new MockMultipartFile("data", "", "application/json",
                json.writeValueAsBytes(Map.of(
                        "title", title, "description", "Description", "category", "BOOKS", "condition", "GOOD",
                        "creditValue", 100, "street", "1 Test Street", "city", "Pune", "state", "Maharashtra",
                        "postalCode", "411001", "country", "India")));
        MockMultipartFile file = new MockMultipartFile("files", "item.png", "image/png", new byte[]{1, 2, 3});

        String response = mvc.perform(multipart("/api/products").file(data).file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return json.readTree(response).get("id").asLong();
    }

    private String register() throws Exception {
        return register(uniqueEmail());
    }

    private String register(String email) throws Exception {
        String response = mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of(
                                "name", "Test User", "email", email, "phone", uniquePhone(),
                                "password", "password-123", "dateOfBirth", "1998-06-15"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        JsonNode body = json.readTree(response);
        return body.get("token").asText();
    }

    private org.springframework.test.web.servlet.RequestBuilder login(String email, String password) throws Exception {
        return post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "password", password)));
    }

    private static String uniqueEmail() {
        return UUID.randomUUID().toString().substring(0, 12) + "@example.test";
    }

    private static String uniquePhone() {
        long digits = Math.abs(UUID.randomUUID().getMostSignificantBits()) % 1_000_000_000L;
        return "+91" + String.format("%09d", digits) + "7";
    }
}
