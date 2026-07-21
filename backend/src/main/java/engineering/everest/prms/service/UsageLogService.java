package engineering.everest.prms.service;

import engineering.everest.prms.dto.MembershipLevelUsageReportDto;
import engineering.everest.prms.dto.ResourceUsageCountDto;
import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.repository.PassengerRepository;
import engineering.everest.prms.repository.UsageLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsageLogService {

    @Autowired
    private UsageLogRepository usageLogRepository;

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private PassengerService passengerService;

    @Autowired
    private ResourceService resourceService;

    public UsageLog recordUsage(String passengerUsername, UUID resourceId) {
        Passenger passenger = passengerService.findById(passengerUsername);
        Resource resource = resourceService.findById(resourceId);

        return usageLogRepository.save(UsageLog.builder()
            .passenger(passenger)
            .resource(resource)
            .occurredAt(Instant.now())
            .build());
    }

    public List<UsageLog> findHistoryFor(String passengerUsername) {
        return usageLogRepository.findByPassenger_UsernameOrderByOccurredAtDesc(passengerUsername);
    }

    public List<MembershipLevelUsageReportDto> getUsageReportByMembershipLevel() {
        return Arrays.stream(MembershipLevel.values())
            .map(level -> MembershipLevelUsageReportDto.builder()
                .membershipLevel(level)
                .passengerCount(passengerRepository.findByMembershipLevel(level).size())
                .usageCount(usageLogRepository.countByPassenger_MembershipLevel(level))
                .build())
            .toList();
    }

    public List<ResourceUsageCountDto> getResourceUsageAnalytics() {
        return usageLogRepository.findAll().stream()
            .collect(Collectors.groupingBy(log -> log.getResource().getId()))
            .values().stream()
            .map(logs -> ResourceUsageCountDto.builder()
                .resourceId(logs.get(0).getResource().getId())
                .resourceName(logs.get(0).getResource().getName())
                .usageCount((long) logs.size())
                .build())
            .sorted(Comparator.comparingLong(ResourceUsageCountDto::getUsageCount).reversed())
            .toList();
    }
}
