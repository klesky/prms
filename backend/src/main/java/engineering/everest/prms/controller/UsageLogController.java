package engineering.everest.prms.controller;

import engineering.everest.prms.dto.UsageLogDto;
import engineering.everest.prms.dto.mapper.UsageLogMapper;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.service.UsageLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/usage-logs")
@CrossOrigin
@Tag(name = "Usage Logs", description = "Records of passengers using ship resources.")
public class UsageLogController {

    @Autowired
    private UsageLogService usageLogService;

    @PostMapping
    @PreAuthorize("@authService.canUseResource(#resourceId)")
    @Operation(summary = "Record resource usage",
        description = "Self-service: real-time membership-level check against the resource's requirement, then "
            + "logs the interaction. Denied attempts are not logged.")
    public ResponseEntity<UsageLogDto> recordUsage(@RequestBody UUID resourceId, Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String username = jwt.getClaimAsString("preferred_username");
        UsageLog usageLog = usageLogService.recordUsage(username, resourceId);
        return ResponseEntity.status(HttpStatus.CREATED).body(UsageLogMapper.MAPPER.entityToDto(usageLog));
    }
}
