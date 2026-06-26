package com.gnt.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class GntApplicationTests {

    @Test
    void contextLoads() {
        // Validates that the Spring context starts cleanly,
        // Flyway migrations run without error, and Hibernate
        // validates the schema successfully.
    }
}
