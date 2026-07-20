package engineering.everest.prms.repository;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PassengerRepository extends JpaRepository<Passenger, String> {

    List<Passenger> findByMembershipLevel(MembershipLevel membershipLevel);
}
