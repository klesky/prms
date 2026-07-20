package engineering.everest.prms.service;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;

/**
 * Establishes the ship's base inventory of critical infrastructure on first boot, so
 * passengers have life-support resources to discover before any crew lead provisions more.
 */
@Component
@Profile("!test")
public class ResourceSeeder implements CommandLineRunner {

    private record SeedResource(String name, MembershipLevel minRequiredLevel) {
    }

    private static final List<SeedResource> CRITICAL_INFRASTRUCTURE = List.of(
        new SeedResource("Sleeping Pod", SILVER),
        new SeedResource("Food Station", SILVER),
        new SeedResource("Basic Hygiene Pod", SILVER),
        new SeedResource("Oxygen Refill Unit", SILVER),
        new SeedResource("Fitness Center", SILVER),
        new SeedResource("Private Cabin", GOLD),
        new SeedResource("Advanced Medical Bay", GOLD),
        new SeedResource("Luxury Oxygen Pod", PLATINUM),
        new SeedResource("VIP Recreation Deck", PLATINUM));

    @Autowired
    private ResourceRepository resourceRepository;

    @Autowired
    private ResourceService resourceService;

    @Override
    public void run(String... args) {
        if (resourceRepository.count() > 0) {
            return;
        }
        CRITICAL_INFRASTRUCTURE.forEach(seed -> resourceService.provisionResource(seed.name(), seed.minRequiredLevel()));
    }
}
