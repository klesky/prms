package engineering.everest.prms.support;

import com.fasterxml.jackson.databind.ObjectMapper;
import engineering.everest.prms.PrmsApplication;
import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.repository.CrewLeadRepository;
import engineering.everest.prms.repository.PassengerRepository;
import engineering.everest.prms.security.DomainRoleAuthoritiesConverter;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

@ExtendWith(SpringExtension.class)
@SpringBootTest(classes = PrmsApplication.class)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestSecurityBeansConfig.class)
@Transactional
public abstract class AbstractIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected CrewLeadRepository crewLeadRepository;

    @Autowired
    protected PassengerRepository passengerRepository;

    @Autowired
    private DomainRoleAuthoritiesConverter domainRoleAuthoritiesConverter;

    /** A caller's identity, as proven by Keycloak. Their role is resolved from our DB, not from this token. */
    protected RequestPostProcessor jwtFor(String username) {
        return SecurityMockMvcRequestPostProcessors.jwt()
            .jwt(jwt -> jwt.subject(username).claim("preferred_username", username))
            .authorities(domainRoleAuthoritiesConverter);
    }

    protected CrewLead givenCrewLead(String username, String name) {
        return crewLeadRepository.save(CrewLead.builder().username(username).name(name).build());
    }

    protected Passenger givenPassenger(String username, String name, MembershipLevel membershipLevel) {
        return passengerRepository.save(Passenger.builder()
            .username(username)
            .name(name)
            .membershipLevel(membershipLevel)
            .build());
    }
}
