package engineering.everest.prms.controller;

import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.repository.ResourceRepository;
import engineering.everest.prms.repository.UsageLogRepository;
import engineering.everest.prms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ResourceControllerTest extends AbstractIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UsageLogRepository usageLogRepository;

    @Test
    void provisionResource_succeedsForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");

        mockMvc.perform(post("/api/resources")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(ResourceDto.builder().name("Sleeping Pod").minRequiredLevel(SILVER).build())))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("Sleeping Pod")))
            .andExpect(jsonPath("$.minRequiredLevel", is("SILVER")));
    }

    @Test
    void provisionResource_rejectedForAPassenger() throws Exception {
        givenPassenger("kc-2", "Naavin Balayah", SILVER);

        mockMvc.perform(post("/api/resources")
                .with(jwtFor("kc-2"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(ResourceDto.builder().name("Sleeping Pod").minRequiredLevel(SILVER).build())))
            .andExpect(status().isForbidden());
    }

    @Test
    void decommissionResource_returns404ForAnUnknownResource() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");

        mockMvc.perform(delete("/api/resources/{id}", UUID.randomUUID())
                .with(jwtFor("kc-1"))
                .with(csrf()))
            .andExpect(status().isNotFound());
    }

    @Test
    void decommissionResource_deletesTheResourceAndItsUsageHistoryWhenSomeExists() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        Passenger passenger = givenPassenger("kc-9", "Naavin Balayah", SILVER);
        Resource resource = resourceRepository.save(Resource.builder().name("Food Station").minRequiredLevel(SILVER).build());
        usageLogRepository.save(UsageLog.builder().passenger(passenger).resource(resource).occurredAt(Instant.now()).build());

        mockMvc.perform(delete("/api/resources/{id}", resource.getId())
                .with(jwtFor("kc-1"))
                .with(csrf()))
            .andExpect(status().isNoContent());

        assertThat(resourceRepository.existsById(resource.getId())).isFalse();
        assertThat(usageLogRepository.findAll()).isEmpty();
    }

    @Test
    void listResources_isVisibleToAnyAuthenticatedUser() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        givenPassenger("kc-2", "Naavin Balayah", SILVER);

        mockMvc.perform(post("/api/resources")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(ResourceDto.builder().name("Food Station").minRequiredLevel(SILVER).build())))
            .andExpect(status().isCreated());

        mockMvc.perform(get("/api/resources").with(jwtFor("kc-2")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void listResources_rejectedWhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/resources"))
            .andExpect(status().isUnauthorized());
    }
}
