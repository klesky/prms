package engineering.everest.prms.support;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.oauth2.jwt.JwtDecoder;

/**
 * Tests authenticate via SecurityMockMvcRequestPostProcessors.jwt(), which never calls the
 * real JwtDecoder. This stub only exists to satisfy the resource server's bean requirement
 * without contacting a live Keycloak instance during the test run.
 */
@TestConfiguration
public class TestSecurityBeansConfig {

    @Bean
    public JwtDecoder jwtDecoder() {
        return token -> {
            throw new UnsupportedOperationException("Tests must authenticate via SecurityMockMvcRequestPostProcessors.jwt()");
        };
    }
}
