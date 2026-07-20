package engineering.everest.prms.controller;

import engineering.everest.prms.dto.CrewLeadDto;
import engineering.everest.prms.dto.mapper.CrewLeadMapper;
import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.service.CrewLeadService;
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
@RequestMapping("/api/crew-leads")
@CrossOrigin
@Tag(name = "Crew Leads", description = "Ship administrators who manage passengers, resources and membership tiers.")
public class CrewLeadController {

    @Autowired
    private CrewLeadService crewLeadService;

    /**
     * There's no crew lead to authorize the very first one, so a caller may always
     * claim a seat for themselves while capacity remains; claiming a seat on someone
     * else's behalf requires already being a crew lead.
     */
    @PostMapping
    @Operation(summary = "Register a crew lead",
        description = "Self-registers the caller as a crew lead while a seat remains open (max 3 ship-wide), "
            + "or lets an existing crew lead register someone else.")
    public ResponseEntity<CrewLeadDto> registerCrewLead(@Valid @RequestBody CrewLeadDto request,
                                                          Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String requesterUsername = jwt.getClaimAsString("preferred_username");
        boolean isSelfRegistration = requesterUsername.equals(request.getUsername());
        boolean requesterIsCrewLead = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_crew-lead"));
        if (!isSelfRegistration && !requesterIsCrewLead) {
            throw new AccessDeniedException("Only an existing crew lead can register another crew lead");
        }

        CrewLead crewLead = crewLeadService.registerCrewLead(request.getUsername(), request.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(CrewLeadMapper.MAPPER.entityToDto(crewLead));
    }

    @GetMapping
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "List all crew leads",
        description = "Crew-lead-only: returns the ship's administrators (up to 3).")
    public List<CrewLeadDto> listCrewLeads() {
        return CrewLeadMapper.MAPPER.entityToDtoList(crewLeadService.findAll());
    }

    @DeleteMapping("/{username}")
    @PreAuthorize("hasRole('crew-lead') and @authService.isNotSelf(#username)")
    @Operation(summary = "Delete a crew lead",
        description = "Crew-lead-only: removes another crew lead. You cannot delete yourself.")
    public ResponseEntity<Void> deleteCrewLead(@PathVariable String username) {
        crewLeadService.deleteCrewLead(username);
        return ResponseEntity.noContent().build();
    }
}
