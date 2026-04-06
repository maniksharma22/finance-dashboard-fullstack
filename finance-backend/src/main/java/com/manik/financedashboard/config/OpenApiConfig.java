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
                        .title("FinanceOS - Fullstack Finance Management API")
                        .version("1.0.0")
                        .description("A robust Spring Boot REST API for FinanceOS. " +
                                "Features include Role-Based Access Control (RBAC) for Admin, Analyst, and Viewer roles, " +
                                "financial record CRUD operations, and aggregated dashboard analytics.")
                        .contact(new Contact()
                                .name("Manik Sharma")
                                .email("21512938.dypit@dypvp.edu.in")));
    }
}