package com.gnt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class GntApplication {

    public static void main(String[] args) {
        // All timestamps are UTC, so expiry times mean the same thing to every browser.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(GntApplication.class, args);
    }
}
