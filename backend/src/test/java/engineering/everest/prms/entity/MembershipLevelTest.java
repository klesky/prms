package engineering.everest.prms.entity;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static engineering.everest.prms.entity.MembershipLevel.GOLD;
import static engineering.everest.prms.entity.MembershipLevel.PLATINUM;
import static engineering.everest.prms.entity.MembershipLevel.SILVER;
import static org.assertj.core.api.Assertions.assertThat;

class MembershipLevelTest {

    @ParameterizedTest
    @CsvSource({
        "SILVER, SILVER, true",
        "SILVER, GOLD, false",
        "SILVER, PLATINUM, false",
        "GOLD, SILVER, true",
        "GOLD, GOLD, true",
        "GOLD, PLATINUM, false",
        "PLATINUM, SILVER, true",
        "PLATINUM, GOLD, true",
        "PLATINUM, PLATINUM, true",
    })
    void grantsAccessTo_higherOrEqualTierInheritsLowerTierAccess(MembershipLevel passengerLevel,
                                                                   MembershipLevel requiredLevel,
                                                                   boolean expectedAccess) {
        assertThat(passengerLevel.grantsAccessTo(requiredLevel)).isEqualTo(expectedAccess);
    }
}
