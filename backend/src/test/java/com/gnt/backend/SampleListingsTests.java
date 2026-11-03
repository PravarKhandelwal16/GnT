package com.gnt.backend;

import com.gnt.backend.admin.SampleListings;
import com.gnt.backend.auth.repository.CreditHistoryRepository;
import com.gnt.backend.auth.repository.UserRepository;
import com.gnt.backend.domain.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:gnt_samples;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "application.sample-data.enabled=true",
        "application.sample-data.seller-password=sample-pass-123"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SampleListingsTests {

    @Autowired private MockMvc mvc;
    @Autowired private SampleListings sampleListings;
    @Autowired private UserRepository userRepository;
    @Autowired private CreditHistoryRepository creditHistoryRepository;

    @Test
    void theEightSampleProductsAreListedOnStartupAndNeverDuplicated() throws Exception {
        sampleListings.run(new DefaultApplicationArguments());
        sampleListings.run(new DefaultApplicationArguments());

        mvc.perform(get("/api/products").param("size", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(8));
        mvc.perform(get("/api/products").param("query", "teak"))
                .andExpect(jsonPath("$.content[0].primaryMediaUrl").value("/samples/chair.svg"))
                .andExpect(jsonPath("$.content[0].city").value("Pune"));
    }

    @Test
    void sampleSellerBalancesAreFullyExplainedByTheirLedger() {
        for (String email : new String[]{"asha@samples.giveandtake.invalid", "rohan@samples.giveandtake.invalid"}) {
            User seller = userRepository.findByEmail(email).orElseThrow();
            int ledger = creditHistoryRepository.findByUserIdOrderByCreatedAtDesc(seller.getId(), PageRequest.of(0, 50))
                    .stream().mapToInt(entry -> entry.getAmount()).sum();
            assertThat(ledger).isEqualTo(seller.getCreditBalance());
        }
        // 350 + 40% of 420, 260, 240 and 120
        assertThat(userRepository.findByEmail("asha@samples.giveandtake.invalid").orElseThrow().getCreditBalance())
                .isEqualTo(350 + 168 + 104 + 96 + 48);
    }

    @Test
    void theSellerPasswordSettingLetsYouLogInAsASampleSeller() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"email\":\"asha@samples.giveandtake.invalid\",\"password\":\"sample-pass-123\"}"))
                .andExpect(status().isOk());
    }
}
