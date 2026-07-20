package engineering.everest.prms.controller;

import engineering.everest.prms.dto.PassengerDto;
import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.dto.mapper.PassengerMapper;
import engineering.everest.prms.dto.mapper.ResourceMapper;
import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.service.PassengerService;
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
public class PassengerController {

    @Autowired
    private PassengerService passengerService;

    @PostMapping
    @PreAuthorize("hasRole('crew-lead')")
    public ResponseEntity<PassengerDto> registerPassenger(@Valid @RequestBody PassengerDto request) {
        Passenger passenger = passengerService.registerPassenger(request.getUsername(), request.getName(),
            request.getMembershipLevel());
        return ResponseEntity.status(HttpStatus.CREATED).body(PassengerMapper.MAPPER.entityToDto(passenger));
    }

    @PatchMapping("/{username}/membership-level")
    @PreAuthorize("hasRole('crew-lead')")
    public PassengerDto changeMembershipLevel(@PathVariable String username, @RequestBody MembershipLevel membershipLevel) {
        Passenger passenger = passengerService.changeMembershipLevel(username, membershipLevel);
        return PassengerMapper.MAPPER.entityToDto(passenger);
    }

    @GetMapping("/{username}/resources")
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
