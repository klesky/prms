package engineering.everest.prms.controller;

import engineering.everest.prms.dto.PassengerDto;
import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.repository.ResourceRepository;
import engineering.everest.prms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PassengerControllerTest extends AbstractIntegrationTest {

    @Autowired
    private ResourceRepository resourceRepository;

    @Test
    void registerPassenger_succeedsForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");

        mockMvc.perform(post("/api/passengers")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(new PassengerDto("kc-9", "Naavin Balayah", SILVER))))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.name", is("Naavin Balayah")))
            .andExpect(jsonPath("$.membershipLevel", is("SILVER")));
    }

    @Test
    void registerPassenger_rejectedForAPassenger() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(post("/api/passengers")
                .with(jwtFor("kc-9"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(new PassengerDto("kc-10", "Someone Else", SILVER))))
            .andExpect(status().isForbidden());
    }

    @Test
    void listPassengers_succeedsForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        givenPassenger("kc-9", "Naavin Balayah", SILVER);
        givenPassenger("kc-10", "Someone Else", GOLD);

        mockMvc.perform(get("/api/passengers").with(jwtFor("kc-1")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void listPassengers_rejectedForAPassenger() throws Exception {
        givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(get("/api/passengers").with(jwtFor("kc-9")))
            .andExpect(status().isForbidden());
    }

    @Test
    void listPassengers_rejectedWhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/passengers"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void getAccessibleResources_filtersByMembershipLevelForThePassengerThemself() throws Exception {
        var passenger = givenPassenger("kc-9", "Naavin Balayah", SILVER);
        givenResource("Food Station", SILVER);
        givenResource("Private Cabin", GOLD);

        mockMvc.perform(get("/api/passengers/{username}/resources", passenger.getUsername()).with(jwtFor("kc-9")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].name", is("Food Station")));
    }

    @Test
    void getAccessibleResources_isVisibleToACrewLeadForAnyPassenger() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        var passenger = givenPassenger("kc-9", "Naavin Balayah", GOLD);
        givenResource("Food Station", SILVER);
        givenResource("Private Cabin", GOLD);

        mockMvc.perform(get("/api/passengers/{username}/resources", passenger.getUsername()).with(jwtFor("kc-1")))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void getAccessibleResources_rejectedForADifferentPassenger() throws Exception {
        var passenger = givenPassenger("kc-9", "Naavin Balayah", SILVER);
        givenPassenger("kc-other", "Someone Else", SILVER);

        mockMvc.perform(get("/api/passengers/{username}/resources", passenger.getUsername()).with(jwtFor("kc-other")))
            .andExpect(status().isForbidden());
    }

    @Test
    void changeMembershipLevel_succeedsForACrewLead() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        var passenger = givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(patch("/api/passengers/{username}/membership-level", passenger.getUsername())
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(PLATINUM)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.membershipLevel", is("PLATINUM")));
    }

    @Test
    void changeMembershipLevel_rejectedForAPassenger() throws Exception {
        var passenger = givenPassenger("kc-9", "Naavin Balayah", SILVER);

        mockMvc.perform(patch("/api/passengers/{username}/membership-level", passenger.getUsername())
                .with(jwtFor("kc-9"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(PLATINUM)))
            .andExpect(status().isForbidden());
    }

    private Resource givenResource(String name, MembershipLevel level) {
        return resourceRepository.save(Resource.builder().name(name).minRequiredLevel(level).build());
    }
}
