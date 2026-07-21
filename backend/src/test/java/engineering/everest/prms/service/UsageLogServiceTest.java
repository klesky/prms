package engineering.everest.prms.service;

import engineering.everest.prms.dto.MembershipLevelUsageReportDto;
import engineering.everest.prms.dto.ResourceUsageCountDto;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.repository.PassengerRepository;
import engineering.everest.prms.repository.UsageLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsageLogServiceTest {

    @Mock
    private UsageLogRepository usageLogRepository;

    @Mock
    private PassengerRepository passengerRepository;

    @Mock
    private PassengerService passengerService;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private UsageLogService usageLogService;

    private static final String PASSENGER_USERNAME = "kc-9";

    private final UUID resourceId = UUID.randomUUID();

    @Test
    void recordUsage_looksUpThePassengerAndResourceAndLogsTheInteraction() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(GOLD).build();
        Resource resource = Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build();
        when(passengerService.findById(PASSENGER_USERNAME)).thenReturn(passenger);
        when(resourceService.findById(resourceId)).thenReturn(resource);
        when(usageLogRepository.save(any(UsageLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsageLog log = usageLogService.recordUsage(PASSENGER_USERNAME, resourceId);

        assertThat(log.getPassenger()).isEqualTo(passenger);
        assertThat(log.getResource()).isEqualTo(resource);
        verify(usageLogRepository).save(any(UsageLog.class));
    }

    @Test
    void findHistoryFor_returnsThePassengersLogsNewestFirst() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(GOLD).build();
        Resource resource = Resource.builder().id(UUID.randomUUID()).name("Private Cabin").minRequiredLevel(GOLD).build();
        List<UsageLog> expected = List.of(
            UsageLog.builder().passenger(passenger).resource(resource).occurredAt(Instant.now()).build());
        when(usageLogRepository.findByPassenger_UsernameOrderByOccurredAtDesc(PASSENGER_USERNAME)).thenReturn(expected);

        assertThat(usageLogService.findHistoryFor(PASSENGER_USERNAME)).isEqualTo(expected);
    }

    @Test
    void getUsageReportByMembershipLevel_returnsOneEntryPerTierWithCorrectCounts() {
        Passenger silverPassenger = Passenger.builder().username("kc-1").name("Silver Passenger").membershipLevel(SILVER).build();
        when(passengerRepository.findByMembershipLevel(SILVER)).thenReturn(List.of(silverPassenger));
        when(passengerRepository.findByMembershipLevel(GOLD)).thenReturn(List.of());
        when(passengerRepository.findByMembershipLevel(PLATINUM)).thenReturn(List.of());
        when(usageLogRepository.countByPassenger_MembershipLevel(SILVER)).thenReturn(5L);
        when(usageLogRepository.countByPassenger_MembershipLevel(GOLD)).thenReturn(0L);
        when(usageLogRepository.countByPassenger_MembershipLevel(PLATINUM)).thenReturn(0L);

        List<MembershipLevelUsageReportDto> report = usageLogService.getUsageReportByMembershipLevel();

        assertThat(report).hasSize(3);
        MembershipLevelUsageReportDto silverEntry = report.stream()
            .filter(entry -> entry.getMembershipLevel() == SILVER)
            .findFirst().orElseThrow();
        assertThat(silverEntry.getPassengerCount()).isEqualTo(1);
        assertThat(silverEntry.getUsageCount()).isEqualTo(5);
    }

    @Test
    void getResourceUsageAnalytics_sortsResourcesByUsageCountDescending() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(GOLD).build();
        Resource lessUsed = Resource.builder().id(UUID.randomUUID()).name("Food Station").minRequiredLevel(SILVER).build();
        Resource moreUsed = Resource.builder().id(UUID.randomUUID()).name("Luxury Oxygen Pod").minRequiredLevel(PLATINUM).build();
        List<UsageLog> logs = List.of(
            UsageLog.builder().passenger(passenger).resource(lessUsed).occurredAt(Instant.now()).build(),
            UsageLog.builder().passenger(passenger).resource(moreUsed).occurredAt(Instant.now()).build(),
            UsageLog.builder().passenger(passenger).resource(moreUsed).occurredAt(Instant.now()).build());
        when(usageLogRepository.findAll()).thenReturn(logs);

        List<ResourceUsageCountDto> analytics = usageLogService.getResourceUsageAnalytics();

        assertThat(analytics).hasSize(2);
        assertThat(analytics.get(0).getResourceName()).isEqualTo("Luxury Oxygen Pod");
        assertThat(analytics.get(0).getUsageCount()).isEqualTo(2);
        assertThat(analytics.get(1).getResourceName()).isEqualTo("Food Station");
        assertThat(analytics.get(1).getUsageCount()).isEqualTo(1);
    }
}
