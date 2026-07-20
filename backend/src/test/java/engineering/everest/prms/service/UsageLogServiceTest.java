package engineering.everest.prms.service;

import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.entity.UsageLog;
import engineering.everest.prms.exception.InsufficientMembershipLevelException;
import engineering.everest.prms.repository.UsageLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsageLogServiceTest {

    @Mock
    private UsageLogRepository usageLogRepository;

    @Mock
    private PassengerService passengerService;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private UsageLogService usageLogService;

    private static final String PASSENGER_USERNAME = "kc-9";

    private final UUID resourceId = UUID.randomUUID();

    @Test
    void recordUsage_grantsAndLogsWhenThePassengersLevelMeetsTheRequirement() {
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
    void recordUsage_deniesAndDoesNotLogWhenThePassengersLevelIsTooLow() {
        Passenger passenger = Passenger.builder().username(PASSENGER_USERNAME).name("Naavin Balayah").membershipLevel(SILVER).build();
        Resource resource = Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build();
        when(passengerService.findById(PASSENGER_USERNAME)).thenReturn(passenger);
        when(resourceService.findById(resourceId)).thenReturn(resource);

        assertThatThrownBy(() -> usageLogService.recordUsage(PASSENGER_USERNAME, resourceId))
            .isInstanceOf(InsufficientMembershipLevelException.class);

        verify(usageLogRepository, never()).save(any());
    }
}
