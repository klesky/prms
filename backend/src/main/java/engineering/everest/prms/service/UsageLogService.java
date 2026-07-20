package engineering.everest.prms.service;

import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.repository.UsageLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class UsageLogService {

    @Autowired
    private UsageLogRepository usageLogRepository;

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
}
