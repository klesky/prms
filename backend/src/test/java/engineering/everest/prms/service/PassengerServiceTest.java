package engineering.everest.prms.service;

import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.DuplicatePassengerException;
import engineering.everest.prms.exception.PassengerNotFoundException;
import engineering.everest.prms.repository.PassengerRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PassengerServiceTest {

    @Mock
    private PassengerRepository passengerRepository;

    @Mock
    private ResourceService resourceService;

    @InjectMocks
    private PassengerService passengerService;

    @Test
    void registerPassenger_persistsANewPassenger() {
        when(passengerRepository.existsById("kc-9")).thenReturn(false);
        when(passengerRepository.save(any(Passenger.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Passenger passenger = passengerService.registerPassenger("kc-9", "Naavin Balayah", SILVER);

        assertThat(passenger.getUsername()).isEqualTo("kc-9");
        assertThat(passenger.getMembershipLevel()).isEqualTo(SILVER);
    }

    @Test
    void registerPassenger_rejectsDuplicateRegistrationForTheSameUsername() {
        when(passengerRepository.existsById("kc-9")).thenReturn(true);

        assertThatThrownBy(() -> passengerService.registerPassenger("kc-9", "Naavin Balayah", SILVER))
            .isInstanceOf(DuplicatePassengerException.class);

        verify(passengerRepository, never()).save(any());
    }

    @Test
    void findAccessibleResourcesFor_delegatesToResourceServiceUsingThePassengersLevel() {
        Passenger passenger = Passenger.builder().username("kc-9").name("Naavin Balayah").membershipLevel(GOLD).build();
        when(passengerRepository.findById("kc-9")).thenReturn(Optional.of(passenger));
        List<Resource> expected = List.of(Resource.builder().name("Private Cabin").minRequiredLevel(GOLD).build());
        when(resourceService.findAccessibleTo(GOLD)).thenReturn(expected);

        List<Resource> result = passengerService.findAccessibleResourcesFor("kc-9");

        assertThat(result).isEqualTo(expected);
    }

    @Test
    void findAccessibleResourcesFor_throwsWhenPassengerDoesNotExist() {
        when(passengerRepository.findById("kc-9")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passengerService.findAccessibleResourcesFor("kc-9"))
            .isInstanceOf(PassengerNotFoundException.class);
    }

    @Test
    void changeMembershipLevel_updatesAnExistingPassengersLevel() {
        Passenger passenger = Passenger.builder().username("kc-9").name("Naavin Balayah").membershipLevel(SILVER).build();
        when(passengerRepository.findById("kc-9")).thenReturn(Optional.of(passenger));
        when(passengerRepository.save(any(Passenger.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Passenger result = passengerService.changeMembershipLevel("kc-9", GOLD);

        assertThat(result.getMembershipLevel()).isEqualTo(GOLD);
        verify(passengerRepository).save(passenger);
    }

    @Test
    void changeMembershipLevel_throwsWhenPassengerDoesNotExist() {
        when(passengerRepository.findById("kc-9")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> passengerService.changeMembershipLevel("kc-9", GOLD))
            .isInstanceOf(PassengerNotFoundException.class);
    }

    @Test
    void findAll_returnsEveryPassenger() {
        List<Passenger> expected = List.of(
            Passenger.builder().username("kc-9").name("Naavin Balayah").membershipLevel(SILVER).build(),
            Passenger.builder().username("kc-10").name("Someone Else").membershipLevel(GOLD).build());
        when(passengerRepository.findAll()).thenReturn(expected);

        assertThat(passengerService.findAll()).isEqualTo(expected);
    }
}
