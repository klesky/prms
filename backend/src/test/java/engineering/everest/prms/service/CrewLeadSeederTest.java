package engineering.everest.prms.service;

import engineering.everest.prms.repository.CrewLeadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrewLeadSeederTest {

    @Mock
    private CrewLeadRepository crewLeadRepository;

    @Mock
    private CrewLeadService crewLeadService;

    @InjectMocks
    private CrewLeadSeeder seeder;

    @Test
    void run_registersTheThreeCrewLeadsWhenNoneExistYet() throws Exception {
        when(crewLeadRepository.count()).thenReturn(0L);

        seeder.run();

        verify(crewLeadService).registerCrewLead("so90667", "Soon Yoong Ooi");
        verify(crewLeadService).registerCrewLead("yg91185", "Yun Yie Goh");
        verify(crewLeadService).registerCrewLead("mh91004", "Harris Fadhillah Mu'adzzam Shah");
        verify(crewLeadService, times(3)).registerCrewLead(ArgumentMatchers.anyString(), ArgumentMatchers.anyString());
    }

    @Test
    void run_doesNothingWhenCrewLeadsAlreadyExist() throws Exception {
        when(crewLeadRepository.count()).thenReturn(3L);

        seeder.run();

        verify(crewLeadService, never()).registerCrewLead(ArgumentMatchers.anyString(), ArgumentMatchers.anyString());
    }
}
