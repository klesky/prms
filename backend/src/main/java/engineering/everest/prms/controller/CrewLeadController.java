package engineering.everest.prms.controller;

import engineering.everest.prms.dto.CrewLeadDto;
import engineering.everest.prms.dto.mapper.CrewLeadMapper;
import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.service.CrewLeadService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crew-leads")
@CrossOrigin
public class CrewLeadController {

    @Autowired
    private CrewLeadService crewLeadService;

    /**
     * There's no crew lead to authorize the very first one, so a caller may always
     * claim a seat for themselves while capacity remains; claiming a seat on someone
     * else's behalf requires already being a crew lead.
     */
    @PostMapping
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
}
