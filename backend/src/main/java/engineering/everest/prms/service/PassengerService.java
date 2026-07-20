package engineering.everest.prms.service;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import engineering.everest.prms.entity.Resource;
import engineering.everest.prms.exception.DuplicatePassengerException;
import engineering.everest.prms.exception.PassengerNotFoundException;
import engineering.everest.prms.repository.PassengerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PassengerService {

    @Autowired
    private PassengerRepository passengerRepository;

    @Autowired
    private ResourceService resourceService;

    public Passenger registerPassenger(String username, String name, MembershipLevel membershipLevel) {
        if (passengerRepository.existsById(username)) {
            throw new DuplicatePassengerException(username);
        }
        return passengerRepository.save(Passenger.builder()
            .username(username)
            .name(name)
            .membershipLevel(membershipLevel)
            .build());
    }

    public Passenger findById(String username) {
        return passengerRepository.findById(username)
            .orElseThrow(() -> new PassengerNotFoundException(username));
    }

    public List<Resource> findAccessibleResourcesFor(String username) {
        Passenger passenger = findById(username);
        return resourceService.findAccessibleTo(passenger.getMembershipLevel());
    }

    public Passenger changeMembershipLevel(String username, MembershipLevel newLevel) {
        Passenger passenger = findById(username);
        passenger.changeMembershipLevel(newLevel);
        return passengerRepository.save(passenger);
    }
}
