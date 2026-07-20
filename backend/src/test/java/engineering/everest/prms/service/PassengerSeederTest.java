package engineering.everest.prms.service;

import engineering.everest.prms.repository.PassengerRepository;
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
class PassengerSeederTest {

    @Mock
    private PassengerRepository passengerRepository;

    @Mock
    private PassengerService passengerService;

    @InjectMocks
    private PassengerSeeder seeder;

    @Test
    void run_registersTheThreePassengersAcrossAllTiersWhenNoneExistYet() throws Exception {
        when(passengerRepository.count()).thenReturn(0L);

        seeder.run();

        verify(passengerService).registerPassenger("bn89820", "Naavin Balayah", SILVER);
        verify(passengerService).registerPassenger("mp89242", "Paul Singaraj Melvin Raj", GOLD);
        verify(passengerService).registerPassenger("zc90663", "Ze Yen Chai", PLATINUM);
        verify(passengerService, times(3)).registerPassenger(ArgumentMatchers.anyString(), ArgumentMatchers.anyString(),
            ArgumentMatchers.any());
    }

    @Test
    void run_doesNothingWhenPassengersAlreadyExist() throws Exception {
        when(passengerRepository.count()).thenReturn(3L);

        seeder.run();

        verify(passengerService, never()).registerPassenger(ArgumentMatchers.anyString(), ArgumentMatchers.anyString(),
            ArgumentMatchers.any());
    }
}
