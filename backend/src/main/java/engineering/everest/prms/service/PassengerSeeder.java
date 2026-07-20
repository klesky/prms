package engineering.everest.prms.service;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;

/**
 * Registers the ship's remaining seeded Keycloak identities as passengers on first
 * boot, spread across all 3 membership tiers, so there's demo data to exercise
 * resource discovery and tier upgrades against immediately.
 */
@Component
@Profile("!test")
public class PassengerSeeder implements CommandLineRunner {

    private record SeedPassenger(String username, String name, MembershipLevel membershipLevel) {
    }

    private static final List<SeedPassenger> PASSENGERS = List.of(
        new SeedPassenger("bn89820", "Naavin Balayah", SILVER),
        new SeedPassenger("mp89242", "Paul Singaraj Melvin Raj", GOLD),
        new SeedPassenger("zc90663", "Ze Yen Chai", PLATINUM));

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private PassengerService passengerService;

    @Override
    public void run(String... args) {
        if (passengerRepository.count() > 0) {
            return;
        }
        PASSENGERS.forEach(seed -> passengerService.registerPassenger(seed.username(), seed.name(), seed.membershipLevel()));
    }
}
