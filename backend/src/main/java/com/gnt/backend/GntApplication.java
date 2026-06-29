package com.gnt.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GntApplication {

    public static void main(String[] args) {
        SpringApplication.run(GntApplication.class, args);
    }
}
