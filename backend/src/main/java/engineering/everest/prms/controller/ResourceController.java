package engineering.everest.prms.controller;

import engineering.everest.prms.dto.ResourceDto;
import engineering.everest.prms.dto.mapper.ResourceMapper;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.service.ResourceService;
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
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @PostMapping
    @PreAuthorize("hasRole('crew-lead')")
    public ResponseEntity<ResourceDto> provisionResource(@Valid @RequestBody ResourceDto request) {
        Resource resource = resourceService.provisionResource(request.getName(), request.getMinRequiredLevel());
        return ResponseEntity.status(HttpStatus.CREATED).body(ResourceMapper.MAPPER.entityToDto(resource));
    }

    @DeleteMapping("/{resourceId}")
    @PreAuthorize("hasRole('crew-lead')")
    public ResponseEntity<Void> decommissionResource(@PathVariable UUID resourceId) {
        resourceService.decommissionResource(resourceId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public List<ResourceDto> listResources() {
        return ResourceMapper.MAPPER.entityToDtoList(resourceService.findAll());
    }
}
