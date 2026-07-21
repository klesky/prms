package engineering.everest.prms.repository;

import engineering.everest.prms.entity.MembershipLevel;
import engineering.everest.prms.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UsageLogRepository extends JpaRepository<UsageLog, UUID> {

    void deleteByResourceId(UUID resourceId);

    List<UsageLog> findByPassenger_UsernameOrderByOccurredAtDesc(String username);

    long countByPassenger_MembershipLevel(MembershipLevel membershipLevel);
}
