package engineering.everest.prms.service;

import engineering.everest.prms.entity.CrewLead;
import engineering.everest.prms.exception.CrewLeadLimitExceededException;
import engineering.everest.prms.exception.DuplicateCrewLeadException;
import engineering.everest.prms.repository.CrewLeadRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrewLeadServiceTest {

    private static final int MAX_CREW_LEADS = 3;

    @Mock
    private CrewLeadRepository crewLeadRepository;

    @InjectMocks
    private CrewLeadService crewLeadService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(crewLeadService, "maxCrewLeads", MAX_CREW_LEADS);
    }

    @Test
    void registerCrewLead_persistsWhenUnderTheLimit() {
        when(crewLeadRepository.existsById("kc-1")).thenReturn(false);
        when(crewLeadRepository.count()).thenReturn(2L);
        when(crewLeadRepository.save(any(CrewLead.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CrewLead result = crewLeadService.registerCrewLead("kc-1", "Yun Yie Goh");

        assertThat(result.getUsername()).isEqualTo("kc-1");
        assertThat(result.getName()).isEqualTo("Yun Yie Goh");
        verify(crewLeadRepository, times(1)).save(any(CrewLead.class));
    }

    @Test
    void registerCrewLead_rejectsTheFourthCrewLead() {
        when(crewLeadRepository.existsById("kc-4")).thenReturn(false);
        when(crewLeadRepository.count()).thenReturn(3L);

        assertThatThrownBy(() -> crewLeadService.registerCrewLead("kc-4", "Someone Extra"))
            .isInstanceOf(CrewLeadLimitExceededException.class);

        verify(crewLeadRepository, never()).save(any());
    }

    @Test
    void registerCrewLead_rejectsDuplicateRegistrationForTheSameUsername() {
        when(crewLeadRepository.existsById("kc-1")).thenReturn(true);

        assertThatThrownBy(() -> crewLeadService.registerCrewLead("kc-1", "Yun Yie Goh"))
            .isInstanceOf(DuplicateCrewLeadException.class);

        verify(crewLeadRepository, never()).save(any());
    }
}
