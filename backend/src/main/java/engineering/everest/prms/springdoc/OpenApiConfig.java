package engineering.everest.prms.springdoc;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI prmsOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Spaceship X26: Passenger Resource Management System")
                .description("Earth -> Mars settlement mission. Paste a Keycloak-issued JWT via Authorize to call "
                    + "protected endpoints; crew-lead/passenger status is resolved from our own data, not from the token.")
                .version("v1"))
            .components(new Components().addSecuritySchemes(BEARER_AUTH,
                new SecurityScheme()
                    .name(BEARER_AUTH)
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")))
            .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH));
    }
}
