package engineering.everest.prms.repository;

import engineering.everest.prms.entity.UsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UsageLogRepository extends JpaRepository<UsageLog, UUID> {
}
