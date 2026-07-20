package engineering.everest.prms.service;

import engineering.everest.prms.repository.CrewLeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Registers the ship's 3 crew leads on first boot from the identities already seeded
 * into the local Keycloak realm (backend/realm-config/RIFTKeycloak-users-0.json), so
 * there's someone who can log in and manage the mission without an extra manual step.
 */
@Component
@Profile("!test")
public class CrewLeadSeeder implements CommandLineRunner {

    private record SeedCrewLead(String username, String name) {
    }

    private static final List<SeedCrewLead> CREW_LEADS = List.of(
        new SeedCrewLead("so90667", "Soon Yoong Ooi"),
        new SeedCrewLead("yg91185", "Yun Yie Goh"),
        new SeedCrewLead("mh91004", "Harris Fadhillah Mu'adzzam Shah"));

    @Autowired
    private CrewLeadRepository crewLeadRepository;

    @Autowired
    private CrewLeadService crewLeadService;

    @Override
    public void run(String... args) {
        if (crewLeadRepository.count() > 0) {
            return;
        }
        CREW_LEADS.forEach(seed -> crewLeadService.registerCrewLead(seed.username(), seed.name()));
    }
}
