package engineering.everest.prms.service;

import engineering.everest.prms.repository.ResourceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceSeederTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private ResourceSeeder seeder;

    @Test
    void run_provisionsTheCriticalInfrastructureWhenNoResourcesExistYet() throws Exception {
        when(resourceRepository.count()).thenReturn(0L);

        seeder.run();

        verify(resourceService).provisionResource("Sleeping Pod", SILVER);
        verify(resourceService).provisionResource("Food Station", SILVER);
        verify(resourceService).provisionResource("Basic Hygiene Pod", SILVER);
        verify(resourceService).provisionResource("Oxygen Refill Unit", SILVER);
        verify(resourceService).provisionResource("Fitness Center", SILVER);
        verify(resourceService).provisionResource("Private Cabin", GOLD);
        verify(resourceService).provisionResource("Advanced Medical Bay", GOLD);
        verify(resourceService).provisionResource("Luxury Oxygen Pod", PLATINUM);
        verify(resourceService).provisionResource("VIP Recreation Deck", PLATINUM);
        verify(resourceService, times(9)).provisionResource(ArgumentMatchers.anyString(), ArgumentMatchers.any());
    }

    @Test
    void run_doesNothingWhenResourcesAlreadyExist() throws Exception {
        when(resourceRepository.count()).thenReturn(3L);

        seeder.run();

        verify(resourceService, never()).provisionResource(ArgumentMatchers.anyString(), ArgumentMatchers.any());
    }
}
