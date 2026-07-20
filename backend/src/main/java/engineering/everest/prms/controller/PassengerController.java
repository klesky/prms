package engineering.everest.prms.controller;

import engineering.everest.prms.dto.PassengerDto;
import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.dto.mapper.PassengerMapper;
import engineering.everest.prms.dto.mapper.ResourceMapper;
import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.service.PassengerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/passengers")
@CrossOrigin
@Tag(name = "Passengers", description = "Ship passengers who access resources permitted by their membership level.")
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    @PostMapping
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Register a passenger",
        description = "Crew-lead-only: creates a passenger profile with an initial membership level.")
    public ResponseEntity<PassengerDto> registerPassenger(@Valid @RequestBody PassengerDto request) {
        Passenger passenger = passengerService.registerPassenger(request.getUsername(), request.getName(),
            request.getMembershipLevel());
        return ResponseEntity.status(HttpStatus.CREATED).body(PassengerMapper.MAPPER.entityToDto(passenger));
    }

    @PatchMapping("/{username}/membership-level")
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Change a passenger's membership level",
        description = "Crew-lead-only: upgrades or downgrades a passenger's tier (SILVER, GOLD, or PLATINUM).")
    public PassengerDto changeMembershipLevel(@PathVariable String username, @RequestBody MembershipLevel membershipLevel) {
        Passenger passenger = passengerService.changeMembershipLevel(username, membershipLevel);
        return PassengerMapper.MAPPER.entityToDto(passenger);
    }

    @GetMapping("/{username}/resources")
    @Operation(summary = "List a passenger's accessible resources",
        description = "Returns the resources permitted by the passenger's current membership level (higher tiers "
            + "inherit lower-tier access). Callable by the passenger themselves or any crew lead.")
    public List<ResourceDto> getAccessibleResources(@PathVariable String username, Authentication authentication) {
        Passenger passenger = passengerService.findById(username);
        requireSelfOrCrewLead(passenger, authentication);
        return ResourceMapper.MAPPER.entityToDtoList(passengerService.findAccessibleResourcesFor(username));
    }

    private void requireSelfOrCrewLead(Passenger passenger, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        boolean isSelf = passenger.getUsername().equals(jwt.getClaimAsString("preferred_username"));
        boolean isCrewLead = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_crew-lead"));
        if (!isSelf && !isCrewLead) {
            throw new AccessDeniedException("Not authorized to view this passenger's resources");
        }
    }
}
