package engineering.everest.prms.controller;

import engineering.everest.prms.dto.CrewLeadDto;
import engineering.everest.prms.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.is;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CrewLeadControllerTest extends AbstractIntegrationTest {

    @Test
    void registerCrewLead_allowsSelfRegistrationWhenNoCrewLeadExistsYet() throws Exception {
        var request = new CrewLeadDto("kc-1", "Yun Yie Goh");

        mockMvc.perform(post("/api/crew-leads")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username", is("kc-1")))
            .andExpect(jsonPath("$.name", is("Yun Yie Goh")));
    }

    @Test
    void registerCrewLead_rejectsRegisteringSomeoneElseWhenNotAlreadyACrewLead() throws Exception {
        var request = new CrewLeadDto("kc-2", "Harris Mu'adzzam Shah");

        mockMvc.perform(post("/api/crew-leads")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isForbidden());
    }

    @Test
    void registerCrewLead_allowsAnExistingCrewLeadToRegisterSomeoneElse() throws Exception {
        givenCrewLead("kc-1", "Yun Yie Goh");
        var request = new CrewLeadDto("kc-2", "Harris Mu'adzzam Shah");

        mockMvc.perform(post("/api/crew-leads")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.username", is("kc-2")));
    }

    @Test
    void registerCrewLead_rejectedWhenUnauthenticated() throws Exception {
        var request = new CrewLeadDto("kc-1", "Yun Yie Goh");

        mockMvc.perform(post("/api/crew-leads")
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void registerCrewLead_rejectsTheFourthCrewLead() throws Exception {
        givenCrewLead("kc-1", "Crew Lead One");
        givenCrewLead("kc-2", "Crew Lead Two");
        givenCrewLead("kc-3", "Crew Lead Three");

        mockMvc.perform(post("/api/crew-leads")
                .with(jwtFor("kc-1"))
                .with(csrf())
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(new CrewLeadDto("kc-4", "Crew Lead Four"))))
            .andExpect(status().isConflict());
    }
}
