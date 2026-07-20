package engineering.everest.prms.service;

import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.InsufficientMembershipLevelException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String PASSENGER_USERNAME = "kc-9";

    @Mock
    private PassengerService passengerService;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private AuthService authService;

    private final UUID resourceId = UUID.randomUUID();

    @BeforeEach
    void seedSecurityContext() {
        Jwt jwt = Jwt.withTokenValue("token")
            .header("alg", "none")
            .claim("sub", PASSENGER_USERNAME)
            .claim("preferred_username", PASSENGER_USERNAME)
            .issuedAt(Instant.now())
            .expiresAt(Instant.now().plusSeconds(60))
            .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void canUseResource_returnsTrueWhenThePassengersLevelMeetsTheRequirement() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(GOLD).build();
        Resource resource = Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build();
        when(passengerService.findById(PASSENGER_USERNAME)).thenReturn(passenger);
        when(resourceService.findById(resourceId)).thenReturn(resource);

        assertThat(authService.canUseResource(resourceId)).isTrue();
    }

    @Test
    void canUseResource_throwsWhenThePassengersLevelIsTooLow() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(SILVER).build();
        Resource resource = Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build();
        when(passengerService.findById(PASSENGER_USERNAME)).thenReturn(passenger);
        when(resourceService.findById(resourceId)).thenReturn(resource);

        assertThatThrownBy(() -> authService.canUseResource(resourceId))
            .isInstanceOf(InsufficientMembershipLevelException.class);
    }
}
