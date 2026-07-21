package engineering.everest.prms.controller;

import engineering.everest.prms.dto.MembershipLevelUsageReportDto;
import engineering.everest.prms.dto.ResourceUsageCountDto;
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

import java.util.List;
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

    @GetMapping
    @Operation(summary = "View your own usage history",
        description = "Self-service: every resource interaction you've recorded, most recent first.")
    public List<UsageLogDto> getMyUsageHistory(Authentication authentication) {
        Jwt jwt = (Jwt) authentication.getPrincipal();
        String username = jwt.getClaimAsString("preferred_username");
        return UsageLogMapper.MAPPER.entityToDtoList(usageLogService.findHistoryFor(username));
    }

    @GetMapping("/reports/by-membership-level")
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Usage report grouped by membership level",
        description = "Crew-lead-only: passenger count and total resource usage for each tier, ship-wide.")
    public List<MembershipLevelUsageReportDto> getUsageReportByMembershipLevel() {
        return usageLogService.getUsageReportByMembershipLevel();
    }

    @GetMapping("/reports/by-resource")
    @PreAuthorize("hasRole('crew-lead')")
    @Operation(summary = "Usage analytics by resource",
        description = "Crew-lead-only: resources ranked by usage count, highest demand first, to spot shortage risk.")
    public List<ResourceUsageCountDto> getResourceUsageAnalytics() {
        return usageLogService.getResourceUsageAnalytics();
    }
}
