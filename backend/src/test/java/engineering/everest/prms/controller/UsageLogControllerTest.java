package engineering.everest.prms.controller;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.repository.ResourceRepository;
import engineering.everest.prms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsageLogControllerTest extends AbstractIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Test
    void recordUsage_succeedsWhenPassengerHasSufficientLevel() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", GOLD);
        var resource = givenResource("Private Cabin", GOLD);

        mockMvc.perform(post("/api/usage-logs")
                .with(jwtFor("kc-9"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(resource.getId())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passengerUsername", is("kc-9")))
            .andExpect(jsonPath("$.resourceName", is("Private Cabin")));
    }

    @Test
    void recordUsage_deniesWhenPassengerLevelIsTooLow() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", SILVER);
        var resource = givenResource("Private Cabin", GOLD);

        mockMvc.perform(post("/api/usage-logs")
                .with(jwtFor("kc-9"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(resource.getId())))
            .andExpect(status().isForbidden());
    }

    @Test
    void recordUsage_rejectedForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        var resource = givenResource("Private Cabin", GOLD);

        mockMvc.perform(post("/api/usage-logs")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(resource.getId())))
            .andExpect(status().isNotFound());
    }

    @Test
    void recordUsage_returns404ForAnUnknownResource() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", GOLD);

        mockMvc.perform(post("/api/usage-logs")
                .with(jwtFor("kc-9"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(UUID.randomUUID())))
            .andExpect(status().isNotFound());
    }

    @Test
    void recordUsage_rejectedWhenUnauthenticated() throws Exception {
        var resource = givenResource("Private Cabin", GOLD);

        mockMvc.perform(post("/api/usage-logs")
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(resource.getId())))
            .andExpect(status().isUnauthorized());
    }

    private Resource givenResource(String name, MembershipLevel level) {
        return resourceRepository.save(Resource.builder().name(name).minRequiredLevel(level).build());
    }
}
