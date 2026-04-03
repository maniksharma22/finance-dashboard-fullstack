package com.manik.financedashboard;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class FinanceDashboardApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceDashboardApplication.class, args);
	}

	@Bean
	public OpenAPI customOpenAPI() {
		return new OpenAPI()
				.addSecurityItem(new SecurityRequirement().addList("basicAuth"))
				.components(new Components()
						.addSecuritySchemes("basicAuth", new SecurityScheme()
								.name("basicAuth")
								.type(SecurityScheme.Type.HTTP)
								.scheme("basic")
								.description("Enter your Email and Password to authenticate")));
	}
}