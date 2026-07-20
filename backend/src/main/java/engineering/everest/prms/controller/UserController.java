package engineering.everest.prms.controller;

import engineering.everest.prms.dto.CurrentUserDto;
import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.repository.CrewLeadRepository;
import engineering.everest.prms.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private CrewLeadRepository crewLeadRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    /**
     * Returns the caller's own identity and the domain roles/entitlements decided from
     * our tables (see {@link engineering.everest.prms.security.DomainRoleAuthoritiesConverter}).
     * Any authenticated user may read their own detail.
     */
    @GetMapping("/me")
    public CurrentUserDto getCurrentUser(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String username = jwt.getClaimAsString("preferred_username");

        // The authorities are already resolved per-request from our tables, so reuse them
        // (ROLE_crew-lead / ROLE_passenger) rather than hitting the DB again for the role list.
        List<String> roles = authentication.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .map(authority -> authority.startsWith("ROLE_") ? authority.substring("ROLE_".length()) : authority)
            .toList();

        Passenger passenger = passengerRepository.findById(username).orElse(null);
        if (passenger != null) {
            return CurrentUserDto.builder()
                .username(username)
                .name(passenger.getName())
                .roles(roles)
                .membershipLevel(passenger.getMembershipLevel())
                .build();
        }

        CrewLead crewLead = crewLeadRepository.findById(username).orElse(null);
        String name = crewLead != null ? crewLead.getName() : jwt.getClaimAsString("name");

        return CurrentUserDto.builder()
            .username(username)
            .name(name)
            .roles(roles)
            .membershipLevel(null)
            .build();
    }
}
