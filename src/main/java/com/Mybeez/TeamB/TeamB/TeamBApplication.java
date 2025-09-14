package com.Mybeez.TeamB.TeamB;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TeamBApplication {

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.load();
        System.setProperty("MESSAGE_ENCRYPTION_KEY", dotenv.get("MESSAGE_ENCRYPTION_KEY"));

        SpringApplication.run(TeamBApplication.class, args);
    }
}