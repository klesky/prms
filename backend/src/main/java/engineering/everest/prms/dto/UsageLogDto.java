package engineering.everest.prms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsageLogDto {

    private UUID id;
    private String passengerUsername;
    private UUID resourceId;
    private String resourceName;
    private Instant occurredAt;
}
