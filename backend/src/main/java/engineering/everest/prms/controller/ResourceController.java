package engineering.everest.prms.controller;

import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.dto.mapper.ResourceMapper;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
@Tag(name = "Resources", description = "Ship life-support resources (sleeping pods, food stations, medical bays, "
    + "etc.) and the minimum membership level required to use each one.")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Provision a resource",
        description = "Crew-lead-only: adds a new resource to the ship's inventory with its minimum required "
            + "membership level.")
    public ResponseEntity<ResourceDto> provisionResource(@Valid @RequestBody ResourceDto request) {
        Resource resource = resourceService.provisionResource(request.getName(), request.getMinRequiredLevel());
        return ResponseEntity.status(HttpStatus.CREATED).body(ResourceMapper.MAPPER.entityToDto(resource));
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Decommission a resource",
        description = "Crew-lead-only: permanently removes a resource from the ship's inventory.")
    public ResponseEntity<Void> decommissionResource(@PathVariable UUID resourceId) {
        resourceService.decommissionResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "List all resources",
        description = "Returns every resource on the ship, regardless of membership level.")
    public List<ResourceDto> listResources() {
        return ResourceMapper.MAPPER.entityToDtoList(resourceService.findAll());
    }
}
