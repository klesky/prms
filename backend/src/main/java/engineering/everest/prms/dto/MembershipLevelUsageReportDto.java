package engineering.everest.prms.dto;

import engineering.everest.prms.entity.MembershipLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MembershipLevelUsageReportDto {

    private MembershipLevel membershipLevel;
    private long passengerCount;
    private long usageCount;
}
