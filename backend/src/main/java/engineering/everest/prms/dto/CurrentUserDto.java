package engineering.everest.prms.dto;

import engineering.everest.prms.entity.MembershipLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurrentUserDto {

    private String username;

    private String name;

    private List<String> roles;

    private MembershipLevel membershipLevel;
}
