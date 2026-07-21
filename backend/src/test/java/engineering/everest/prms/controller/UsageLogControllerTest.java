package engineering.everest.prms.controller;

import engineering.everest.prms.entity.MembershipLevel;
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

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UsageLogControllerTest extends AbstractIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private UsageLogRepository usageLogRepository;

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

    @Test
    void getMyUsageHistory_returnsOnlyTheCallersOwnLogsNewestFirst() throws Exception {
        Passenger me = givenPassenger("kc-9", "Naavin Balayah", GOLD);
        Passenger someoneElse = givenPassenger("kc-10", "Someone Else", GOLD);
        Resource resource = givenResource("Private Cabin", GOLD);

        givenUsageLog(me, resource, Instant.now().minusSeconds(60));
        UsageLog mostRecent = givenUsageLog(me, resource, Instant.now());
        givenUsageLog(someoneElse, resource, Instant.now());

        mockMvc.perform(get("/api/usage-logs").with(jwtFor("kc-9")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].id", is(mostRecent.getId().toString())));
    }

    @Test
    void getUsageReportByMembershipLevel_succeedsForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(get("/api/usage-logs/reports/by-membership-level").with(jwtFor("kc-1")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(3)));
    }

    @Test
    void getUsageReportByMembershipLevel_rejectedForAPassenger() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(get("/api/usage-logs/reports/by-membership-level").with(jwtFor("kc-9")))
            .andExpect(status().isForbidden());
    }

    @Test
    void getResourceUsageAnalytics_succeedsForACrewLeadAndSortsByDemand() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        Passenger passenger = givenPassenger("kc-9", "Naavin Balayah", PLATINUM);
        Resource lessUsed = givenResource("Food Station", SILVER);
        Resource moreUsed = givenResource("Luxury Oxygen Pod", PLATINUM);
        givenUsageLog(passenger, lessUsed, Instant.now());
        givenUsageLog(passenger, moreUsed, Instant.now());
        givenUsageLog(passenger, moreUsed, Instant.now());

        mockMvc.perform(get("/api/usage-logs/reports/by-resource").with(jwtFor("kc-1")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)))
            .andExpect(jsonPath("$[0].resourceName", is("Luxury Oxygen Pod")))
            .andExpect(jsonPath("$[0].usageCount", is(2)))
            .andExpect(jsonPath("$[1].resourceName", is("Food Station")))
            .andExpect(jsonPath("$[1].usageCount", is(1)));
    }

    @Test
    void getResourceUsageAnalytics_rejectedForAPassenger() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(get("/api/usage-logs/reports/by-resource").with(jwtFor("kc-9")))
            .andExpect(status().isForbidden());
    }

    private Resource givenResource(String name, MembershipLevel level) {
        return resourceRepository.save(Resource.builder().name(name).minRequiredLevel(level).build());
    }

    private UsageLog givenUsageLog(Passenger passenger, Resource resource, Instant occurredAt) {
        return usageLogRepository.save(UsageLog.builder()
            .passenger(passenger)
            .resource(resource)
            .occurredAt(occurredAt)
            .build());
    }
}
