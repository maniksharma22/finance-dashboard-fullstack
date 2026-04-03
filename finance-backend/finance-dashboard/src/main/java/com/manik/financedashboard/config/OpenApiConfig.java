package com.manik.financedashboard.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Finance Dashboard API")
                        .version("1.0")
                        .description("Backend API for managing financial records, user roles, and dashboard analytics.")
                        .contact(new Contact()
                                .name("Manik Sharma")
                                .email("21512938.dypit@dypvp.edu.in")));
    }
}