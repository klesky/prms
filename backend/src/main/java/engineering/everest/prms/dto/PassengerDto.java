package engineering.everest.prms.dto;

import engineering.everest.prms.entity.MembershipLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class PassengerDto {

    @NotBlank
    private String username;

    @NotBlank
    private String name;

    @NotNull
    private MembershipLevel membershipLevel;
}
